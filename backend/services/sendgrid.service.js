const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');

dotenv.config();

// SendGrid API anahtarını ayarla
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// E-posta gönderimi yapan ana metot
const sendEmail = async (options) => {
  try {
    console.log('============ SENDGRID E-POSTA GÖNDERİM BAŞLATILDI ============');
    console.log('Gönderilecek e-posta bilgileri:', {
      to: options.to,
      from: options.from || process.env.EMAIL_FROM,
      fromName: options.fromName || 'tenantli',
      subject: options.subject,
      textLength: options.text ? options.text.length : 0,
      htmlLength: options.html ? options.html.length : 0
    });

    const msg = {
      to: options.to,
      from: {
        email: options.from || process.env.EMAIL_FROM,
        name: options.fromName || 'tenantli'
      },
      subject: options.subject,
      text: options.text || '',
      html: options.html || '',
      attachments: options.attachments || []
    };

    console.log('SendGrid ile mail gönderme çağrısı yapılıyor...');
    const response = await sgMail.send(msg);
    
    console.log('E-posta başarıyla gönderildi!');
    console.log('SendGrid yanıtı:', response[0].statusCode);
    console.log('============ SENDGRID E-POSTA GÖNDERİM TAMAMLANDI ============');
    
    return { 
      success: true, 
      messageId: response[0].headers['x-message-id'],
      response: `SendGrid API - Status Code: ${response[0].statusCode}`
    };
  } catch (error) {
    console.error('============ SENDGRID E-POSTA GÖNDERİM HATASI ============');
    console.error('Hata detayı:', error);
    console.error('Hata mesajı:', error.message);
    
    if (error.response) {
      console.error('SendGrid hata yanıtı:', error.response.body);
    }
    
    console.error('===============================================');
    return { 
      success: false, 
      error: error.message, 
      code: error.code, 
      response: error.response ? JSON.stringify(error.response.body) : null 
    };
  }
};

const sendReportApprovalNotification = async (recipient, reportDetails) => {
  console.log('\n==== SENDGRID ONAY E-POSTASI GÖNDERİLİYOR ====');
  console.log('Alıcı:', recipient);
  console.log('Rapor detayları:', {
    id: reportDetails.id,
    title: reportDetails.title,
    address: reportDetails.address,
    viewUrl: reportDetails.viewUrl
  });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #FBF5DA;">
      <div style="background-color: #FBF5DA; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <div style="background-color: #1C2C40; padding: 30px 20px; text-align: center;">
            <h1 style="color: #D1E7E2; font-size: 24px; margin: 0; font-weight: bold;">Report Approved!</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px 20px;">
            <p style="color: #0B1420; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
              Hello ${recipient.name || 'there'},
            </p>
            
            <p style="color: #515964; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
              Good news! Your property report for <strong>${reportDetails.address}</strong> has been approved.
            </p>
            
            <!-- Report Details Card -->
            <div style="background-color: #F3F4F6; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
              <h3 style="color: #0B1420; font-size: 18px; margin: 0 0 16px 0; font-weight: bold;">
                Report Details
              </h3>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #515964; font-size: 14px;">Property:</span>
                <p style="color: #0B1420; font-size: 16px; margin: 4px 0 0 0; font-weight: 500;">
                  ${reportDetails.address}
                </p>
              </div>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #515964; font-size: 14px;">Report Type:</span>
                <p style="color: #0B1420; font-size: 16px; margin: 4px 0 0 0; font-weight: 500;">
                  ${reportDetails.type === 'move-out' ? 'Move-Out Walkthrough' : 'Move-In Walkthrough'}
                </p>
              </div>
              
              <div>
                <span style="color: #515964; font-size: 14px;">Date Created:</span>
                <p style="color: #0B1420; font-size: 16px; margin: 4px 0 0 0; font-weight: 500;">
                  ${new Date(reportDetails.created_at).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <!-- Success Message -->
            <div style="background-color: #D1FAE5; border: 1px solid #34D399; border-radius: 8px; padding: 16px; margin-bottom: 30px;">
              <p style="color: #065F46; font-size: 16px; margin: 0; text-align: center;">
                ✓ Your report has been approved successfully!
              </p>
            </div>
            
            <!-- Action Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${reportDetails.viewUrl}" 
                 style="display: inline-block; background-color: #1C2C40; color: #D1E7E2; padding: 14px 32px; text-decoration: none; border-radius: 28px; font-weight: bold; font-size: 16px;">
                View Approved Report
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #F3F4F6; padding: 20px; text-align: center;">
            <p style="color: #515964; font-size: 14px; margin: 0 0 8px 0;">
              Thank you for using tenantli!
            </p>
            <p style="color: #515964; font-size: 12px; margin: 0;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail({
    to: recipient.email,
    subject: 'Your Property Report Has Been Approved',
    html: html,
    text: `Hello ${recipient.name || 'there'}, Your property report for ${reportDetails.address} has been approved. You can view the complete report at: ${reportDetails.viewUrl}`
  });
  
  console.log('E-posta gönderim sonucu:', result);
  console.log('==== SENDGRID ONAY E-POSTASI İŞLEMİ TAMAMLANDI ====\n');
  
  return result;
};

