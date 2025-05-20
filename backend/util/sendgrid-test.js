const sendgridService = require('../services/sendgrid.service');
const dotenv = require('dotenv');

dotenv.config();

// Test e-posta fonksiyonu
const testSendGridEmail = async () => {
  console.log('=========================================');
  console.log('SendGrid E-posta Testi Başlatılıyor...');
  console.log('=========================================');
  
  // Gönderici ve alıcı ayarları
  const sender = process.env.EMAIL_FROM || 'no-reply@tenantli.com';
  const recipient = process.env.TEST_EMAIL || sender;
  
  // Test mesajı
  const subject = 'SendGrid Test E-postası';
  const text = 'Bu bir SendGrid test e-postasıdır. E-posta gönderimi başarıyla çalışıyor.';
  const html = `
    <h1>SendGrid Test</h1>
    <p>Bu bir SendGrid test e-postasıdır.</p>
    <p>E-posta gönderimi başarıyla çalışıyor.</p>
    <p><strong>Tarih ve saat:</strong> ${new Date().toLocaleString()}</p>
  `;
  
  // E-posta gönderme işlemi
  try {
    console.log(`📧 Test e-postası "${recipient}" adresine gönderiliyor...`);
    
    const result = await sendgridService.sendEmail({
      to: recipient,
      from: sender,
      subject: subject,
      text: text,
      html: html
    });
    
    if (result.success) {
      console.log('✅ Test e-postası başarıyla gönderildi!');
      console.log('🔍 Mesaj ID:', result.messageId);
    } else {
      console.error('❌ E-posta gönderimi başarısız.');
      console.error('🔍 Hata:', result.error);
    }
  } catch (error) {
    console.error('❌ Test sırasında bir hata oluştu:');
    console.error(error);
  }
  
  console.log('=========================================');
  console.log('SendGrid E-posta Testi Tamamlandı');
  console.log('=========================================');
};

// Test fonksiyonunu çalıştır
testSendGridEmail();