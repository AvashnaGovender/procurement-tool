# Email Setup Guide

This guide explains how to configure email functionality in the procurement tool.

## SMTP Configuration

The email system uses Nodemailer with SMTP to send emails. The configuration is stored in `data/smtp-config.json`.

### Gmail Setup

1. **Enable 2-Factor Authentication** on your Google Account
2. **Generate an App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Update the configuration** in `data/smtp-config.json`:
   ```json
   {
     "host": "smtp.gmail.com",
     "port": 587,
     "user": "your-email@gmail.com",
     "pass": "your-app-password",
     "fromEmail": "your-email@gmail.com",
     "secure": false,
     "companyName": "Your Company Name",
     "companyWebsite": "https://yourcompany.com"
   }
   ```

### Other SMTP Providers

For other providers (Outlook, Yahoo, custom SMTP), update the configuration accordingly:

```json
{
  "host": "smtp.your-provider.com",
  "port": 587,
  "user": "your-email@domain.com",
  "pass": "your-password",
  "fromEmail": "your-email@domain.com",
  "secure": false,
  "companyName": "Your Company Name",
  "companyWebsite": "https://yourcompany.com"
}
```

## Email Templates

Email templates are stored in `data/email-template.json`. The system supports template variables:

- `{supplierName}` - Name of the supplier
- `{companyName}` - Your company name
- `{businessType}` - Type of business
- `{companyWebsite}` - Your company website

## Testing Email Configuration

1. **Test the configuration**: Visit `/api/test-email` to verify your SMTP settings
2. **Send a test email**: Use the supplier onboarding form to send a test email

## Troubleshooting

### Common Issues

1. **Authentication Error**: 
   - For Gmail: Use an App Password instead of your regular password
   - Enable "Less secure app access" (not recommended for production)

2. **Connection Timeout**:
   - Check your firewall settings
   - Verify the SMTP host and port are correct

3. **500 Internal Server Error**:
   - Check the server logs for detailed error messages
   - Verify all required fields are present in the configuration

### Debug Mode

Enable debug logging by adding this to your email configuration:

```json
{
  "debug": true,
  "logger": true
}
```

## Security Notes

- Never commit email passwords to version control
- Use environment variables for production deployments
- Consider using email service providers like SendGrid or Resend for production
- Regularly rotate app passwords and API keys

## API Endpoints

- `POST /api/send-email` - Send an email
- `GET /api/test-email` - Test email configuration
- `GET /api/settings/smtp` - Get SMTP configuration
- `POST /api/settings/smtp` - Update SMTP configuration
- `GET /api/settings/email-template` - Get email template
- `POST /api/settings/email-template` - Update email template 