const sendReportRejectionNotification = async (recipient, reportDetails) => {
  console.log('\n==== SENDGRID RED E-POSTASI GÖNDERİLİYOR ====');
  console.log('Alıcı:', recipient);
  console.log('Rapor detayları:', {
    id: reportDetails.id,
    title: reportDetails.title,
    address: reportDetails.address,
    viewUrl: reportDetails.viewUrl
  });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #FBF5DA;">
      <div style="background-color: #FBF5DA; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <div style="background-color: #DC2626; padding: 30px 20px; text-align: center;">
            <h1 style="color: #FEE2E2; font-size: 24px; margin: 0; font-weight: bold;">Report Rejected</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px 20px;">
            <p style="color: #0B1420; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
              Hello ${recipient.name || 'there'},
            </p>
            
            <p style="color: #515964; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
              We wanted to inform you that your property report for <strong>${reportDetails.address}</strong> has been rejected.
            </p>
            
            <!-- Report Details Card -->
            <div style="background-color: #F3F4F6; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
              <h3 style="color: #0B1420; font-size: 18px; margin: 0 0 16px 0; font-weight: bold;">
                Report Details
              </h3>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #515964; font-size: 14px;">Property:</span>
                <p style="color: #0B1420; font-size: 16px; margin: 4px 0 0 0; font-weight: 500;">
                  ${reportDetails.address}
                </p>
              </div>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #515964; font-size: 14px;">Report Type:</span>
                <p style="color: #0B1420; font-size: 16px; margin: 4px 0 0 0; font-weight: 500;">
                  ${reportDetails.type === 'move-out' ? 'Move-Out Walkthrough' : 'Move-In Walkthrough'}
                </p>
              </div>
              
              <div>
                <span style="color: #515964; font-size: 14px;">Date Created:</span>
                <p style="color: #0B1420; font-size: 16px; margin: 4px 0 0 0; font-weight: 500;">
                  ${new Date(reportDetails.created_at).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <!-- Rejection Message -->
            <div style="background-color: #FEE2E2; border: 1px solid #F87171; border-radius: 8px; padding: 16px; margin-bottom: 30px;">
              <p style="color: #991B1B; font-size: 16px; margin: 0; text-align: center;">
                ⚠️ Your report has been rejected
              </p>
            </div>
            
            <p style="color: #515964; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
              You may want to review your report and make any necessary updates. If you have questions about why your report was rejected, please contact the property owner or manager.
            </p>
            
            <!-- Action Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${reportDetails.viewUrl}" 
                 style="display: inline-block; background-color: #1C2C40; color: #D1E7E2; padding: 14px 32px; text-decoration: none; border-radius: 28px; font-weight: bold; font-size: 16px;">
                Review Your Report
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #F3F4F6; padding: 20px; text-align: center;">
            <p style="color: #515964; font-size: 14px; margin: 0 0 8px 0;">
              Thank you for using tenantli!
            </p>
            <p style="color: #515964; font-size: 12px; margin: 0;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail({
    to: recipient.email,
    subject: 'Your Property Report Has Been Rejected',
    html: html,
    text: `Hello ${recipient.name || 'there'}, We wanted to inform you that your property report for ${reportDetails.address} has been rejected. You can view the complete report at: ${reportDetails.viewUrl}`
  });
  
  console.log('E-posta gönderim sonucu:', result);
  console.log('==== SENDGRID RED E-POSTASI İŞLEMİ TAMAMLANDI ====\n');
  
  return result;
};

