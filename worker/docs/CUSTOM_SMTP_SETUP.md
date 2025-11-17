# Custom SMTP Server Configuration

## Your Current Setup
- **SMTP Host**: `mail.theinnoverse.co.za`
- **Port**: `465` (SSL/TLS)
- **Security**: SSL/TLS (not STARTTLS)

## Configuration Steps

### 1. Update .env File
Edit your `worker/.env` file with your actual SMTP credentials:

```bash
# SMTP Configuration
SMTP_HOST="mail.theinnoverse.co.za"
SMTP_PORT="465"
SMTP_SECURE="true"

# SMTP Authentication - ADD YOUR ACTUAL CREDENTIALS
SMTP_USER="your_username@theinnoverse.co.za"
SMTP_PASS="your_password"
SMTP_FROM="your_email@theinnoverse.co.za"
```

### 2. Code Changes Made
✅ **Fixed email_notifier.py**: Now properly handles SSL/TLS for port 465
✅ **Updated config.py**: Set default values for your custom SMTP server

### 3. Testing SMTP Connection
Create a test script to verify your SMTP settings:

```python
# test_smtp.py
import smtplib
from email.mime.text import MIMEText

def test_smtp():
    smtp_host = "mail.theinnoverse.co.za"
    smtp_port = 465
    smtp_user = "your_username@theinnoverse.co.za"
    smtp_pass = "your_password"
    
    try:
        with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
            server.login(smtp_user, smtp_pass)
            print("✅ SMTP connection successful!")
            return True
    except Exception as e:
        print(f"❌ SMTP connection failed: {e}")
        return False

if __name__ == "__main__":
    test_smtp()
```

### 4. Common Issues & Solutions

#### Authentication Failed
- Verify username/password are correct
- Check if your email provider requires app-specific passwords
- Ensure account is not locked or suspended

#### Connection Refused
- Verify the SMTP host and port are correct
- Check firewall settings
- Ensure the server is accessible from your network

#### SSL/TLS Issues
- Port 465 uses SSL/TLS directly (not STARTTLS)
- Port 587 uses STARTTLS
- Make sure you're using the correct port for your server

### 5. Docker Environment Variables
When running with Docker, ensure these environment variables are set:

```yaml
environment:
  - SMTP_HOST=mail.theinnoverse.co.za
  - SMTP_PORT=465
  - SMTP_USER=your_username@theinnoverse.co.za
  - SMTP_PASS=your_password
  - SMTP_FROM=your_email@theinnoverse.co.za
```

## Next Steps
1. Update your `.env` file with actual credentials
2. Test the SMTP connection
3. Start Docker services: `docker-compose up -d`
4. Check logs: `docker-compose logs worker`






