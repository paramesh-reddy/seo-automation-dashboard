import { sendWhatsAppNotification, WhatsAppMessagePayload } from '../../mocks/twilio.mock.ts';

export interface AuditNotificationRecord {
  id: string;
  auditId: string;
  channel: 'WHATSAPP' | 'EMAIL';
  recipient: string;
  status: 'SENT' | 'FAILED';
  payload: any;
  sentAt: string;
}

const inMemoryNotifications: AuditNotificationRecord[] = [];

export async function dispatchAuditNotification(data: {
  auditId: string;
  clientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  websiteUrl: string;
  overallScore: number;
  criticalIssuesCount: number;
  reportUrl: string;
}): Promise<AuditNotificationRecord> {
  const payload: WhatsAppMessagePayload = {
    to: data.recipientPhone,
    clientName: data.clientName,
    websiteUrl: data.websiteUrl,
    overallScore: data.overallScore,
    reportUrl: data.reportUrl,
    criticalIssuesCount: data.criticalIssuesCount
  };

  try {
    const result = await sendWhatsAppNotification(payload);

    const record: AuditNotificationRecord = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      auditId: data.auditId,
      channel: 'WHATSAPP',
      recipient: data.recipientPhone,
      status: result.success ? 'SENT' : 'FAILED',
      payload: result,
      sentAt: new Date().toISOString()
    };

    inMemoryNotifications.unshift(record);
    return record;
  } catch (err: any) {
    console.error(`[Notification Failure] ${err.message}`);
    const failRecord: AuditNotificationRecord = {
      id: `notif_${Date.now()}_fail`,
      auditId: data.auditId,
      channel: 'WHATSAPP',
      recipient: data.recipientPhone,
      status: 'FAILED',
      payload: { error: err.message },
      sentAt: new Date().toISOString()
    };
    inMemoryNotifications.unshift(failRecord);
    return failRecord;
  }
}

export function getNotificationsByAuditId(auditId: string): AuditNotificationRecord[] {
  return inMemoryNotifications.filter(n => n.auditId === auditId);
}
