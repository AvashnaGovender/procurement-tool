#!/usr/bin/env python3
"""Simple SMTP test without dependencies."""

import smtplib
import os

def test_smtp_connection():
    """Test SMTP connection with environment variables."""
    print("Testing SMTP Connection...")
    
    # Get environment variables
    smtp_host = os.getenv('SMTP_HOST', 'mail.theinnoverse.co.za')
    smtp_port = int(os.getenv('SMTP_PORT', '465'))
    smtp_user = os.getenv('SMTP_USER', '')
    smtp_pass = os.getenv('SMTP_PASS', '')
    smtp_from = os.getenv('SMTP_FROM', '')
    
    print(f"Host: {smtp_host}")
    print(f"Port: {smtp_port}")
    print(f"User: {smtp_user}")
    print(f"From: {smtp_from}")
    print("-" * 50)
    
    if not smtp_user or not smtp_pass:
        print("WARNING: SMTP credentials not configured!")
        print("Please update your .env file with:")
        print("SMTP_USER=your_username@theinnoverse.co.za")
        print("SMTP_PASS=your_password")
        print("SMTP_FROM=your_email@theinnoverse.co.za")
        return False
    
    try:
        # Test connection
        if smtp_port == 465:
            print("Using SSL/TLS connection...")
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
                print("SUCCESS: Connected to SMTP server")
                server.login(smtp_user, smtp_pass)
                print("SUCCESS: Authentication successful")
        else:
            print("Using STARTTLS connection...")
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                print("SUCCESS: Connected to SMTP server")
                server.starttls()
                print("SUCCESS: STARTTLS successful")
                server.login(smtp_user, smtp_pass)
                print("SUCCESS: Authentication successful")
        
        print("\nSUCCESS: SMTP configuration is working correctly!")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"ERROR: Authentication failed: {e}")
        print("TIP: Check your SMTP_USER and SMTP_PASS in .env file")
        return False
        
    except smtplib.SMTPConnectError as e:
        print(f"ERROR: Connection failed: {e}")
        print("TIP: Check your SMTP_HOST and SMTP_PORT in .env file")
        return False
        
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("Procurement Worker - Simple SMTP Test")
    print("=" * 50)
    
    # Load environment variables from .env file if it exists
    env_file = ".env"
    if os.path.exists(env_file):
        print("Loading environment from .env file...")
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    # Remove quotes if present
                    value = value.strip('"\'')
                    os.environ[key.strip()] = value
    
    test_smtp_connection()
    print("\nTest completed!")
