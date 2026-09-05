// دوال التصدير والطباعة: PDF / PNG / فيديو لبطاقة المشترك

import { Subscriber, Operation } from '@/types';
import { toast } from 'sonner';

function drawRoundRectCanvas(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function downloadSubscriberPNG(found: Subscriber, subscriberOps: Operation[]) {
  // ── Light-theme PNG matching the AdminPanel UI exactly ──
  const fields = [
    { label: 'الجوال', value: found.phone },
    { label: 'الآيبان', value: found.iban },
    { label: 'البنك', value: found.bankName },
    { label: 'حساب النظام', value: found.systemAccount },
    { label: 'العملة', value: found.currency },
    { label: 'المنصة', value: found.platform },
    { label: 'تاريخ الانضمام', value: found.joinDate },
  ].filter(f => f.value && String(f.value).trim() !== '');

  // ── Light-theme matching FinBox: bg/ring/color for each financial ──
  const financials = [
    { label: 'مبلغ الاشتراك', value: found.subscriptionAmount, bg: '#eff6ff', ring: '#bfdbfe', color: '#1d4ed8' },
    { label: 'الأرباح', value: found.profits, bg: '#ecfdf5', ring: '#a7f3d0', color: '#047857' },
    { label: 'رسوم النظام', value: found.systemFees, bg: '#fff7ed', ring: '#fed7aa', color: '#ea580c' },
  ].filter(f => f.value != null && Number(f.value) > 0);

  const opsToShow = subscriberOps.slice(0, 12);
  const FCOLS = 4;
  const fieldRows = Math.ceil(fields.length / FCOLS);

  const W = 1200;
  const PAD = 48;
  // Dynamic height calculation
  let H = 76 + 16;                                          // header bar + gap
  H += 104 + 16;                                           // profile card + gap
  if (fields.length > 0) H += 22 + fieldRows * 76 + 16;   // section title + fields
  if (financials.length > 0) H += 22 + 88 + 16;           // section title + fin boxes
  if (found.walletAddress) H += 56 + 12;                  // wallet box
  if (found.notes) H += 56 + 12;                          // notes box
  if (opsToShow.length > 0) H += 22 + 40 + opsToShow.length * 44 + 16; // section title + table
  H += 52;                                                  // footer

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── Background: slate-50 ──
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, W, H);
  // Subtle grid
  ctx.strokeStyle = 'rgba(148,163,184,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let yg = 0; yg < H; yg += 48) { ctx.beginPath(); ctx.moveTo(0, yg); ctx.lineTo(W, yg); ctx.stroke(); }

  // ── Header Bar: white, emerald→teal→blue accent stripe ──
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, W, 72);
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 71, W, 1);
  const acG = ctx.createLinearGradient(0, 0, W, 0);
  acG.addColorStop(0, '#34d399'); acG.addColorStop(0.35, '#2dd4bf'); acG.addColorStop(1, '#60a5fa');
  ctx.fillStyle = acG;
  ctx.fillRect(0, 0, W, 4);
  // Logo circle (emerald-50, emerald ring)
  ctx.fillStyle = '#ecfdf5'; ctx.strokeStyle = '#6ee7b7'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(W - PAD - 22, 36, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#065f46'; ctx.font = 'bold 19px Arial'; ctx.textAlign = 'center';
  ctx.fillText('م', W - PAD - 22, 43);
  // Title text
  ctx.fillStyle = '#0f172a'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'right';
  ctx.fillText('نظام إدارة المشتركين', W - PAD - 58, 37);
  ctx.fillStyle = '#94a3b8'; ctx.font = '13px Arial';
  ctx.fillText(`تقرير استعلام — ${new Date().toLocaleDateString('ar-SA')}`, W - PAD - 58, 57);

  let y = 88;

  // ── Profile Card: white, ring-slate-200, emerald top strip, emerald avatar ──
  ctx.fillStyle = 'white';
  ctx.shadowColor = 'rgba(0,0,0,0.06)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 2;
  drawRoundRectCanvas(ctx, PAD, y, W - PAD * 2, 100, 14); ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
  drawRoundRectCanvas(ctx, PAD, y, W - PAD * 2, 100, 14); ctx.stroke();
  // Accent top strip (emerald→teal→blue, 5px)
  const profAccG = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
  profAccG.addColorStop(0, '#34d399'); profAccG.addColorStop(0.4, '#2dd4bf'); profAccG.addColorStop(1, '#60a5fa');
  ctx.fillStyle = profAccG;
  ctx.beginPath();
  ctx.moveTo(PAD + 14, y); ctx.lineTo(W - PAD - 14, y);
  ctx.quadraticCurveTo(W - PAD, y, W - PAD, y + 7);
  ctx.lineTo(W - PAD, y + 5); ctx.lineTo(PAD, y + 5);
  ctx.quadraticCurveTo(PAD, y, PAD + 14, y);
  ctx.closePath(); ctx.fill();
  // Avatar: emerald-400 → teal-500 rounded square (matching from-blue-500 to-indigo-600)
  const avGrad = ctx.createLinearGradient(PAD + 18, y + 14, PAD + 82, y + 86);
  avGrad.addColorStop(0, '#34d399'); avGrad.addColorStop(1, '#14b8a6');
  ctx.fillStyle = avGrad;
  drawRoundRectCanvas(ctx, PAD + 18, y + 16, 68, 68, 14); ctx.fill();
  // Person silhouette (head + shoulders)
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.beginPath(); ctx.arc(PAD + 52, y + 38, 12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(PAD + 52, y + 68, 20, 13, 0, Math.PI, 0); ctx.fill();
  // Verified dot (emerald-500, white border)
  ctx.fillStyle = '#10b981'; ctx.strokeStyle = 'white'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(PAD + 78, y + 76, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'white'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center';
  ctx.fillText('✓', PAD + 78, y + 80);
  // Subscriber name (text-slate-800 font-black)
  ctx.fillStyle = '#1e293b'; ctx.font = 'bold 26px Arial'; ctx.textAlign = 'right';
  ctx.fillText(found.name, W - PAD - 16, y + 46);
  // Status badge
  if (found.subscriberStatus) {
    const stMap: Record<string, { bg: string; ring: string; txt: string }> = {
      'نشط':         { bg: '#ecfdf5', ring: '#a7f3d0', txt: '#047857' },
      'مشترك جديد': { bg: '#eff6ff', ring: '#bfdbfe', txt: '#1d4ed8' },
      'رسوم مستحقة':{ bg: '#fff7ed', ring: '#fed7aa', txt: '#c2410c' },
      'توزيع أرباح':{ bg: '#faf5ff', ring: '#e9d5ff', txt: '#7e22ce' },
      'معلق':        { bg: '#f1f5f9', ring: '#cbd5e1', txt: '#475569' },
      'موقوف':       { bg: '#fef2f2', ring: '#fecaca', txt: '#991b1b' },
    };
    const sc = stMap[found.subscriberStatus] ?? { bg: '#f1f5f9', ring: '#cbd5e1', txt: '#475569' };
    ctx.font = 'bold 12px Arial';
    const nameW = ctx.measureText(found.name).width;
    const sw = ctx.measureText(found.subscriberStatus).width + 16;
    const sx = W - PAD - 16 - nameW - 12 - sw;
    ctx.fillStyle = sc.bg; ctx.strokeStyle = sc.ring; ctx.lineWidth = 1;
    drawRoundRectCanvas(ctx, sx, y + 28, sw, 22, 11); ctx.fill(); ctx.stroke();
    ctx.fillStyle = sc.txt; ctx.textAlign = 'right';
    ctx.fillText(found.subscriberStatus, sx + sw - 8, y + 44);
  }
  // Verified badge (bg-slate-100 text-slate-500)
  ctx.font = '11px Arial';
  const verW = ctx.measureText('موثّق').width + 14;
  ctx.fillStyle = '#f1f5f9'; ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
  drawRoundRectCanvas(ctx, W - PAD - 16 - verW, y + 56, verW, 20, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#64748b'; ctx.textAlign = 'right';
  ctx.fillText('موثّق', W - PAD - 9, y + 71);
  // Join date (text-slate-400 text-xs)
  if (found.joinDate) {
    ctx.fillStyle = '#94a3b8'; ctx.font = '12px Arial'; ctx.textAlign = 'right';
    ctx.fillText(`عضو منذ: ${found.joinDate}`, W - PAD - 16, y + 86);
  }

  y += 100 + 16;

  // ── Section header helper ──
  const sectionTitle = (title: string) => {
    ctx.fillStyle = '#64748b'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'right';
    ctx.fillText(title, W - PAD, y + 14);
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, y + 8);
    ctx.lineTo(W - PAD - ctx.measureText(title).width - 10, y + 8); ctx.stroke();
    y += 22;
  };

  // ── Mini-Info Fields: matching MiniInfo (bg-slate-50 ring-1 ring-slate-200) ──
  if (fields.length > 0) {
    sectionTitle('البيانات الشخصية');
    const gap = 12;
    const fw = (W - PAD * 2 - gap * (FCOLS - 1)) / FCOLS;
    fields.forEach((field, i) => {
      const col = i % FCOLS;
      const row = Math.floor(i / FCOLS);
      const fx = W - PAD - col * (fw + gap) - fw; // RTL: col0=rightmost
      const fy = y + row * 76;
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = 'rgba(0,0,0,0.03)'; ctx.shadowBlur = 3; ctx.shadowOffsetY = 1;
      drawRoundRectCanvas(ctx, fx, fy, fw, 64, 10); ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
      drawRoundRectCanvas(ctx, fx, fy, fw, 64, 10); ctx.stroke();
      // Label: text-slate-400 text-xs
      ctx.fillStyle = '#94a3b8'; ctx.font = '11px Arial'; ctx.textAlign = 'right';
      ctx.fillText(field.label, fx + fw - 12, fy + 22);
      // Value: text-slate-700 font-bold text-sm
      ctx.fillStyle = '#334155'; ctx.font = 'bold 13px Arial';
      const val = field.value.length > 24 ? field.value.slice(0, 22) + '…' : field.value;
      ctx.fillText(val, fx + fw - 12, fy + 50);
    });
    y += fieldRows * 76 + 16;
  }

  // ── Financial Boxes: matching FinBox (bg-blue-50 ring-blue-200, etc.) ──
  if (financials.length > 0) {
    sectionTitle('الملخص المالي');
    const gap = 12;
    const finW = (W - PAD * 2 - gap * (financials.length - 1)) / financials.length;
    financials.forEach((fin, i) => {
      const fx = W - PAD - i * (finW + gap) - finW; // RTL
      ctx.fillStyle = fin.bg;
      ctx.shadowColor = 'rgba(0,0,0,0.03)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 1;
      drawRoundRectCanvas(ctx, fx, y, finW, 84, 12); ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.strokeStyle = fin.ring; ctx.lineWidth = 1;
      drawRoundRectCanvas(ctx, fx, y, finW, 84, 12); ctx.stroke();
      // Label: text-slate-500 text-xs
      ctx.fillStyle = '#64748b'; ctx.font = '12px Arial'; ctx.textAlign = 'center';
      ctx.fillText(fin.label, fx + finW / 2, y + 28);
      // Value: colored, text-lg font-black
      ctx.fillStyle = fin.color; ctx.font = 'bold 22px Arial';
      ctx.fillText(`${fin.value.toLocaleString()} ر.س`, fx + finW / 2, y + 64);
    });
    y += 84 + 16;
  }

  // ── Wallet: bg-purple-50 ring-purple-200 text-purple-700 ──
  if (found.walletAddress) {
    ctx.fillStyle = '#faf5ff';
    ctx.shadowColor = 'rgba(0,0,0,0.03)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 1;
    drawRoundRectCanvas(ctx, PAD, y, W - PAD * 2, 52, 10); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 1;
    drawRoundRectCanvas(ctx, PAD, y, W - PAD * 2, 52, 10); ctx.stroke();
    ctx.fillStyle = '#7e22ce'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'right';
    ctx.fillText('المحفظة الرقمية', W - PAD - 14, y + 20);
    ctx.fillStyle = '#6d28d9'; ctx.font = '13px Arial';
    const wT = found.walletAddress.length > 78 ? found.walletAddress.slice(0, 76) + '…' : found.walletAddress;
    ctx.fillText(wT, W - PAD - 14, y + 40);
    y += 52 + 12;
  }

  // ── Notes: bg-yellow-50 ring-yellow-200 text-yellow-700 ──
  if (found.notes) {
    ctx.fillStyle = '#fefce8';
    ctx.shadowColor = 'rgba(0,0,0,0.03)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 1;
    drawRoundRectCanvas(ctx, PAD, y, W - PAD * 2, 52, 10); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 1;
    drawRoundRectCanvas(ctx, PAD, y, W - PAD * 2, 52, 10); ctx.stroke();
    ctx.fillStyle = '#a16207'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'right';
    ctx.fillText('ملاحظات', W - PAD - 14, y + 20);
    ctx.fillStyle = '#92400e'; ctx.font = '13px Arial';
    const nT = found.notes.length > 80 ? found.notes.slice(0, 78) + '…' : found.notes;
    ctx.fillText(nT, W - PAD - 14, y + 40);
    y += 52 + 12;
  }

  // ── Operations Table: white card, bg-slate-50 header, colored status badges ──
  if (opsToShow.length > 0) {
    sectionTitle(`سجل عمليات المشترك (${subscriberOps.length})`);
    const tH = 40 + opsToShow.length * 44;
    // Table card
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.05)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 1;
    drawRoundRectCanvas(ctx, PAD, y, W - PAD * 2, tH, 10); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
    drawRoundRectCanvas(ctx, PAD, y, W - PAD * 2, tH, 10); ctx.stroke();
    // Header row: bg-slate-50
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(PAD + 1, y + 1, W - PAD * 2 - 2, 39);
    ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, y + 40); ctx.lineTo(W - PAD, y + 40); ctx.stroke();
    // Column X positions (RTL: col0=rightmost = #)
    const colXs = [W - PAD - 28, W - PAD - 88, W - PAD - 390, W - PAD - 600, W - PAD - 830];
    const headers = ['#', 'العملية', 'المبلغ', 'التاريخ', 'الحالة'];
    ctx.fillStyle = '#64748b'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'right';
    headers.forEach((h, i) => ctx.fillText(h, colXs[i], y + 26));
    y += 40;
    opsToShow.forEach((op, i) => {
      if (i % 2 === 1) {
        ctx.fillStyle = 'rgba(248,250,252,0.7)';
        ctx.fillRect(PAD + 1, y, W - PAD * 2 - 2, 44);
      }
      if (i < opsToShow.length - 1) {
        ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PAD + 20, y + 44); ctx.lineTo(W - PAD - 20, y + 44); ctx.stroke();
      }
      // # column (text-slate-400 text-xs)
      ctx.fillStyle = '#94a3b8'; ctx.font = '12px Arial'; ctx.textAlign = 'right';
      ctx.fillText(String(i + 1), colXs[0], y + 28);
      // operation name (text-slate-600 text-sm)
      ctx.fillStyle = '#475569'; ctx.font = '13px Arial';
      const opN = op.operation.length > 32 ? op.operation.slice(0, 30) + '…' : op.operation;
      ctx.fillText(opN, colXs[1], y + 28);
      // amount color matching amountColor()
      const amtC = op.status === 'تنشيط النظام' ? '#dc2626'
                 : op.status === 'اشتراك جديد'  ? '#ca8a04'
                 : op.status === 'قيد المعالجة' ? '#2563eb' : '#059669';
      ctx.fillStyle = amtC; ctx.font = 'bold 13px Arial';
      ctx.fillText(op.amount, colXs[2], y + 28);
      // date (text-slate-500 text-xs)
      ctx.fillStyle = '#94a3b8'; ctx.font = '12px Arial';
      ctx.fillText(op.date, colXs[3], y + 28);
      // Status badge matching statusBadge()
      const stBg   = op.status === 'تنشيط النظام' ? '#fee2e2'
                   : op.status === 'اشتراك جديد'  ? '#fef9c3'
                   : op.status === 'قيد المعالجة' ? '#dbeafe' : '#d1fae5';
      const stRing = op.status === 'تنشيط النظام' ? '#fecaca'
                   : op.status === 'اشتراك جديد'  ? '#fde68a'
                   : op.status === 'قيد المعالجة' ? '#bfdbfe' : '#a7f3d0';
      const stTxt  = op.status === 'تنشيط النظام' ? '#b91c1c'
                   : op.status === 'اشتراك جديد'  ? '#a16207'
                   : op.status === 'قيد المعالجة' ? '#1d4ed8' : '#047857';
      ctx.font = 'bold 11px Arial';
      const sW = ctx.measureText(op.status).width + 16;
      ctx.fillStyle = stBg; ctx.strokeStyle = stRing; ctx.lineWidth = 1;
      drawRoundRectCanvas(ctx, colXs[4] - sW, y + 11, sW, 22, 11); ctx.fill(); ctx.stroke();
      ctx.fillStyle = stTxt; ctx.textAlign = 'right';
      ctx.fillText(op.status, colXs[4] - 8, y + 27);
      y += 44;
    });
    y += 16;
  }

  // ── Footer ──
  ctx.fillStyle = '#e2e8f0'; ctx.fillRect(PAD, y + 8, W - PAD * 2, 1);
  ctx.fillStyle = '#94a3b8'; ctx.font = '12px Arial'; ctx.textAlign = 'right';
  ctx.fillText('نظام إدارة المشتركين — Moshtarikeen Hub', W - PAD, y + 32);
  ctx.textAlign = 'left';
  ctx.fillText(`تاريخ التصدير: ${new Date().toLocaleString('ar-SA')}`, PAD, y + 32);

  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `مشترك_${found.name}_${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تنزيل الصورة بنجاح');
  }, 'image/png');
}
