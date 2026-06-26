# FlockIQ WhatsApp Business API Integration

## Task Reference
- **Task:** WHATSAPP-001
- **Version:** v3.0 | June 2026
- **Design Reference:** FlockIQ_PreLogin_Design_Master_v3.md
- **Requirements Reference:** FlockIQ_PreLogin_Requirements_v3.md (FR-WHATSAPP-DEMO-001)

## Overview
This module handles WhatsApp Business API integration for FlockIQ's daily log automation and price signal delivery. The implementation uses Python (FastAPI) for the backend API.

## Prerequisites (External Setup Required)

Before using this module, the following must be completed:

1. **Register FlockIQ as a Meta Business Manager**
   - Go to business.facebook.com
   - Create a Business Manager account
   - Add FlockIQ Technologies Pvt. Ltd. as a business

2. **Apply for WhatsApp Business API Access**
   - Apply for Cloud API (not On-Premise)
   - Get approval from Meta
   - Note: This may take several days to weeks

3. **Get WhatsApp Business Account (WABA) ID**
   - Create a WhatsApp Business Account
   - Note the WABA ID for configuration

4. **Create Phone Number in WABA**
   - Add a phone number for FlockIQ sender
   - Verify the phone number
   - Note the Phone Number ID

5. **Create and Get Approval for Message Templates**

### Template 1: Daily Log Reminder (Hindi)
- **Name:** `flockiq_daily_log_hi`
- **Category:** UTILITY
- **Body:**
```
🐔 *FlockIQ — {{1}} Farm*
 आज का log भेजें (Day {{2}}):
 *[deaths] [feed kg]* टाइप करें
 Example: 2 1350
 
 _Weight (optional):_ *[deaths] [feed kg] [weight g]*
 दवाई: MEDICINE [name] [dose] Day-{{3}} to Day-{{4}}
```

### Template 2: Daily Log Reminder (English)
- **Name:** `flockiq_daily_log_en`
- **Category:** UTILITY
- **Body:**
```
🐔 *FlockIQ — {{1}} Farm*
 Day {{2}} daily log:
 Reply with: *[deaths] [feed kg]*
 Example: 2 1350
 
 Optional weight: *2 1350 1680*
 Medicine: MEDICINE [name] [dose] Day-{{3}} to Day-{{4}}
```

### Template 3: Log Confirmation (Hindi)
- **Name:** `flockiq_log_confirmed_hi`
- **Category:** UTILITY
- **Body:**
```
✅ *Log saved — Day {{1}}*
 मृत्यु: {{2}} | खाना: {{3}} kg
 FCR (अनुमान): {{4}}
 {{5}}
```

### Template 4: Sell Signal (Hindi)
- **Name:** `flockiq_sell_signal_hi`
- **Category:** UTILITY
- **Body:**
```
📊 *FlockIQ — {{1}} बेल्ट* | आज का भाव
 आज: ₹{{2}}/kg {{3}}
 7-दिन Range: ₹{{4}}–₹{{5}}
 Most likely: ₹{{6}} (P50)
 
 Signal: {{7}}
 {{8}}
```

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# WhatsApp Business API (Meta)
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id

# Alternative: Twilio (if using Twilio instead of Meta)
USE_TWILIO=false
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# WhatsApp App Secret (for webhook signature verification)
WHATSAPP_APP_SECRET=your_app_secret
```

## Module Structure

```
apps/api/whatsapp/
├── __init__.py
├── daily_log_webhook.py          # Main webhook handler for daily log automation
├── inbound_handler.py            # Inbound message handler (price queries, help, etc.)
├── dispatcher.py                # Message dispatcher (sends forecasts, signals)
├── delivery_handler.py          # Delivery receipt handler
├── daily_reminder_scheduler.py  # Daily reminder scheduler (cron job)
└── README.md                    # This file
```

## Key Features

### 1. Daily Log Automation (`daily_log_webhook.py`)
- Receives WhatsApp messages from farmers
- Parses natural language input (Hindi/English)
- Validates log values against batch data
- Saves daily logs to database
- Sends confirmation messages
- Handles special commands (STOP, HELP, REDO)

### 2. Message Parser (`daily_log_webhook.py`)
- Multiple parsing strategies:
  - Pure numeric format: "2 1250 1680"
  - Keyword extraction: "all good 1350"
  - Natural language: "2 murgi mri, 1250 kg khaana"
  - Shorthand: "d:1 f:1380 w:1690"
- Confidence scoring (HIGH/MEDIUM/LOW)
- Validation against batch data

### 3. Inbound Handler (`inbound_handler.py`)
- Intent detection (price, help, stop)
- Price forecast delivery
- Menu/help responses
- Opt-out handling

### 4. Dispatcher (`dispatcher.py`)
- Daily forecast dispatch
- Welcome signal dispatch
- Batch dispatch support
- Rate limiting (1 message per customer per day)
- Steganographic watermarking for IP audit trail

### 5. Delivery Handler (`delivery_handler.py`)
- Delivery status tracking
- Deep link click tracking
- Analytics summary
- Engagement heatmap
- Churn risk detection

### 6. Daily Reminder Scheduler (`daily_reminder_scheduler.py`)
- Cron job for sending daily log reminders
- Uses Supabase RPC function to get farms needing reminders
- Rate-limited batch sending (50 messages per batch, 1s delay)
- Language-aware templates (Hindi/English)
- Escalation rules for missed logs

## Webhook Endpoints

### Daily Log Webhook
```
POST /api/v1/webhooks/whatsapp/daily-log
GET  /api/v1/webhooks/whatsapp/daily-log (for verification)
```

### Inbound Webhook
```
POST /webhooks/twilio/inbound
```

### Delivery Webhook
```
POST /api/v1/webhooks/twilio/delivery
```

### Daily Reminder Cron
```
POST /api/v1/cron/send-daily-reminders
Header: Authorization: Bearer {CRON_SECRET}
```

## Security

- Webhook signature verification (HMAC-SHA256)
- Rate limiting
- Input validation with Pydantic
- SQL injection prevention (Supabase client)
- Phone number validation

## Database Tables Required

- `farms` - Farm profiles with WhatsApp numbers
- `batches` - Active batch information
- `daily_logs` - Daily log entries
- `message_events` - WhatsApp message tracking
- `whatsapp_delivery_log` - Delivery receipts
- `alerts` - Dashboard alerts

## Testing

To test the webhook locally:
1. Use ngrok to expose your local server
2. Configure the webhook URL in Meta Business Manager
3. Send test messages via WhatsApp

## Notes

- The implementation supports both Meta WhatsApp Business API and Twilio
- Set `USE_TWILIO=true` to use Twilio instead of Meta
- Default is to use Meta WhatsApp Business API
- All messages are logged for audit trail
- Rate limiting prevents duplicate messages

## Compliance

- DPDP Act 2023 compliant data handling
- Opt-out mechanism (STOP command)
- Data localization (AWS ap-south-1, Mumbai)
- Consent management
- Data retention policies
