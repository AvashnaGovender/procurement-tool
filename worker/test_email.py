#!/usr/bin/env python3
"""Test email functionality directly."""

import os
import sys
from email_notifier import EmailNotifier

def test_email():
    """Test sending an email notification."""
    try:
        print("Testing email notification...")
        
        # Create email notifier
        email_notifier = EmailNotifier()
        
        # Test supplier notification
        success = email_notifier.send_supplier_notification(
            supplier_email="agovender@theinnoverse.co.za",
            supplier_name="Test Company Ltd",
            submission_id="TEST-EMAIL-001",
            status="completed",
            message="Your document processing is complete. Document approved for further processing."
        )
        
        if success:
            print("✅ Email sent successfully!")
        else:
            print("❌ Email sending failed!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_email()






