/**
 * Twilio WhatsApp Mock Service
 * Section 7.4: Dispatches audit completion alerts and PDF links to client phone via WhatsApp
 */
export interface WhatsAppMessagePayload {
  to: string;
  clientName: string;
  websiteUrl: string;
  overallScore: number;
  reportUrl: string;
  criticalIssuesCount: number;
}

export async function sendWhatsAppNotification(payload: WhatsAppMessagePayload, useMocks = true) {
  const isMock = useMocks || process.env.USE_MOCKS === 'true';

  const messageBody = `*EdgeLink Technology SEO Audit Complete* 🚀\n\n` +
    `Hello ${payload.clientName},\n` +
    `Your automated SEO audit for *${payload.websiteUrl}* is ready!\n\n` +
    `📊 *Overall SEO Score:* ${payload.overallScore}/100\n` +
    `⚠️ *Critical Issues Found:* ${payload.criticalIssuesCount}\n` +
    `📄 *Download Full Audit PDF Report:* ${payload.reportUrl}\n\n` +
    `Need implementation support? Contact your EdgeLink SEO strategist directly.`;

  if (isMock) {
    const mockSid = `SM${Math.random().toString(36).substring(2, 10)}${Date.now()}`;
    console.log(`\n======================================================`);
    console.log(`[MOCK TWILIO WHATSAPP DISPATCH] (USE_MOCKS=true)`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`To (WhatsApp): whatsapp:${payload.to}`);
    console.log(`From (Twilio): whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'}`);
    console.log(`Message SID: ${mockSid}`);
    console.log(`Status: delivered`);
    console.log(`Content:\n${messageBody}`);
    console.log(`======================================================\n`);

    return {
      success: true,
      sid: mockSid,
      status: "delivered",
      recipient: payload.to,
      isMock: true,
      body: messageBody,
      sentAt: new Date().toISOString()
    };
  }

  // Real Twilio API integration
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "+14155238886";

  if (!accountSid || !authToken) {
    throw new Error("TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is missing for real WhatsApp dispatch");
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const bodyParams = new URLSearchParams();
  bodyParams.append("To", `whatsapp:${payload.to}`);
  bodyParams.append("From", `whatsapp:${fromNumber}`);
  bodyParams.append("Body", messageBody);

  const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: bodyParams.toString()
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Twilio dispatch failed: ${res.status} - ${errorText}`);
  }

  const twilioRes = await res.json();
  return {
    success: true,
    sid: twilioRes.sid,
    status: twilioRes.status,
    recipient: payload.to,
    isMock: false,
    body: messageBody,
    sentAt: new Date().toISOString()
  };
}
