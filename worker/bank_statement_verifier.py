"""Bank statement verification: extract via CrewAI agent, validate via Python rules."""
import json
import re
import logging
from datetime import datetime
from typing import Any

from dateutil.relativedelta import relativedelta
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# Max characters of PDF text to send to the LLM (keeps prompts small and responses faster)
_MAX_EXTRACTION_TEXT_LENGTH = 8000


# ----------------------------
# OUTPUT SCHEMA
# ----------------------------
class BankStatementExtraction(BaseModel):
    """Structured extraction from bank statement text."""

    bank_name: str | None = Field(default=None)
    account_number: str | None = Field(default=None)
    statement_date: str | None = Field(
        default=None, description="ISO format YYYY-MM-DD if possible"
    )
    account_holder: str | None = Field(default=None)
    document_type: str | None = Field(default=None)
    confidence: float | None = Field(default=None)


# ----------------------------
# PDF TEXT EXTRACTION
# ----------------------------
def _extract_pdf_text(file_path: str) -> str:
    """Extract raw text from PDF using existing OCRExtractor."""
    from ocr_extractor import OCRExtractor

    extractor = OCRExtractor()
    result = extractor.extract_from_pdf(file_path)
    return result.get("text", "") or ""


# ----------------------------
# ACCOUNT NUMBER FROM KEYWORDS (deterministic override)
# ----------------------------
# Patterns for "Acc No", "Account number", "Accountnumber" etc. Capture digits after (often 9–11 digits).
_ACCOUNT_NUMBER_PATTERNS = [
    re.compile(r"Account\s*number\s*[:\s]*(\d[\d\s]{6,18})", re.IGNORECASE),
    re.compile(r"Accountnumber\s*(\d[\d\s]{6,18})", re.IGNORECASE),
    re.compile(r"Acc(?:ount)?\s*No\.?\s*[:\s]*(\d[\d\s]{6,18})", re.IGNORECASE),
    re.compile(r"Account\s*No\.?\s*[:\s]*(\d[\d\s]{6,18})", re.IGNORECASE),
]


def _extract_account_number_from_text(raw_text: str) -> str | None:
    """Find account number in raw text using keyword patterns. Returns normalized digits or None."""
    if not raw_text or not isinstance(raw_text, str):
        return None
    text = raw_text.strip()
    for pat in _ACCOUNT_NUMBER_PATTERNS:
        m = pat.search(text)
        if m:
            num = re.sub(r"\s+", "", m.group(1).strip())
            if len(num) >= 8 and len(num) <= 18:  # plausible length
                return num
    return None


# ----------------------------
# DIRECT OLLAMA (one call, fast – no CrewAI)
# ----------------------------
def _extract_via_ollama_direct(raw_text: str) -> dict | None:
    """Call Ollama /api/generate once with an extraction prompt. Returns parsed dict or None."""
    try:
        from config import settings
        import httpx
    except ImportError:
        return None

    text = raw_text.strip()
    if len(text) > _MAX_EXTRACTION_TEXT_LENGTH:
        text = text[:_MAX_EXTRACTION_TEXT_LENGTH] + "\n\n[Text truncated for length.]"

    prompt = f"""From this bank letter or statement text, extract ONLY a JSON object with these keys: bank_name, account_number, statement_date, account_holder, document_type, confidence.
Rules: document_type must be "bank_statement" or "bank_confirmation_letter". statement_date as YYYY-MM-DD if possible. No other text, only the JSON object.

TEXT:
{text}"""

    url = f"{settings.ollama_base_url.rstrip('/')}/api/generate"
    payload = {"model": settings.ollama_model, "prompt": prompt, "stream": False}

    try:
        with httpx.Client(timeout=90.0) as client:
            r = client.post(url, json=payload)
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        logger.warning("Direct Ollama extraction failed: %s", e)
        return None

    response_text = (data.get("response") or "").strip()
    if not response_text:
        return None

    # Parse JSON from response (may be wrapped in markdown or have extra text)
    code_block = re.search(r"```(?:json)?\s*([\s\S]*?)```", response_text)
    if code_block:
        response_text = code_block.group(1).strip()
    start = response_text.find("{")
    end = response_text.rfind("}")
    if start != -1 and end != -1 and end > start:
        response_text = response_text[start : end + 1]
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        pass
    try:
        return json.loads((data.get("response") or "").strip())
    except json.JSONDecodeError:
        return None


