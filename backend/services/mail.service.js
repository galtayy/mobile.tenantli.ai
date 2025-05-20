const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const constants = require('constants');

// SSL/TLS ayarlarını eski sunucular için uyumlu hale getir
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Geliştirme modunda sertifika doğrulamasını devre dışı bırak

dotenv.config();

// Nodemailer transporter oluştur
const createTransporter = () => {
  console.log('Mail ayarları yükleniyor...');
  console.log('Host:', process.env.EMAIL_HOST);
  console.log('Port:', process.env.EMAIL_PORT);
  console.log('User:', process.env.EMAIL_USER);
  console.log('From:', process.env.EMAIL_FROM);
  
  // Ana config'i oluştur
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_SECURE === 'true' || parseInt(process.env.EMAIL_PORT, 10) === 465, // .env'den veya port numarasına göre SSL etkinleştir
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    debug: true, // Her zaman debug mod aktif
    logger: true, // Her zaman logger aktif
    connectionTimeout: 60000, // 60 saniye bağlantı zaman aşımı
    greetingTimeout: 30000, // 30 saniye karşılama zaman aşımı
    socketTimeout: 60000, // 60 saniye soket zaman aşımı
    tls: {
      // Eski SSL/TLS yapılandırmalarını kabul et
      rejectUnauthorized: false,
      minVersion: 'TLSv1', // TLSv1.2 yerine TLSv1 kullan
      maxVersion: 'TLSv1.3',
      ciphers: 'HIGH:MEDIUM:!aNULL:!MD5:!RC4', // Daha geniş şifreleme seti
      secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT // Legacy server bağlantısına izin ver
    }
  };
  
  // Özel mail sunucusuna yönelik optimizasyonlar
  if (process.env.EMAIL_HOST.includes('kurumsaleposta')) {
    console.log('Kurumsal e-posta sunucusu için ek yapılandırma uygulanıyor...');
    config.pool = false; // Bağlantı havuzunu kapat
    config.disableFileAccess = true; // Dosya erişimini devre dışı bırak (güvenlik)
    config.secure = true; // Her zaman için SSL kullan
    config.requireTLS = true; // TLS kullanımını zorunlu kıl
    config.opportunisticTLS = true; // Mümkün olduğunda TLS kullan
  }
  
  console.log('Mail transporter konfigürasyonu:', JSON.stringify({
    ...config,
    auth: {
      user: config.auth.user,
      pass: '********'
    }
  }, null, 2));
  
  return nodemailer.createTransport(config);
};

const transporter = createTransporter();

// E-posta gönderimi yapan ana metot
const sendEmail = async (options) => {
  try {
    console.log('============ E-POSTA GÖNDERİM BAŞLATILDI ============');
    console.log('Transport ayarları:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true' || parseInt(process.env.EMAIL_PORT, 10) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: '********' // Güvenlik için şifre gizlendi
      }
    });
    
    console.log('Gönderilecek e-posta bilgileri:', {
      to: options.to,
      from: options.from || process.env.EMAIL_FROM,
      fromName: options.fromName || 'tenantli',
      subject: options.subject,
      textLength: options.text ? options.text.length : 0,
      htmlLength: options.html ? options.html.length : 0
    });

    const mailOptions = {
      from: `${options.fromName || 'tenantli'} <${options.from || process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || '',
      attachments: options.attachments || []
    };

    console.log('Transporter ile mail gönderme çağrısı yapılıyor...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('E-posta başarıyla gönderildi!');
    console.log('Mesaj ID:', info.messageId);
    console.log('Özet bilgiler:', info.response);
    console.log('============ E-POSTA GÖNDERİM TAMAMLANDI ============');
    
    return { success: true, messageId: info.messageId, response: info.response };
  } catch (error) {
    console.error('============ E-POSTA GÖNDERİM HATASI ============');
    console.error('Hata detayı:', error);
    console.error('Hata kodu:', error.code);
    console.error('Hata mesajı:', error.message);
    console.error('Hata yanıtı:', error.response);
    console.error('===============================================');
    return { success: false, error: error.message, code: error.code, response: error.response };
  }
};

const sendReportApprovalNotification = async (recipient, reportDetails) => {
  console.log('\n==== ONAY E-POSTASI GÖNDERİLİYOR ====');
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
              Thank you for using DepositShield!
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
  console.log('==== ONAY E-POSTASI İŞLEMİ TAMAMLANDI ====\n');
  
  return result;
};

// Rapor reddetme bildirimi gönder
const sendReportRejectionNotification = async (recipient, reportDetails) => {
  console.log('\n==== RED E-POSTASI GÖNDERİLİYOR ====');
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
              Thank you for using DepositShield!
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
  console.log('==== RED E-POSTASI İŞLEMİ TAMAMLANDI ====\n');
  
  return result;
};

// Özel bildirim e-postası gönder
const sendCustomNotification = async (recipient, subject, message, reportDetails) => {
  console.log('\n==== ÖZEL BİLDİRİM E-POSTASI GÖNDERİLİYOR ====');
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
              Thank you for using DepositShield!
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
  console.log('==== ÖZEL BİLDİRİM E-POSTASI İŞLEMİ TAMAMLANDI ====\n');
  
  return result;
};

module.exports = {
  sendEmail,
  sendReportApprovalNotification,
  sendReportRejectionNotification,
  sendCustomNotification
};