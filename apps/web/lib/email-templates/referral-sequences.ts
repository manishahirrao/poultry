// FlockIQ — Referral Email Nurture Sequences
// File: apps/web/lib/email-templates/referral-sequences.ts
// Version: v1.0 | May 2026
// Requirements: FR-REFERRAL-003

export interface ReferralEmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

// Referral Program Launch Email
export const referralLaunchEmail = (referralCode: string): ReferralEmailTemplate => ({
  subject: 'आप अब FlockIQ शेयर करके कमा सकते हैं! 🎁',
  htmlContent: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a472a; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: #e8f5e9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .code { font-size: 32px; font-weight: bold; color: #1a472a; letter-spacing: 3px; }
        .cta-button { display: inline-block; background: #1a472a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎁 रेफरल प्रोग्राम लॉन्च!</h1>
        </div>
        <div class="content">
          <p>नमस्ते,</p>
          <p>हमने अभी अपना रेफरल प्रोग्राम लॉन्च किया है!</p>
          <p>अपने किसान मित्रों के साथ FlockIQ शेयर करें और हर सफल रेफरल पर <strong>1 महीना फ्री</strong> कमाएं।</p>
          
          <div class="code-box">
            <p style="margin: 0 0 10px 0;">आपका रेफरल कोड:</p>
            <div class="code">${referralCode}</div>
          </div>
          
          <p><strong>यह कैसे काम करता है:</strong></p>
          <ol>
            <li>अपना रेफरल कोड शेयर करें</li>
            <li>आपका मित्र साइन अप करें और 14 दिन फ्री ट्रायल पाएं</li>
            <li>जब वे पहली बार पेमेंट करें, आपको 1 महीना फ्री क्रेडिट मिलेगा</li>
          </ol>
          
          <a href="https://flockiq.com/refer" class="cta-button">अपने रेफरल देखें</a>
          
          <p>धन्यवाद,<br>FlockIQ टीम</p>
        </div>
        <div class="footer">
          <p>यह ईमेल आपको क्योंकि भेजा गया है क्योंकि आप FlockIQ के ग्राहक हैं।</p>
        </div>
      </div>
    </body>
    </html>
  `,
  textContent: `
    नमस्ते,
    
    हमने अभी अपना रेफरल प्रोग्राम लॉन्च किया है!
    
    अपने किसान मित्रों के साथ FlockIQ शेयर करें और हर सफल रेफरल पर 1 महीना फ्री कमाएं।
    
    आपका रेफरल कोड: ${referralCode}
    
    यह कैसे काम करता है:
    1. अपना रेफरल कोड शेयर करें
    2. आपका मित्र साइन अप करें और 14 दिन फ्री ट्रायल पाएं
    3. जब वे पहली बार पेमेंट करें, आपको 1 महीना फ्री क्रेडिट मिलेगा
    
    अपने रेफरल देखें: https://flockiq.com/refer
    
    धन्यवाद,
    FlockIQ टीम
  `,
});

// Day 7 Reminder Email
export const referralReminderDay7 = (referralCode: string): ReferralEmailTemplate => ({
  subject: 'अभी तक कोई रेफरल नहीं? 🤔',
  htmlContent: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a472a; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: #e8f5e9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .code { font-size: 32px; font-weight: bold; color: #1a472a; letter-spacing: 3px; }
        .cta-button { display: inline-block; background: #1a472a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤔 अभी तक कोई रेफरल नहीं?</h1>
        </div>
        <div class="content">
          <p>नमस्ते,</p>
          <p>हमने देखा कि आपने अभी तक अपना रेफरल कोड शेयर नहीं किया है।</p>
          <p>अपने किसान मित्रों को FlockIQ से जोड़ना बहुत आसान है!</p>
          
          <div class="code-box">
            <p style="margin: 0 0 10px 0;">आपका रेफरल कोड:</p>
            <div class="code">${referralCode}</div>
          </div>
          
          <p><strong>बस ये करें:</strong></p>
          <ol>
            <li>अपने WhatsApp group में यह कोड शेयर करें</li>
            <li>अपने feed dealer या vet को बताएं</li>
            <li>अपने किसान मित्रों को forward करें</li>
          </ol>
          
          <a href="https://flockiq.com/refer" class="cta-button">रेफरल पेज पर जाएं</a>
          
          <p>धन्यवाद,<br>FlockIQ टीम</p>
        </div>
      </div>
    </body>
    </html>
  `,
  textContent: `
    नमस्ते,
    
    हमने देखा कि आपने अभी तक अपना रेफरल कोड शेयर नहीं किया है।
    
    अपने किसान मित्रों को FlockIQ से जोड़ना बहुत आसान है!
    
    आपका रेफरल कोड: ${referralCode}
    
    बस ये करें:
    1. अपने WhatsApp group में यह कोड शेयर करें
    2. अपने feed dealer या vet को बताएं
    3. अपने किसान मित्रों को forward करें
    
    रेफरल पेज पर जाएं: https://flockiq.com/refer
    
    धन्यवाद,
    FlockIQ टीम
  `,
});

// Day 30 Reminder Email
export const referralReminderDay30 = (referralCode: string): ReferralEmailTemplate => ({
  subject: 'क्या आपको कोई किसान मित्र याद है? 🌾',
  htmlContent: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a472a; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: #e8f5e9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .code { font-size: 32px; font-weight: bold; color: #1a472a; letter-spacing: 3px; }
        .cta-button { display: inline-block; background: #1a472a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌾 क्या आपको कोई किसान मित्र याद है?</h1>
        </div>
        <div class="content">
          <p>नमस्ते,</p>
          <p>आप FlockIQ का इस्तेमाल कर रहे हैं और शायद आपके कुछ किसान मित्र भी इससे फायदा उठा सकते हैं।</p>
          
          <div class="code-box">
            <p style="margin: 0 0 10px 0;">आपका रेफरल कोड:</p>
            <div class="code">${referralCode}</div>
          </div>
          
          <p><strong>शेयर करने के आसान तरीके:</strong></p>
          <ul>
            <li>WhatsApp पर अपने मित्रों को भेजें</li>
            <li>अपने mandi में बात करें</li>
            <li>Feed dealer से शेयर करें</li>
          </ul>
          
          <p>हर सफल रेफरल पर आपको <strong>1 महीना फ्री</strong> मिलेगा!</p>
          
          <a href="https://flockiq.com/refer" class="cta-button">अभी शेयर करें</a>
          
          <p>धन्यवाद,<br>FlockIQ टीम</p>
        </div>
      </div>
    </body>
    </html>
  `,
  textContent: `
    नमस्ते,
    
    आप FlockIQ का इस्तेमाल कर रहे हैं और शायद आपके कुछ किसान मित्र भी इससे फायदा उठा सकते हैं।
    
    आपका रेफरल कोड: ${referralCode}
    
    शेयर करने के आसान तरीके:
    - WhatsApp पर अपने मित्रों को भेजें
    - अपने mandi में बात करें
    - Feed dealer से शेयर करें
    
    हर सफल रेफरल पर आपको 1 महीना फ्री मिलेगा!
    
    अभी शेयर करें: https://flockiq.com/refer
    
    धन्यवाद,
    FlockIQ टीम
  `,
});

// Day 60 Success Story Email
export const referralReminderDay60 = (referralCode: string, userReferrals?: number): ReferralEmailTemplate => ({
  subject: 'FlockIQ से किसानों की मदद करें 🚀',
  htmlContent: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a472a; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: #e8f5e9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .code { font-size: 32px; font-weight: bold; color: #1a472a; letter-spacing: 3px; }
        .cta-button { display: inline-block; background: #1a472a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .stats { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 FlockIQ से किसानों की मदद करें</h1>
        </div>
        <div class="content">
          <p>नमस्ते,</p>
          <p>आप FlockIQ का 2 महीने से ज्यादा इस्तेमाल कर रहे हैं। धन्यवाद!</p>
          
          ${userReferrals !== undefined ? `
          <div class="stats">
            <p><strong>आपकी रेफरल स्टैट्स:</strong></p>
            <p>अब तक रेफर किए: ${userReferrals} किसान</p>
          </div>
          ` : ''}
          
          <p>भारत में हजारों किसान अभी भी सही समय पर मुर्गी बेचने में संघर्ष कर रहे हैं। आप उनकी मदद कर सकते हैं!</p>
          
          <div class="code-box">
            <p style="margin: 0 0 10px 0;">आपका रेफरल कोड:</p>
            <div class="code">${referralCode}</div>
          </div>
          
          <p>साथ ही, हर सफल रेफरल पर आपको <strong>1 महीना फ्री</strong> मिलेगा।</p>
          
          <a href="https://flockiq.com/refer" class="cta-button">अभी शेयर करें</a>
          
          <p>धन्यवाद,<br>FlockIQ टीम</p>
        </div>
      </div>
    </body>
    </html>
  `,
  textContent: `
    नमस्ते,
    
    आप FlockIQ का 2 महीने से ज्यादा इस्तेमाल कर रहे हैं। धन्यवाद!
    
    ${userReferrals !== undefined ? `
    आपकी रेफरल स्टैट्स:
    अब तक रेफर किए: ${userReferrals} किसान
    ` : ''}
    
    भारत में हजारों किसान अभी भी सही समय पर मुर्गी बेचने में संघर्ष कर रहे हैं। आप उनकी मदद कर सकते हैं!
    
    आपका रेफरल कोड: ${referralCode}
    
    साथ ही, हर सफल रेफरल पर आपको 1 महीना फ्री मिलेगा।
    
    अभी शेयर करें: https://flockiq.com/refer
    
    धन्यवाद,
    FlockIQ टीम
  `,
});

// Post-Milestone Email
export const referralMilestoneEmail = (referralCode: string, milestone: string, reward: string): ReferralEmailTemplate => ({
  subject: `🎉 बधाई हो! आपने ${milestone} पूरा कर लिया!`,
  htmlContent: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .milestone-box { background: #fff3cd; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px solid #ffc107; }
        .reward { font-size: 28px; font-weight: bold; color: #1a472a; }
        .cta-button { display: inline-block; background: #1a472a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 बधाई हो!</h1>
        </div>
        <div class="content">
          <p>नमस्ते,</p>
          <p>आपने एक बड़ी achievement की है!</p>
          
          <div class="milestone-box">
            <p style="margin: 0 0 10px 0; font-size: 18px;">आपने पूरा किया:</p>
            <p style="margin: 0 0 15px 0; font-size: 24px; font-weight: bold;">${milestone}</p>
            <p style="margin: 0;">आपका reward:</p>
            <div class="reward">${reward}</div>
          </div>
          
          <p>आपका रेफरल कोड वही है:</p>
          <p style="font-size: 24px; font-weight: bold; color: #1a472a; letter-spacing: 2px; text-align: center; margin: 20px 0;">${referralCode}</p>
          
          <p>अगले milestone के लिए शेयर करते रहें!</p>
          
          <a href="https://flockiq.com/refer" class="cta-button">अपने रेफरल देखें</a>
          
          <p>धन्यवाद,<br>FlockIQ टीम</p>
        </div>
      </div>
    </body>
    </html>
  `,
  textContent: `
    नमस्ते,
    
    आपने एक बड़ी achievement की है!
    
    आपने पूरा किया: ${milestone}
    आपका reward: ${reward}
    
    आपका रेफरल कोड वही है: ${referralCode}
    
    अगले milestone के लिए शेयर करते रहें!
    
    अपने रेफरल देखें: https://flockiq.com/refer
    
    धन्यवाद,
    FlockIQ टीम
  `,
});

// Credit Earned Email (when referral converts)
export const referralCreditEarnedEmail = (referredPhone: string, creditAmount: number): ReferralEmailTemplate => ({
  subject: `🎉 आपको ${creditAmount} महीना फ्री क्रेडिट मिला!`,
  htmlContent: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .credit-box { background: #d4edda; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px solid #28a745; }
        .credit-amount { font-size: 36px; font-weight: bold; color: #155724; }
        .cta-button { display: inline-block; background: #1a472a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 क्रेडिट मिला!</h1>
        </div>
        <div class="content">
          <p>नमस्ते,</p>
          <p>बहुत बढ़िया खबर! आपके रेफरल ने पहली बार पेमेंट कर दिया है।</p>
          
          <div class="credit-box">
            <p style="margin: 0 0 10px 0;">आपको मिला:</p>
            <div class="credit-amount">${creditAmount} महीना फ्री</div>
            <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">रेफर किया गया: ${referredPhone}</p>
          </div>
          
          <p>यह क्रेडिट आपके अगले बिलिंग साइकल में एडजस्ट हो जाएगा।</p>
          
          <a href="https://flockiq.com/refer" class="cta-button">और रेफरल करें</a>
          
          <p>धन्यवाद,<br>FlockIQ टीम</p>
        </div>
      </div>
    </body>
    </html>
  `,
  textContent: `
    नमस्ते,
    
    बहुत बढ़िया खबर! आपके रेफरल ने पहली बार पेमेंट कर दिया है।
    
    आपको मिला: ${creditAmount} महीना फ्री
    रेफर किया गया: ${referredPhone}
    
    यह क्रेडिट आपके अगले बिलिंग साइकल में एडजस्ट हो जाएगा।
    
    और रेफरल करें: https://flockiq.com/refer
    
    धन्यवाद,
    FlockIQ टीम
  `,
});
