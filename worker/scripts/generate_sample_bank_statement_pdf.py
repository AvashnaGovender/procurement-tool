"""Generate a minimal sample bank statement PDF for testing the verifier.
Run once: pip install reportlab
Then: python scripts/generate_sample_bank_statement_pdf.py
Output: sample_bank_statement.pdf in the current directory.
"""
import sys
from pathlib import Path

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
except ImportError:
    print("Install reportlab first: pip install reportlab")
    sys.exit(1)

# Text that looks like a bank statement so the extractor can find fields
LINES = [
    "FNB - First National Bank",
    "Statement of Account",
    "",
    "Account Holder: John Doe",
    "Account Number: 12345678901",
    "Branch: Sandton",
    "",
    "Statement Date: 28 February 2026",
    "Statement Period: 01 Jan 2026 to 28 Feb 2026",
    "",
    "This is a bank statement for verification purposes.",
    "Document Type: Bank Statement",
]

OUTPUT = Path(__file__).resolve().parent.parent / "sample_bank_statement.pdf"


def main():
    c = canvas.Canvas(str(OUTPUT), pagesize=A4)
    width, height = A4
    y = height - 80
    for line in LINES:
        c.drawString(72, y, line)
        y -= 22
    c.save()
    print(f"Created: {OUTPUT}")
    print("Test with: curl -X POST http://localhost:8001/verify-bank-statement -F \"file=@{}\"".format(OUTPUT.name))


if __name__ == "__main__":
    main()
