#!/usr/bin/env python3
"""Test script for custom SMTP configuration."""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings

def test_smtp_connection():
    """Test SMTP connection with current settings."""
    print("🔧 Testing SMTP Connection...")
    print(f"Host: {settings.smtp_host}")
    print(f"Port: {settings.smtp_port}")
    print(f"User: {settings.smtp_user}")
    print(f"From: {settings.smtp_from}")
    print("-" * 50)
    
    try:
        # Test connection
        if settings.smtp_port == 465:
            print("Using SSL/TLS connection...")
            with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port) as server:
                print("✅ Connected to SMTP server")
                server.login(settings.smtp_user, settings.smtp_pass)
                print("✅ Authentication successful")
        else:
            print("Using STARTTLS connection...")
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                print("✅ Connected to SMTP server")
                server.starttls()
                print("✅ STARTTLS successful")
                server.login(settings.smtp_user, settings.smtp_pass)
                print("✅ Authentication successful")
        
        print("\n🎉 SMTP configuration is working correctly!")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ Authentication failed: {e}")
        print("💡 Check your SMTP_USER and SMTP_PASS in .env file")
        return False
        
    except smtplib.SMTPConnectError as e:
        print(f"❌ Connection failed: {e}")
        print("💡 Check your SMTP_HOST and SMTP_PORT in .env file")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_send_email():
    """Test sending a test email."""
    if not test_smtp_connection():
        return False
    
    print("\n📧 Testing email sending...")
    
    try:
        # Create test message
        msg = MIMEMultipart()
        msg['From'] = settings.smtp_from
        msg['To'] = settings.smtp_from  # Send to self for testing
        msg['Subject'] = "SMTP Test - Procurement Worker"
        
        body = """
        This is a test email from the Procurement Worker service.
        
        If you receive this email, your SMTP configuration is working correctly!
        
        Test completed successfully.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        if settings.smtp_port == 465:
            with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port) as server:
                server.login(settings.smtp_user, settings.smtp_pass)
                server.send_message(msg)
        else:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_pass)
                server.send_message(msg)
        
        print("✅ Test email sent successfully!")
        print(f"📬 Check your inbox at: {settings.smtp_from}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send test email: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Procurement Worker - SMTP Test")
    print("=" * 50)
    
    # Check if credentials are set
    if not settings.smtp_user or not settings.smtp_pass:
        print("⚠️  SMTP credentials not configured!")
        print("Please update your .env file with:")
        print("SMTP_USER=your_username@theinnoverse.co.za")
        print("SMTP_PASS=your_password")
        print("SMTP_FROM=your_email@theinnoverse.co.za")
        exit(1)
    
    # Test connection
    if test_smtp_connection():
        # Ask if user wants to send test email
        response = input("\n📧 Send test email? (y/n): ").lower().strip()
        if response == 'y':
            test_send_email()
    
    print("\n✨ Test completed!")






