// دوال التصدير والطباعة: PDF / PNG / فيديو لبطاقة المشترك

import { Subscriber, Operation } from '@/types';
import { toast } from 'sonner';

export function printSubscriberPDF(found: Subscriber, subscriberOps: Operation[]) {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) { toast.error('يرجى السماح بالنوافذ المنبثقة'); return; }

  const fields = [
    { label: 'الجوال', value: found.phone },
    { label: 'الآيبان', value: found.iban },
    { label: 'البنك', value: found.bankName },
    { label: 'حساب النظام', value: found.systemAccount },
    { label: 'العملة', value: found.currency },
    { label: 'المنصة', value: found.platform },
    { label: 'تاريخ الانضمام', value: found.joinDate },
  ].filter(f => f.value && String(f.value).trim() !== '');

  const financials = [
    { label: 'مبلغ الاشتراك', value: found.subscriptionAmount, color: '#1d4ed8' },
    { label: 'الأرباح', value: found.profits, color: '#059669' },
    { label: 'رسوم النظام', value: found.systemFees, color: '#d97706' },
  ].filter(f => f.value != null && Number(f.value) > 0);

  const opsHTML = subscriberOps.length > 0 ? `
    <div class="section">
      <div class="section-title">سجل العمليات (${subscriberOps.length})</div>
      <table>
        <thead><tr><th>#</th><th>العملية</th><th>المبلغ</th><th>التاريخ</th><th>الحالة</th></tr></thead>
        <tbody>
          ${subscriberOps.slice(0, 20).map((op, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${op.operation}</td>
              <td style="color:${op.status === 'مكتمل' ? '#059669' : op.status === 'تنشيط النظام' ? '#dc2626' : '#2563eb'};font-weight:700;">${op.amount}</td>
              <td>${op.date}</td>
              <td>${op.status}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>` : '';

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>بيانات المشترك — ${found.name}</title>
<style>
  @page { size: A4 portrait; margin: 18mm 15mm 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, Tahoma, sans-serif; direction: rtl; color: #1e293b; background: white; font-size: 13px; line-height: 1.6; }
  .header { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: white; padding: 22px 20px; border-radius: 10px; margin-bottom: 18px; }
  .header-title { font-size: 22px; font-weight: 900; margin-bottom: 3px; }
  .header-sub { font-size: 11px; color: #94a3b8; }
  .name-row { margin-bottom: 16px; }
  .subscriber-name { font-size: 28px; font-weight: 900; color: #0f172a; margin-bottom: 5px; }
  .status-badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
  .section { margin-bottom: 18px; }
  .section-title { font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1.5px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .field { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
  .field-label { font-size: 10px; color: #94a3b8; font-weight: 600; margin-bottom: 3px; }
  .field-value { font-size: 13px; font-weight: 700; color: #0f172a; word-break: break-all; }
  .fin-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .fin-card { border-radius: 8px; padding: 12px 14px; border: 1px solid #e2e8f0; }
  .fin-label { font-size: 10px; margin-bottom: 5px; font-weight: 600; }
  .fin-value { font-size: 20px; font-weight: 900; }
  table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin-top: 4px; }
  th { background: #f1f5f9; padding: 8px 10px; text-align: right; font-weight: 700; color: #475569; border-bottom: 2px solid #e2e8f0; }
  td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; color: #334155; }
  tr:nth-child(even) td { background: #fafafa; }
  .wallet-box { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 10px 12px; font-family: monospace; font-size: 11px; color: #7c3aed; word-break: break-all; }
  .notes-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 12px; font-size: 12px; color: #92400e; }
  .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
</style>
</head>
<body>
  <div class="header">
    <div class="header-title">نظام إدارة المشتركين</div>
    <div class="header-sub">تقرير بيانات المشترك — ${new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>
  <div class="name-row">
    <div class="subscriber-name">${found.name}</div>
    ${found.subscriberStatus ? `<span class="status-badge">${found.subscriberStatus}</span>` : ''}
  </div>
  ${fields.length > 0 ? `
  <div class="section">
    <div class="section-title">البيانات الشخصية</div>
    <div class="grid">
      ${fields.map(f => `<div class="field"><div class="field-label">${f.label}</div><div class="field-value">${f.value}</div></div>`).join('')}
    </div>
  </div>` : ''}
  ${financials.length > 0 ? `
  <div class="section">
    <div class="section-title">الملخص المالي</div>
    <div class="fin-grid">
      ${financials.map(f => `
        <div class="fin-card" style="background:${f.color}10;border-color:${f.color}30;">
          <div class="fin-label" style="color:${f.color};">${f.label}</div>
          <div class="fin-value" style="color:${f.color};">${f.value.toLocaleString()} ر.س</div>
        </div>`).join('')}
    </div>
  </div>` : ''}
  ${found.walletAddress ? `
  <div class="section">
    <div class="section-title">المحفظة الرقمية</div>
    <div class="wallet-box">${found.walletAddress}</div>
  </div>` : ''}
  ${found.notes ? `<div class="notes-box" style="margin-bottom:18px;">${found.notes}</div>` : ''}
  ${opsHTML}
  <div class="footer">
    <span>نظام إدارة المشتركين — Moshtarikeen Hub</span>
    <span>طُبع في: ${new Date().toLocaleString('ar-SA')}</span>
  </div>
</body>
</html>`;

  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 700);
}
