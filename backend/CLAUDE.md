# Email Configuration Guide

## Email Service Options

The application supports two email service options:

1. **Nodemailer with SMTP** (default)
2. **SendGrid API** (recommended)

To configure which service to use, set the `EMAIL_SERVICE_TYPE` variable in your .env file:
```
# Options: nodemailer or sendgrid
EMAIL_SERVICE_TYPE=sendgrid
```

## Gmail SMTP Configuration

When using Gmail with SMTP, you need to use an "App Password" instead of your regular password due to Google's security policies.

### Steps to set up Gmail App Password:

1. Go to your Google Account at https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled
3. Go to "App passwords" section
4. Select "Mail" or "Other" from "Select app" dropdown
5. Copy the 16-character password Google generates (without spaces)

### Update your .env file for Nodemailer:

```
EMAIL_SERVICE_TYPE=nodemailer
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM=your-gmail-address@gmail.com
EMAIL_SECURE=true
```

### Important Notes for Gmail SMTP:

- Your EMAIL_USER value must exactly match your Gmail account
- The "Less secure app access" option has been discontinued by Google and will not work
- If using Google Workspace, ensure your admin hasn't restricted SMTP access

## SendGrid Configuration (Recommended)

SendGrid provides a more reliable email delivery service with better deliverability rates.

### Steps to set up SendGrid:

1. Sign up for a free SendGrid account at https://sendgrid.com/
2. Create an API Key with full "Mail Send" access 
3. Verify your sender identity (required for sending emails)

### Update your .env file for SendGrid:

```
EMAIL_SERVICE_TYPE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=your-verified-email@yourdomain.com
```

## Mail Service Testing

- To test Nodemailer: Run `node backend/util/mail-test.js`
- To test SendGrid service: Run `node backend/util/sendgrid-test.js`
- To test SendGrid API directly: Run `node backend/test-sendgrid.js`

## Email Templates

Email templates are maintained in both service implementations:
- Nodemailer templates: `backend/services/mail.service.js`
- SendGrid templates: `backend/services/sendgrid.service.js`

## Nodemailer Configuration

Current version: 6.10.1

### TLS/SSL Settings:

The mail service is configured to work with various mail servers, including those with older SSL/TLS configurations. Key settings:

```javascript
tls: {
  rejectUnauthorized: false,
  minVersion: 'TLSv1',
  maxVersion: 'TLSv1.3',
  ciphers: 'HIGH:MEDIUM:!aNULL:!MD5:!RC4',
  secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT
}
```

## Other SMTP Service Options

If neither Gmail nor SendGrid works for your needs, consider these alternatives:
- Amazon SES
- Mailgun
- SMTP2GO
- Postmark

## Common Issues and Solutions

1. **Authentication Failure**: 
   - For Gmail: Make sure you're using an App Password, not your regular password
   - For SendGrid: Verify your API key has proper permissions

2. **Connection Refused**: 
   - Check your firewall settings 
   - Try a different port (587 instead of 465)
   - Try using SendGrid instead of SMTP

3. **TLS Errors**: 
   - The application is configured to accept less secure TLS options for compatibility
   - SendGrid API bypasses many TLS issues

4. **Timeout Issues**: 
   - Increase timeout settings
   - Check network connectivity
   - Try SendGrid API which is generally more reliable