# ----------------------------
# CREW AI AGENT & TASK
# ----------------------------
def _get_extractor_agent():
    """Build or return the Bank Statement Extraction agent (requires CrewAI + Ollama)."""
    from crew_agents import Agent, CREWAI_AVAILABLE

    if not CREWAI_AVAILABLE:
        return None

    # Use CrewAI's native LLM with Ollama so we don't go through the OpenAI provider (avoids /v1 path 404)
    try:
        from crewai import LLM
        from config import settings
        llm = LLM(
            model=f"ollama/{settings.ollama_model}",
            base_url=settings.ollama_base_url.rstrip("/"),
        )
    except Exception as e:
        logger.warning(f"Could not create CrewAI Ollama LLM: {e}")
        return None

    return Agent(
        role="Bank Statement Extraction Specialist",
        goal="Extract key verification details from a bank statement PDF accurately.",
        backstory=(
            "You are precise at reading financial documents and extracting structured data "
            "such as bank name, account number, statement date, and account holder."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )


def _build_extraction_task(raw_text: str):
    """Build a CrewAI task that extracts bank statement fields from raw text."""
    from crew_agents import Task

    agent = _get_extractor_agent()
    if agent is None:
        return None, None

    # Truncate to avoid huge prompts and slow timeouts
    text = raw_text.strip()
    if len(text) > _MAX_EXTRACTION_TEXT_LENGTH:
        text = text[:_MAX_EXTRACTION_TEXT_LENGTH] + "\n\n[Text truncated for length.]"

    task = Task(
        description=f"""
You are given raw text extracted from a PDF bank statement.

Extract the following fields into a JSON object:
- bank_name (string or null)
- account_number (string or null)
- statement_date (string, YYYY-MM-DD if possible, or null)
- account_holder (string or null)
- document_type: use "bank_statement" or "bank_confirmation_letter" only
- confidence (number 0-1 or null)

Rules:
- Return only valid JSON, no other text.
- document_type: "bank_confirmation_letter" for letters confirming account details; "bank_statement" for account statements.
- statement_date: document date or letter date; use YYYY-MM-DD.
- Do not invent values. If a field is missing, use null.

RAW TEXT:
{text}
""",
        agent=agent,
        expected_output="A single JSON object with keys: bank_name, account_number, statement_date, account_holder, document_type, confidence.",
        output_pydantic=BankStatementExtraction,
    )
    return agent, task


def _run_extraction_crew(raw_text: str) -> dict | None:
    """Run the extraction crew and return parsed JSON dict, or None on failure."""
    from crew_agents import Crew, Process, CREWAI_AVAILABLE

    if not CREWAI_AVAILABLE:
        return None

    agent, task = _build_extraction_task(raw_text)
    if agent is None or task is None:
        return None

    crew = Crew(
        agents=[agent],
        tasks=[task],
        process=Process.sequential,
        verbose=True,
    )
    result = crew.kickoff()

    # Prefer CrewAI's structured output if available
    if hasattr(result, "pydantic") and result.pydantic is not None:
        out = result.pydantic
        return out.model_dump() if hasattr(out, "model_dump") else out.dict()
    if hasattr(result, "json_dict") and result.json_dict is not None:
        return result.json_dict if isinstance(result.json_dict, dict) else dict(result.json_dict)

    # Fall back to parsing raw string
    if hasattr(result, "raw"):
        result_text = result.raw if isinstance(result.raw, str) else str(result.raw)
    elif hasattr(result, "output") and result.output is not None:
        result_text = result.output if isinstance(result.output, str) else str(result.output)
    else:
        result_text = str(result)

    result_text = (result_text or "").strip()
    if not result_text:
        logger.warning("Crew returned empty output")
        return None

    code_block = re.search(r"```(?:json)?\s*([\s\S]*?)```", result_text)
    if code_block:
        result_text = code_block.group(1).strip()

    try:
        return json.loads(result_text)
    except json.JSONDecodeError:
        pass

    start = result_text.find("{")
    end = result_text.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(result_text[start : end + 1])
        except json.JSONDecodeError:
            pass

    logger.warning("Failed to parse crew output as JSON. Raw output (first 500 chars): %s", result_text[:500])
    return None


# ----------------------------
# DATE PARSING
# ----------------------------
def parse_date(date_str: str | None) -> datetime | None:
    """Parse common date formats; return None if unparseable."""
    if not date_str or not isinstance(date_str, str):
        return None
    date_str = date_str.strip()
    # Handle ISO 8601 (e.g. 2025-04-04T00:00:00.000Z) by using date part only
    if "T" in date_str:
        date_str = date_str.split("T")[0]
    formats = [
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%Y/%m/%d",
        "%d %b %Y",
        "%d %B %Y",
        "%b %d %Y",
        "%B %d %Y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    return None


# ----------------------------
# VALIDATION
# ----------------------------
def validate_statement(data: dict | None) -> dict:
    """
    Apply deterministic compliance rules. Returns dict with passed, reasons, extracted.
    """
    reasons = []
    passed = True
    extracted = data or {}

    if not data:
        return {"passed": False, "reasons": ["No extraction data"], "extracted": {}}

    bank_name = data.get("bank_name")
    account_number = data.get("account_number")
    statement_date_raw = data.get("statement_date")
    document_type = data.get("document_type")

    if not bank_name or (isinstance(bank_name, str) and not bank_name.strip()):
        passed = False
        reasons.append("Bank name not found.")

    if not account_number or (
        isinstance(account_number, str) and not account_number.strip()
    ):
        passed = False
        reasons.append("Account number not found.")

    # Accept bank statements or bank confirmation letters
    if document_type not in ("bank_statement", "bank_confirmation_letter"):
        passed = False
        reasons.append("Document is not a bank statement or bank confirmation letter.")

    statement_date = parse_date(statement_date_raw)
    if not statement_date:
        passed = False
        reasons.append("Statement date could not be parsed.")
    else:
        cutoff_date = datetime.today() - relativedelta(months=3)
        if statement_date < cutoff_date:
            passed = False
            reasons.append("Statement is older than 3 months.")

    return {
        "passed": passed,
        "reasons": reasons,
        "extracted": extracted,
    }


# ----------------------------
# ENTRY POINT
# ----------------------------
def verify_bank_statement(file_path: str) -> dict:
    """
    Extract text from PDF, run Bank Statement Extractor agent, then validate with Python rules.
    Returns dict with keys: passed, reasons, extracted.
    """
    try:
        raw_text = _extract_pdf_text(file_path)
    except Exception as e:
        logger.exception(f"PDF text extraction failed: {e}")
        return {
            "passed": False,
            "reasons": [f"PDF text extraction failed: {str(e)}"],
            "extracted": None,
        }

    if not raw_text or len(raw_text.strip()) < 10:
        return {
            "passed": False,
            "reasons": ["PDF produced no or insufficient text for analysis."],
            "extracted": None,
        }

    # Prefer direct Ollama (one call, ~30–60s). Fall back to CrewAI if that fails.
    extracted = _extract_via_ollama_direct(raw_text)
    if extracted is None:
        from crew_agents import CREWAI_AVAILABLE
        if CREWAI_AVAILABLE:
            extracted = _run_extraction_crew(raw_text)
        if extracted is None:
            return {
                "passed": False,
                "reasons": ["Extraction failed (Ollama and CrewAI)."],
                "extracted": None,
            }

    # Override account_number with keyword-based extraction when we find a match (more reliable than LLM)
    account_from_text = _extract_account_number_from_text(raw_text)
    if account_from_text:
        extracted["account_number"] = account_from_text

    # Sanitize confidence: must be a number in [0, 1]; LLMs sometimes put wrong values (e.g. "20020")
    c = extracted.get("confidence")
    if c is not None:
        try:
            val = float(c) if not isinstance(c, (int, float)) else c
            if not (0 <= val <= 1):
                val = None
        except (TypeError, ValueError):
            val = None
        extracted["confidence"] = val

    return validate_statement(extracted)


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python bank_statement_verifier.py <path-to-bank-statement.pdf>")
        sys.exit(1)
    path = sys.argv[1]
    if not path.lower().endswith(".pdf"):
        print("Error: File must be a PDF.")
        sys.exit(1)
    result = verify_bank_statement(path)
    print(json.dumps(result, indent=2))
