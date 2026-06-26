// FlockIQ — Lead Magnet Email Templates
// File: apps/web/lib/email-templates/lead-magnet.ts
// Version: v1.0 | May 2026

export interface LeadMagnetEmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

// Lead Magnet Delivery Email - Template
export const leadMagnetTemplateEmail = (email: string, district?: string): LeadMagnetEmailTemplate => ({
  subject: '📊 Your Free Price Forecast Template is Ready!',
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
        .download-box { background: #e8f5e9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px solid #1a472a; }
        .cta-button { display: inline-block; background: #1a472a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-list li { margin: 10px 0; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Your Free Template is Ready!</h1>
        </div>
        <div class="content">
          <p>नमस्ते,</p>
          <p>आपने FlockIQ का <strong>7-Day Price Forecast Template</strong> successfully download किया है।</p>
          
          <div class="download-box">
            <p style="margin: 0 0 15px 0; font-size: 18px;">📥 Download Your Template:</p>
            <a href="https://FlockIQ.ai/lead-magnets/price-forecast-template.csv" class="cta-button">Download CSV File</a>
            <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">Opens in Excel, Google Sheets, or any spreadsheet software</p>
          </div>
          
          <div class="feature-list">
            <h3 style="margin: 0 0 15px 0;">✨ What's Inside:</h3>
            <ul class="feature-list" style="list-style: none; padding: 0;">
              <li>✅ Pre-built profit calculation formulas</li>
              <li>✅ 7-day price forecast tracking</li>
              <li>✅ What-if scenario analysis</li>
              <li>✅ Historical price tracking (30 days)</li>
              <li>✅ Hindi + English labels</li>
            </ul>
          </div>
          
          <p><strong>💡 Pro Tip:</strong> For 95%+ accurate price predictions, try our free 14-day trial. Farmers in ${district || 'your area'} get exclusive access.</p>
          
          <a href="https://FlockIQ.ai/?utm_source=lead-magnet&utm_medium=email&utm_campaign=template-download" class="cta-button">Start Free Trial</a>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            No credit card required • Cancel anytime • WhatsApp delivery
          </p>
          
          <p>धन्यवाद,<br>FlockIQ टीम</p>
        </div>
        <div class="footer">
          <p>You received this because you requested our free template.</p>
          <p>Unsubscribe: partnerships@FlockIQ.ai</p>
        </div>
      </div>
    </body>
    </html>
  `,
  textContent: `
    नमस्ते,
    
    आपने FlockIQ का 7-Day Price Forecast Template successfully download किया है।
    
    Download your template here: https://FlockIQ.ai/lead-magnets/price-forecast-template.csv
    
    What's Inside:
    - Pre-built profit calculation formulas
    - 7-day price forecast tracking
    - What-if scenario analysis
    - Historical price tracking (30 days)
    - Hindi + English labels
    
    Pro Tip: For 95%+ accurate price predictions, try our free 14-day trial. Farmers in ${district || 'your area'} get exclusive access.
    
    Start Free Trial: https://FlockIQ.ai/?utm_source=lead-magnet&utm_medium=email&utm_campaign=template-download
    
    No credit card required • Cancel anytime • WhatsApp delivery
    
    धन्यवाद,
    FlockIQ टीम
  `,
});

// Lead Magnet Delivery Email - Checklist
export const leadMagnetChecklistEmail = (email: string, district?: string): LeadMagnetEmailTemplate => ({
  subject: '✅ Your Free Price Swing Checklist is Ready!',
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
        .download-box { background: #e8f5e9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px solid #1a472a; }
        .cta-button { display: inline-block; background: #1a472a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-list li { margin: 10px 0; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Your Free Checklist is Ready!</h1>
        </div>
        <div class="content">
          <p>नमस्ते,</p>
          <p>आपने FlockIQ का <strong>Broiler Price Swing Checklist</strong> successfully download किया है।</p>
          
          <div class="download-box">
            <p style="margin: 0 0 15px 0; font-size: 18px;">📥 Download Your Checklist:</p>
            <a href="https://FlockIQ.ai/lead-magnets/price-swing-checklist.md" class="cta-button">Download PDF/Markdown</a>
            <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">Print-friendly • Mobile-optimized • Hindi + English</p>
          </div>
          
          <div class="feature-list">
            <h3 style="margin: 0 0 15px 0;">✨ What's Inside:</h3>
            <ul class="feature-list" style="list-style: none; padding: 0;">
              <li>✅ 10 warning signs before price crashes</li>
              <li>✅ 5 indicators of price uptrends</li>
              <li>✅ Weekly monitoring routine</li>
              <li>✅ Middleman behavior patterns (red flags)</li>
              <li>✅ Quick decision matrix</li>
            </ul>
          </div>
          
          <p><strong>💡 Pro Tip:</strong> This checklist helps you spot manual signals. For 95%+ accurate 7-day predictions, try our free trial. Farmers in ${district || 'your area'} get exclusive access.</p>
          
          <a href="https://FlockIQ.ai/?utm_source=lead-magnet&utm_medium=email&utm_campaign=checklist-download" class="cta-button">Start Free Trial</a>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            No credit card required • Cancel anytime • WhatsApp delivery
          </p>
          
          <p>धन्यवाद,<br>FlockIQ टीम</p>
        </div>
        <div class="footer">
          <p>You received this because you requested our free checklist.</p>
          <p>Unsubscribe: partnerships@FlockIQ.ai</p>
        </div>
      </div>
    </body>
    </html>
  `,
  textContent: `
    नमस्ते,
    
    आपने FlockIQ का Broiler Price Swing Checklist successfully download किया है।
    
    Download your checklist here: https://FlockIQ.ai/lead-magnets/price-swing-checklist.md
    
    What's Inside:
    - 10 warning signs before price crashes
    - 5 indicators of price uptrends
    - Weekly monitoring routine
    - Middleman behavior patterns (red flags)
    - Quick decision matrix
    
    Pro Tip: This checklist helps you spot manual signals. For 95%+ accurate 7-day predictions, try our free trial. Farmers in ${district || 'your area'} get exclusive access.
    
    Start Free Trial: https://FlockIQ.ai/?utm_source=lead-magnet&utm_medium=email&utm_campaign=checklist-download
    
    No credit card required • Cancel anytime • WhatsApp delivery
    
    धन्यवाद,
    FlockIQ टीम
  `,
});
