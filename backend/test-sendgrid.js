const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');

dotenv.config();

// SendGrid API anahtarını ayarla
const apiKey = process.env.SENDGRID_API_KEY;
console.log('SendGrid API Anahtarı (ilk 5 karakter):', apiKey ? apiKey.substring(0, 5) + '...' : 'Tanımlanmamış');

sgMail.setApiKey(apiKey);

const testSendGridEmail = async () => {
  console.log('=========================================');
  console.log('SendGrid Doğrudan Test Başlatılıyor...');
  console.log('=========================================');
  
  // Gönderici ve alıcı ayarları
  const sender = process.env.EMAIL_FROM || 'no-reply@tenantli.com';
  const recipient = process.env.TEST_EMAIL || sender;
  
  console.log(`Gönderen: ${sender}`);
  console.log(`Alıcı: ${recipient}`);
  
  const msg = {
    to: recipient,
    from: {
      email: sender,
      name: 'tenantli Test'
    },
    subject: 'SendGrid API Testi',
    text: 'Bu bir SendGrid API test e-postasıdır. E-posta gönderimi doğrudan API ile çalışıyor.',
    html: `
      <h1>SendGrid API Testi</h1>
      <p>Bu bir SendGrid API test e-postasıdır.</p>
      <p>E-posta gönderimi doğrudan API ile çalışıyor.</p>
      <p><strong>Tarih ve saat:</strong> ${new Date().toLocaleString()}</p>
    `
  };
  
  try {
    console.log('SendGrid API çağrısı yapılıyor...');
    const response = await sgMail.send(msg);
    
    console.log('✅ SendGrid API cevabı:');
    console.log('Durum kodu:', response[0].statusCode);
    console.log('Mesaj ID:', response[0].headers['x-message-id']);
    console.log('E-posta başarıyla gönderildi!');
  } catch (error) {
    console.error('❌ SendGrid API hatası:');
    console.error('Hata detayı:', error);
    console.error('Hata mesajı:', error.message);
    
    if (error.response) {
      console.error('SendGrid API hata detayları:');
      console.error('Durum kodu:', error.code);
      console.error('Yanıt body:', error.response.body);
    }
  }
  
  console.log('=========================================');
  console.log('SendGrid API Testi Tamamlandı');
  console.log('=========================================');
};

// Test fonksiyonunu çalıştır
testSendGridEmail();