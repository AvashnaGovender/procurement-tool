"""Email notification system for admin alerts."""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, List
from config import settings
import logging

logger = logging.getLogger(__name__)


class EmailNotifier:
    """Email notification service."""
    
    def __init__(self):
        """Initialize email notifier."""
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_user = settings.smtp_user
        self.smtp_pass = settings.smtp_pass
        self.smtp_from = settings.smtp_from
    
    def send_admin_notification(self, 
                              admin_emails: List[str], 
                              submission_id: str, 
                              supplier_name: str,
                              decision_summary: str,
                              risk_score: float,
                              review_url: str) -> bool:
        """Send notification to admin about completed processing."""
        try:
            subject = f"Supplier Submission Review Required - {supplier_name}"
            
            # Create HTML email content
            html_content = f"""
            <html>
            <body>
                <h2>Supplier Submission Processing Complete</h2>
                
                <p><strong>Submission ID:</strong> {submission_id}</p>
                <p><strong>Supplier:</strong> {supplier_name}</p>
                <p><strong>Risk Score:</strong> {risk_score}/100</p>
                
                <h3>Decision Summary</h3>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                    {decision_summary.replace(chr(10), '<br>')}
                </div>
                
                <h3>Next Steps</h3>
                <p>Please review the submission and make a final decision:</p>
                <p><a href="{review_url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Submission</a></p>
                
                <hr>
                <p><small>This is an automated notification from the Procurement System.</small></p>
            </body>
            </html>
            """
            
            # Create plain text version
            text_content = f"""
            Supplier Submission Processing Complete
            
            Submission ID: {submission_id}
            Supplier: {supplier_name}
            Risk Score: {risk_score}/100
            
            Decision Summary:
            {decision_summary}
            
            Next Steps:
            Please review the submission and make a final decision.
            Review URL: {review_url}
            
            This is an automated notification from the Procurement System.
            """
            
            # Send email to each admin
            for admin_email in admin_emails:
                self._send_email(
                    to_email=admin_email,
                    subject=subject,
                    html_content=html_content,
                    text_content=text_content
                )
            
            logger.info(f"Admin notification sent for submission {submission_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send admin notification: {e}")
            return False
    
    def send_supplier_notification(self, 
                                 supplier_email: str, 
                                 supplier_name: str,
                                 submission_id: str,
                                 status: str,
                                 message: str) -> bool:
        """Send notification to supplier about submission status."""
        try:
            subject = f"Your Supplier Application Status Update"
            
            html_content = f"""
            <html>
            <body>
                <h2>Supplier Application Update</h2>
                
                <p>Dear {supplier_name},</p>
                
                <p>Your supplier application (ID: {submission_id}) has been processed.</p>
                
                <h3>Status: {status}</h3>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                    {message.replace(chr(10), '<br>')}
                </div>
                
                <p>If you have any questions, please contact our procurement team.</p>
                
                <hr>
                <p><small>This is an automated notification from the Procurement System.</small></p>
            </body>
            </html>
            """
            
            text_content = f"""
            Supplier Application Update
            
            Dear {supplier_name},
            
            Your supplier application (ID: {submission_id}) has been processed.
            
            Status: {status}
            
            {message}
            
            If you have any questions, please contact our procurement team.
            
            This is an automated notification from the Procurement System.
            """
            
            self._send_email(
                to_email=supplier_email,
                subject=subject,
                html_content=html_content,
                text_content=text_content
            )
            
            logger.info(f"Supplier notification sent for submission {submission_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send supplier notification: {e}")
            return False
    
    def _send_email(self, to_email: str, subject: str, html_content: str, text_content: str) -> bool:
        """Send email using SMTP."""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.smtp_from
            msg['To'] = to_email
            
            # Add text and HTML parts
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            
            msg.attach(text_part)
            msg.attach(html_part)
            
            # Send email
            # Check if we should use SSL/TLS (port 465) or STARTTLS (port 587)
            if self.smtp_port == 465:
                # Use SSL/TLS for port 465
                with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port) as server:
                    server.login(self.smtp_user, self.smtp_pass)
                    server.send_message(msg)
            else:
                # Use STARTTLS for port 587
                with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_pass)
                    server.send_message(msg)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

