# Run the worker without Docker (Python 3.10)

Use this when Docker Desktop isn’t available (e.g. virtualization disabled) and you have **Python 3.10** on the machine (e.g. your laptop). The app on the server will call this worker at your laptop’s IP.

---

## 1. Python 3.10

- Install from [python.org](https://www.python.org/downloads/) or ensure it’s on PATH.
- Check:
  ```powershell
  py -3.10 --version
  ```
  or
  ```powershell
  python --version
  ```
  You should see `Python 3.10.x`.

---

## 2. Ollama (local LLM)

- Download and install: [ollama.com/download](https://ollama.com/download).
- Start Ollama (it usually runs in the background after install).
- Pull the model (once):
  ```powershell
  ollama pull llama3.1
  ```

---

## 3. Worker setup on your laptop

Open PowerShell and go to the worker folder:

```powershell
cd C:\Users\avash\Development\procurement-tool\worker
```

Create a virtual environment and install dependencies:

```powershell
py -3.10 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
pip install -r requirements-crewai.txt
```

If you don’t have `py -3.10`, use the path to your Python 3.10 executable instead, e.g.:

```powershell
C:\Python310\python.exe -m venv .venv
```

---

## 4. Environment file

Create a `.env` in the `worker` folder (copy from `env.example` if needed). At least:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
API_HOST=0.0.0.0
API_PORT=8001
UPLOAD_DIR=./uploads
```

`API_HOST=0.0.0.0` lets the server reach the worker at your laptop’s IP (e.g. `http://192.168.0.34:8001`).

---

## 5. Run the worker

With the same venv activated:

```powershell
python main.py
```

You should see something like:

- `Uvicorn running on http://0.0.0.0:8001`
- Ollama/CrewAI messages in the log

The worker is then available at:

- On the laptop: `http://localhost:8001`
- From the server (same network): `http://192.168.0.34:8001` (use your laptop’s actual IP)

---

## 6. App on the server

On the **server** where the Next.js app runs, set in its `.env`:

```env
WORKER_API_URL=http://YOUR_LAPTOP_IP:8001
```

e.g. `WORKER_API_URL=http://192.168.0.34:8001`. Restart the Next.js app after changing `.env`.

---

## 7. Firewall (Windows)

If the server can’t reach the worker, allow inbound TCP 8001 on the laptop:

1. Windows Defender Firewall → Advanced settings → Inbound Rules.
2. New Rule → Port → TCP, 8001 → Allow the connection → apply to your profile(s).

---

## Quick test from the laptop

- Health: open `http://localhost:8001/health` in a browser.
- Bank verification: `http://localhost:8001/docs` → **POST /verify-bank-statement** → upload a PDF.

If that works, the server can use `http://<laptop-IP>:8001` the same way.

---

## "Failed to fetch" / CORS

**Symptom:** Browser shows "Failed to fetch" with CORS or URL scheme when you try to verify a bank document.

**Cause:** The browser is either calling the worker at `http://192.168.0.34:8001` from a different origin (e.g. the app on the server), or the request URL is invalid (e.g. `undefined` in the path).

**Fix:**

1. **Test the worker only from the laptop (same machine as the worker)**  
   Open **http://localhost:8001/docs** in a browser **on the laptop**. Use "Try it out" and upload a PDF there. Do **not** open `http://192.168.0.34:8001/docs` from the server or another PC unless you’re sure the network allows it and you’re okay with CORS.

2. **From the app (server): use the proxy, never the worker URL in the browser**  
   The app’s frontend must call **`/api/worker/verify-bank-statement`** (relative URL, same origin as the app). It must **not** call `http://192.168.0.34:8001/...` from the browser.  
   On the **server**, set in `.env`: `WORKER_API_URL=http://192.168.0.34:8001` so the **server** can reach the worker when the browser calls the proxy.

3. **If the app is on HTTPS**  
   Opening the worker at `http://192.168.0.34:8001` from an HTTPS page can be blocked (mixed content). Again: test the worker at **http://localhost:8001** on the laptop; from the app, use only the proxy.