const sendCustomNotification = async (recipient, subject, message, reportDetails) => {
  console.log('\n==== SENDGRID ÖZEL BİLDİRİM E-POSTASI GÖNDERİLİYOR ====');
  console.log('Alıcı:', recipient);
  console.log('Konu:', subject);
  console.log('Mesaj:', message);
  console.log('Rapor detayları:', reportDetails ? {
    id: reportDetails.id,
    title: reportDetails.title,
    address: reportDetails.address,
    viewUrl: reportDetails.viewUrl
  } : 'Rapor detayları belirtilmemiş');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FBF5DA;">
      <div style="background-color: #FBF5DA; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <div style="background-color: #1C2C40; padding: 30px 20px; text-align: center;">
            <h1 style="color: #D1E7E2; font-size: 24px; margin: 0; font-weight: bold;">${subject}</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px 20px;">
            <p style="color: #0B1420; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
              Hello ${recipient.name || 'there'},
            </p>
            
            <p style="color: #515964; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
              ${message}
            </p>
            
            ${reportDetails ? `
              <!-- Report Details Card -->
              <div style="background-color: #F3F4F6; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <h3 style="color: #0B1420; font-size: 18px; margin: 0 0 16px 0; font-weight: bold;">
                  Property Details
                </h3>
                
                <div style="margin-bottom: 12px;">
                  <span style="color: #515964; font-size: 14px;">Property:</span>
                  <p style="color: #0B1420; font-size: 16px; margin: 4px 0 0 0; font-weight: 500;">
                    ${reportDetails.address}
                  </p>
                </div>
                
                <div style="margin-bottom: 12px;">
                  <span style="color: #515964; font-size: 14px;">Report Type:</span>
                  <p style="color: #0B1420; font-size: 16px; margin: 4px 0 0 0; font-weight: 500;">
                    ${reportDetails.type === 'move-out' ? 'Move-Out Walkthrough' : 'Move-In Walkthrough'}
                  </p>
                </div>
                
                ${reportDetails.tenant_name ? `
                <div style="margin-bottom: 12px;">
                  <span style="color: #515964; font-size: 14px;">Tenant:</span>
                  <p style="color: #0B1420; font-size: 16px; margin: 4px 0 0 0; font-weight: 500;">
                    ${reportDetails.tenant_name}
                  </p>
                </div>
                ` : ''}
                
                ${reportDetails.landlord_name ? `
                <div style="margin-bottom: 12px;">
                  <span style="color: #515964; font-size: 14px;">Landlord:</span>
                  <p style="color: #0B1420; font-size: 16px; margin: 4px 0 0 0; font-weight: 500;">
                    ${reportDetails.landlord_name}
                  </p>
                </div>
                ` : ''}
                
                <div style="margin-bottom: 12px;">
                  <span style="color: #515964; font-size: 14px;">Date:</span>
                  <p style="color: #0B1420; font-size: 16px; margin: 4px 0 0 0; font-weight: 500;">
                    ${new Date(reportDetails.created_at).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                
                ${reportDetails.room_count ? `
                <div style="margin-bottom: 12px;">
                  <span style="color: #515964; font-size: 14px;">Rooms Inspected:</span>
                  <p style="color: #0B1420; font-size: 16px; margin: 4px 0 0 0; font-weight: 500;">
                    ${reportDetails.room_count} rooms
                  </p>
                </div>
                ` : ''}
                
                ${reportDetails.photo_count ? `
                <div>
                  <span style="color: #515964; font-size: 14px;">Total Photos:</span>
                  <p style="color: #0B1420; font-size: 16px; margin: 4px 0 0 0; font-weight: 500;">
                    ${reportDetails.photo_count} photos
                  </p>
                </div>
                ` : ''}
              </div>
              
              <!-- Action Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${reportDetails.viewUrl}" 
                   style="display: inline-block; background-color: #1C2C40; color: #D1E7E2; padding: 14px 32px; text-decoration: none; border-radius: 28px; font-weight: bold; font-size: 16px;">
                  View Walkthrough Report
                </a>
              </div>
              
              <p style="color: #515964; font-size: 14px; line-height: 20px; text-align: center; margin: 30px 0 0 0;">
                Or copy this link: <br>
                <a href="${reportDetails.viewUrl}" style="color: #1C2C40; text-decoration: underline; word-break: break-all;">
                  ${reportDetails.viewUrl}
                </a>
              </p>
            ` : ''}
          </div>
          
          <!-- Footer -->
          <div style="background-color: #F3F4F6; padding: 20px; text-align: center;">
            <p style="color: #515964; font-size: 14px; margin: 0 0 8px 0;">
              Thank you for using tenantli!
            </p>
            <p style="color: #515964; font-size: 12px; margin: 0;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail({
    to: recipient.email,
    subject: subject,
    html: html,
    text: `Hello ${recipient.name || 'there'}, ${message} ${reportDetails ? `Report details: ${reportDetails.title}, ${reportDetails.address}. View at: ${reportDetails.viewUrl}` : ''}`
  });
  
  console.log('E-posta gönderim sonucu:', result);
  console.log('==== SENDGRID ÖZEL BİLDİRİM E-POSTASI İŞLEMİ TAMAMLANDI ====\n');
  
  return result;
};

module.exports = {
  sendEmail,
  sendReportApprovalNotification,
  sendReportRejectionNotification,
  sendCustomNotification
};