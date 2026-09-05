// دوال التصدير والطباعة: PDF / PNG / فيديو لبطاقة المشترك

import { Subscriber, Operation } from '@/types';
import { toast } from 'sonner';

export function createSubscriberVideo(
  found: Subscriber,
  subscriberOps: Operation[],
  queryText: string,
  quality: '480p' | '720p' | '1080p',
  onComplete: () => void
) {
  // ── iPhone 16 Pro Max portrait (390×844 base) ──
  const dims: Record<string, [number, number]> = {
    '480p': [390, 844],
    '720p': [585, 1266],
    '1080p': [780, 1688],
  };
  const [W, H] = dims[quality];
  const sc = W / 390;

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  const mime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
  const bitrate = quality === '1080p' ? 8_000_000 : quality === '720p' ? 4_000_000 : 2_000_000;
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: bitrate });
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mime.split(';')[0] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `استعلام_${found.name}_${quality}.webm`;
    a.click(); URL.revokeObjectURL(url);
    toast.success(`تم إنشاء الفيديو بجودة ${quality} بنجاح`);
    onComplete();
  };

  const FPS = 30;
  // phases: typing(90) + loading(45) + scroll(330) + hold(60) = 525
  const TOTAL = 525;
  let frame = 0;

  // ── Data preparation ──
  const infoFields = [
    { label: 'الجوال', value: found.phone },
    { label: 'الآيبان', value: found.iban },
    { label: 'البنك', value: found.bankName },
    { label: 'حساب النظام', value: found.systemAccount },
    { label: 'العملة', value: found.currency },
    { label: 'المنصة', value: found.platform },
  ].filter(f => f.value && String(f.value).trim() !== '');

  const finCards = [
    { label: 'الأرباح', value: found.profits, bg: '#f0fdf4', ring: '#86efac', color: '#15803d' },
    { label: 'مبلغ الاشتراك', value: found.subscriptionAmount, bg: '#eff6ff', ring: '#93c5fd', color: '#1d4ed8' },
    { label: 'رسوم النظام', value: found.systemFees, bg: '#fff7ed', ring: '#fdba74', color: '#c2410c' },
  ].filter(f => f.value != null && Number(f.value) > 0);

  const hasWallet = found.walletAddress && found.walletAddress.trim() !== '';
  const hasFees = found.systemFees > 0;
  const hasOps = subscriberOps.length > 0;

  // ── Content layout constants (in base-390 pixels, scaled by sc) ──
  // All Y values are "content-space" relative to top of scrollable content.
  // Screen Y = contentY * sc + CHROME_H - scrollY
  const CHROME_H = 102 * sc; // status bar (50) + safari bar (52)
  const FLD_H = 58;           // each info field card height
  const FLD_GAP = 8;          // gap between info field cards
  const FIN_ROW_H = 82;       // financial card row height
  const OPS_ROW_H = 52;       // each ops row height
  const OPS_HEADER_H = 70;    // ops table header+column-headers

  // Content block Y starts (base-390):
  const C_APPBAR = 0;
  const C_TITLE = 47;
  const C_SEARCH = 122;
  const C_SEARCH_H = 185;
  const C_PROFILE = C_SEARCH + C_SEARCH_H + 14;   // ~321
  const C_PROFILE_H = 124;
  const C_FIELDS = C_PROFILE + C_PROFILE_H + 12;  // ~457
  const C_FIELDS_H = infoFields.length * (FLD_H + FLD_GAP);
  const C_FINS = C_FIELDS + C_FIELDS_H + 14;
  const C_FINS_H = Math.ceil(finCards.length / 2) * (FIN_ROW_H + 8) + (hasWallet ? FIN_ROW_H + 8 : 0);
  const C_WARN = C_FINS + C_FINS_H + (hasFees ? 0 : -8);
  const C_WARN_H = hasFees ? 44 : 0;
  const C_OPS = C_WARN + C_WARN_H + 14;
  const C_OPS_H = hasOps ? OPS_HEADER_H + subscriberOps.length * OPS_ROW_H : 0;
  const TOTAL_CONTENT = (C_OPS + C_OPS_H + 32) * sc;

  function easeOut(t: number) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3); }
  function easeInOut(t: number) { const c = Math.max(0, Math.min(1, t)); return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2; }
  function lerp(a: number, b: number, t: number) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

  function rrect(x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  // Clipped text draw helper
  function t(text: string, x: number, y: number, sz: number, color: string, align: CanvasTextAlign = 'right', bold = false, maxW?: number) {
    ctx.fillStyle = color;
    ctx.font = `${bold ? 'bold ' : ''}${Math.round(sz * sc)}px Arial`;
    ctx.textAlign = align;
    if (maxW) ctx.fillText(text, x, y, maxW); else ctx.fillText(text, x, y);
  }

  // Content Y → screen Y (applies scroll offset + chrome height)
  function sy(contentY: number, scrollY: number) { return contentY * sc + CHROME_H - scrollY; }

  // Check if a block is within visible screen area
  function visible(screenTop: number, blockH: number) {
    return screenTop < H && screenTop + blockH > CHROME_H;
  }

  // ── Fixed Chrome (always on top) ──
  function drawChrome() {
    // ── iPhone status bar ──
    ctx.fillStyle = 'rgba(248,250,252,0.97)';
    ctx.fillRect(0, 0, W, 50 * sc);

    // Dynamic Island
    ctx.fillStyle = '#000';
    rrect(W / 2 - 55 * sc, 7 * sc, 110 * sc, 30 * sc, 15 * sc); ctx.fill();

    // Time (right)
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${13 * sc}px Arial`; ctx.textAlign = 'right';
    ctx.fillText(`${hh}:${mm}`, W - 14 * sc, 30 * sc);

    // Left: recording dot + signal + wifi + battery
    const lx = 14 * sc, iy = 26 * sc;
    // Recording dot (red)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(lx, iy - 2 * sc, 4.5 * sc, 0, Math.PI * 2); ctx.fill();
    // Signal bars
    for (let i = 0; i < 4; i++) {
      const bh = (4 + i * 2.5) * sc;
      ctx.fillStyle = i < 3 ? '#0f172a' : 'rgba(15,23,42,0.22)';
      ctx.fillRect(lx + 13 * sc + i * 5 * sc, iy - bh + 2 * sc, 3.5 * sc, bh);
    }
    // WiFi
    for (let i = 3; i >= 1; i--) {
      ctx.strokeStyle = i > 1 ? '#0f172a' : 'rgba(15,23,42,0.22)';
      ctx.lineWidth = 1.5 * sc;
      ctx.beginPath();
      ctx.arc(lx + 37 * sc, iy + 1 * sc, i * 3 * sc, Math.PI + 0.5, Math.PI * 2 - 0.5);
      ctx.stroke();
    }
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(lx + 37 * sc, iy + 1 * sc, 1.4 * sc, 0, Math.PI * 2); ctx.fill();
    // Battery
    const bx = lx + 50 * sc;
    ctx.strokeStyle = 'rgba(15,23,42,0.38)'; ctx.lineWidth = 1.2 * sc;
    rrect(bx, iy - 5 * sc, 20 * sc, 10 * sc, 2.5 * sc); ctx.stroke();
    ctx.fillStyle = 'rgba(15,23,42,0.38)';
    rrect(bx + 20 * sc + 1, iy - 2.5 * sc, 2 * sc, 5 * sc, 1 * sc); ctx.fill();
    ctx.fillStyle = '#22c55e';
    rrect(bx + 1.5 * sc, iy - 3.5 * sc, 13 * sc, 7 * sc, 2 * sc); ctx.fill();

    // ── Safari bar ──
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 50 * sc, W, 52 * sc);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 101 * sc, W, 1);

    // URL pill
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.06)'; ctx.shadowBlur = 5 * sc;
    rrect(W / 2 - 122 * sc, 60 * sc, 244 * sc, 34 * sc, 10 * sc); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#475569';
    ctx.font = `${10.5 * sc}px Arial`; ctx.textAlign = 'center';
    ctx.fillText('moshtarikeen-hubv3.vercel.app', W / 2, 81 * sc);
    // Lock icon
    ctx.fillStyle = '#64748b';
    ctx.font = `${11 * sc}px Arial`; ctx.textAlign = 'left';
    ctx.fillText('🔒', W / 2 - 114 * sc, 82 * sc);
    // Nav arrows
    ctx.fillStyle = '#94a3b8'; ctx.font = `bold ${18 * sc}px Arial`;
    ctx.textAlign = 'left'; ctx.fillText('‹', 10 * sc, 84 * sc);
    ctx.fillText('›', 30 * sc, 84 * sc);
    ctx.textAlign = 'right'; ctx.fillText('↑', W - 12 * sc, 82 * sc);

    // clip content to below chrome
    ctx.save();
    ctx.beginPath(); ctx.rect(0, CHROME_H, W, H - CHROME_H); ctx.clip();
  }

  // ── App header bar ──
  function drawAppBar(scrollY: number) {
    const top = sy(C_APPBAR, scrollY);
    if (!visible(top, 47 * sc)) return;
    // White bar
    ctx.fillStyle = 'white';
    ctx.fillRect(0, top, W, 47 * sc);
    ctx.fillStyle = '#f1f5f9'; ctx.fillRect(0, top + 46 * sc, W, 1);
    // Gradient top stripe
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, '#34d399'); g.addColorStop(0.35, '#2dd4bf'); g.addColorStop(1, '#60a5fa');
    ctx.fillStyle = g; ctx.fillRect(0, top, W, 4 * sc);
    // Logo circle
    const avG = ctx.createLinearGradient(24 * sc, top + 9 * sc, 52 * sc, top + 38 * sc);
    avG.addColorStop(0, '#34d399'); avG.addColorStop(1, '#14b8a6');
    ctx.fillStyle = avG;
    ctx.beginPath(); ctx.arc(38 * sc, top + 23 * sc, 14 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#065f46'; ctx.font = `bold ${12 * sc}px Arial`; ctx.textAlign = 'center';
    ctx.fillText('م', 38 * sc, top + 28 * sc);
    t('نظام إدارة المشتركين', W - 14 * sc, top + 29 * sc, 12, '#0f172a', 'right', true);
  }

  // ── Page title ──
  function drawPageTitle(scrollY: number) {
    const top = sy(C_TITLE, scrollY);
    if (!visible(top, 75 * sc)) return;
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, top, W, 75 * sc);
    t('نظام الإستعلام عن الأرباح', W / 2, top + 34 * sc, 21, '#0f172a', 'center', true);
    t('البحث عن مشترك وعرض تفاصيله الكاملة', W / 2, top + 56 * sc, 11.5, '#64748b', 'center');
  }

  // ── Search card ──
  function drawSearchCard(scrollY: number, typed: string, showStats: boolean) {
    const top = sy(C_SEARCH, scrollY);
    const cH = C_SEARCH_H * sc;
    if (!visible(top, cH)) return;
    const PAD = 14 * sc;
    const CW = W - PAD * 2;
    ctx.fillStyle = '#1e293b';
    ctx.shadowColor = 'rgba(0,0,0,0.14)'; ctx.shadowBlur = 14 * sc; ctx.shadowOffsetY = 3 * sc;
    rrect(PAD, top, CW, cH, 16 * sc); ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    // Gradient top stripe
    const sg = ctx.createLinearGradient(PAD, 0, PAD + CW, 0);
    sg.addColorStop(0, '#10b981'); sg.addColorStop(0.5, '#06b6d4'); sg.addColorStop(1, '#6366f1');
    ctx.fillStyle = sg; ctx.fillRect(PAD, top, CW, 3 * sc);
    // Search icon (circle with magnifier)
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(PAD + 24 * sc, top + 30 * sc, 16 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'white'; ctx.lineWidth = 2.5 * sc;
    ctx.beginPath(); ctx.arc(PAD + 22 * sc, top + 28 * sc, 7 * sc, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PAD + 27 * sc, top + 33 * sc); ctx.lineTo(PAD + 31 * sc, top + 37 * sc); ctx.stroke();
    // Title
    t('الاستعلام عن المشترك', W - PAD - 12 * sc, top + 28 * sc, 14.5, 'white', 'right', true);
    t('ابحث بالاسم · الآيبان · رقم الهاتف · عنوان المحفظة · حساب النظام', W - PAD - 12 * sc, top + 46 * sc, 9, '#94a3b8', 'right');
    // Input row
    const inpY = top + 56 * sc;
    const inpH = 42 * sc;
    const btnW = 90 * sc;
    const inpW = CW - 28 * sc - btnW - 8 * sc;
    const inpX = PAD + 14 * sc + btnW + 8 * sc;
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.strokeStyle = showStats ? 'rgba(16,185,129,0.7)' : 'rgba(16,185,129,0.4)';
    ctx.lineWidth = 1.5;
    rrect(inpX, inpY, inpW, inpH, 10 * sc); ctx.fill(); ctx.stroke();
    if (typed) t(typed, inpX + inpW - 10 * sc, inpY + 27 * sc, 13, 'white', 'right', false, inpW - 16 * sc);
    if (!showStats && typed.length > 0 && Math.floor(frame / 12) % 2 === 0) {
      ctx.fillStyle = '#10b981';
      const tw = Math.min(ctx.measureText(typed).width, inpW - 20 * sc);
      ctx.fillRect(inpX + inpW - 10 * sc - tw - 3, inpY + 10 * sc, 2, 22 * sc);
    }
    // Search button
    const btnX = PAD + 14 * sc;
    const btnG2 = ctx.createLinearGradient(btnX, 0, btnX + btnW, 0);
    btnG2.addColorStop(0, '#10b981'); btnG2.addColorStop(1, '#06b6d4');
    ctx.fillStyle = btnG2;
    rrect(btnX, inpY, btnW, inpH, 10 * sc); ctx.fill();
    t('استعلام الآن', btnX + btnW / 2, inpY + 27 * sc, 11.5, 'white', 'center', true);
    // Stats row (appears after search)
    if (showStats) {
      const statY = inpY + inpH + 12 * sc;
      const statW = (CW - 28 * sc - 16 * sc) / 3;
      const stats = [
        { v: '1400', l: 'إجمالي المشتركين' },
        { v: '913', l: 'نشطون ✓' },
        { v: '31', l: 'رسوم مستحقة' },
      ];
      stats.forEach((s, i) => {
        const sx = PAD + 14 * sc + i * (statW + 8 * sc);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        rrect(sx, statY, statW, 44 * sc, 8 * sc); ctx.fill();
        t(s.v, sx + statW / 2, statY + 22 * sc, 15, 'white', 'center', true);
        t(s.l, sx + statW / 2, statY + 38 * sc, 8.5, '#64748b', 'center');
      });
    }
  }

  // ── Profile card ──
  function drawProfileCard(scrollY: number, alpha: number) {
    const top = sy(C_PROFILE, scrollY);
    const cH = C_PROFILE_H * sc;
    if (!visible(top, cH)) return;
    const PAD = 14 * sc, CW = W - PAD * 2;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.06)'; ctx.shadowBlur = 10 * sc; ctx.shadowOffsetY = 2 * sc;
    rrect(PAD, top, CW, cH, 16 * sc); ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
    rrect(PAD, top, CW, cH, 16 * sc); ctx.stroke();
    // Gradient stripe
    const pG = ctx.createLinearGradient(PAD, 0, PAD + CW, 0);
    pG.addColorStop(0, '#34d399'); pG.addColorStop(0.4, '#2dd4bf'); pG.addColorStop(1, '#60a5fa');
    ctx.fillStyle = pG; ctx.fillRect(PAD, top, CW, 4 * sc);
    // Avatar (green gradient rounded square)
    const avX = PAD + CW - 16 * sc - 52 * sc, avY = top + 14 * sc;
    const avG = ctx.createLinearGradient(avX, avY, avX + 52 * sc, avY + 96 * sc);
    avG.addColorStop(0, '#34d399'); avG.addColorStop(1, '#14b8a6');
    ctx.fillStyle = avG; rrect(avX, avY, 52 * sc, 96 * sc, 12 * sc); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.arc(avX + 26 * sc, avY + 30 * sc, 11 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(avX + 26 * sc, avY + 58 * sc, 17 * sc, 10 * sc, 0, Math.PI, 0); ctx.fill();
    // Green verified dot
    ctx.fillStyle = '#10b981'; ctx.strokeStyle = 'white'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(avX + 6 * sc, avY + 88 * sc, 8 * sc, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'white'; ctx.font = `bold ${9 * sc}px Arial`; ctx.textAlign = 'center';
    ctx.fillText('✓', avX + 6 * sc, avY + 91 * sc);
    // Name
    t(found.name, PAD + 14 * sc, top + 36 * sc, 19, '#0f172a', 'left', true);
    // Status badges
    const stMap: Record<string, { bg: string; ring: string; txt2: string }> = {
      'نشط': { bg: '#f0fdf4', ring: '#86efac', txt2: '#15803d' },
      'مشترك جديد': { bg: '#eff6ff', ring: '#93c5fd', txt2: '#1d4ed8' },
      'رسوم مستحقة': { bg: '#fff7ed', ring: '#fdba74', txt2: '#c2410c' },
      'توزيع أرباح': { bg: '#faf5ff', ring: '#d8b4fe', txt2: '#7e22ce' },
      'معلق': { bg: '#f8fafc', ring: '#cbd5e1', txt2: '#475569' },
      'موقوف': { bg: '#fef2f2', ring: '#fca5a5', txt2: '#991b1b' },
    };
    let bx = PAD + 14 * sc;
    if (found.subscriberStatus) {
      const sc2 = stMap[found.subscriberStatus] ?? stMap['معلق'];
      ctx.font = `bold ${9.5 * sc}px Arial`;
      const sw = ctx.measureText(found.subscriberStatus).width + 14 * sc;
      ctx.fillStyle = sc2.bg; ctx.strokeStyle = sc2.ring; ctx.lineWidth = 1;
      rrect(bx, top + 50 * sc, sw, 19 * sc, 9.5 * sc); ctx.fill(); ctx.stroke();
      t(found.subscriberStatus, bx + sw / 2, top + 63 * sc, 9.5, sc2.txt2, 'center', true);
      bx += sw + 6 * sc;
    }
    // Verified badge
    ctx.font = `bold ${9.5 * sc}px Arial`;
    const vw = ctx.measureText('موقّق 0').width + 14 * sc;
    ctx.fillStyle = '#f0fdf4'; ctx.strokeStyle = '#86efac'; ctx.lineWidth = 1;
    rrect(bx, top + 50 * sc, vw, 19 * sc, 9.5 * sc); ctx.fill(); ctx.stroke();
    t('موقّق 0', bx + vw / 2, top + 63 * sc, 9.5, '#15803d', 'center', true);
    // Join date + phone
    if (found.joinDate) t(`📅 عضو منذ ${found.joinDate}`, PAD + 14 * sc, top + 84 * sc, 10, '#94a3b8', 'left');
    ctx.globalAlpha = 1;
  }

  // ── Info fields ──
  function drawInfoFields(scrollY: number, revealedCount: number) {
    const PAD = 14 * sc, CW = W - PAD * 2;
    infoFields.slice(0, revealedCount).forEach((fld, i) => {
      const top = sy(C_FIELDS + i * (FLD_H + FLD_GAP), scrollY);
      const fH = FLD_H * sc;
      if (!visible(top, fH)) return;
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'rgba(0,0,0,0.04)'; ctx.shadowBlur = 5 * sc; ctx.shadowOffsetY = 1 * sc;
      rrect(PAD, top, CW, fH, 11 * sc); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 1;
      rrect(PAD, top, CW, fH, 11 * sc); ctx.stroke();
      t(fld.label, W - PAD - 12 * sc, top + 20 * sc, 9.5, '#94a3b8', 'right');
      const v = String(fld.value).length > 32 ? String(fld.value).slice(0, 30) + '…' : String(fld.value);
      t(v, W - PAD - 12 * sc, top + 42 * sc, 13, '#1e293b', 'right', true, CW - 24 * sc);
    });
  }

  // ── Financial cards ──
  function drawFinancialCards(scrollY: number, alpha: number) {
    const PAD = 14 * sc;
    const gap = 8 * sc;
    const fw = (W - PAD * 2 - gap) / 2;
    finCards.forEach((fin, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const fx = PAD + col * (fw + gap);
      const top = sy(C_FINS + row * (FIN_ROW_H + 8), scrollY);
      if (!visible(top, FIN_ROW_H * sc)) return;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = fin.bg;
      ctx.shadowColor = 'rgba(0,0,0,0.04)'; ctx.shadowBlur = 6 * sc; ctx.shadowOffsetY = 1 * sc;
      rrect(fx, top, fw, FIN_ROW_H * sc, 14 * sc); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.strokeStyle = fin.ring; ctx.lineWidth = 1;
      rrect(fx, top, fw, FIN_ROW_H * sc, 14 * sc); ctx.stroke();
      t(fin.label, fx + fw - 10 * sc, top + 22 * sc, 10, '#64748b', 'right');
      t(`${Number(fin.value).toLocaleString()} ر.س`, fx + fw / 2, top + 58 * sc, 17, fin.color, 'center', true);
      ctx.globalAlpha = 1;
    });
    // Wallet card (purple, full width) if exists
    if (hasWallet) {
      const walRow = Math.ceil(finCards.length / 2);
      const top = sy(C_FINS + walRow * (FIN_ROW_H + 8), scrollY);
      if (visible(top, FIN_ROW_H * sc)) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#faf5ff';
        ctx.shadowColor = 'rgba(0,0,0,0.04)'; ctx.shadowBlur = 6 * sc; ctx.shadowOffsetY = 1 * sc;
        rrect(PAD, top, W - PAD * 2, FIN_ROW_H * sc, 14 * sc); ctx.fill();
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        ctx.strokeStyle = '#d8b4fe'; ctx.lineWidth = 1;
        rrect(PAD, top, W - PAD * 2, FIN_ROW_H * sc, 14 * sc); ctx.stroke();
        t('# المحفظة الرقمية', W - PAD - 12 * sc, top + 22 * sc, 10, '#64748b', 'right');
        const wa = found.walletAddress.length > 24 ? found.walletAddress.slice(0, 22) + '…' : found.walletAddress;
        t(wa, W - PAD - 12 * sc, top + 56 * sc, 13, '#7e22ce', 'right', true);
        ctx.globalAlpha = 1;
      }
    }
  }

  // ── Warning banner (fees) ──
  function drawWarningBanner(scrollY: number) {
    if (!hasFees) return;
    const top = sy(C_WARN, scrollY);
    if (!visible(top, C_WARN_H * sc)) return;
    const PAD = 14 * sc;
    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#fcd34d'; ctx.lineWidth = 1;
    rrect(PAD, top, W - PAD * 2, C_WARN_H * sc, 10 * sc); ctx.fill(); ctx.stroke();
    t('⚠ لمواصلة النظام يرجى تسديد الرسوم', W / 2, top + 27 * sc, 11, '#92400e', 'center', true);
  }

  // ── Subscriber ops table ──
  function drawOpsTable(scrollY: number, alpha: number) {
    if (!hasOps) return;
    const PAD = 14 * sc, CW = W - PAD * 2;
    const tableTop = sy(C_OPS, scrollY);
    const tableH = C_OPS_H * sc;
    if (!visible(tableTop, tableH)) return;
    ctx.globalAlpha = alpha;
    // White card
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.06)'; ctx.shadowBlur = 10 * sc; ctx.shadowOffsetY = 2 * sc;
    rrect(PAD, tableTop, CW, tableH, 16 * sc); ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 1;
    rrect(PAD, tableTop, CW, tableH, 16 * sc); ctx.stroke();
    // Gradient stripe
    const tG = ctx.createLinearGradient(PAD, 0, PAD + CW, 0);
    tG.addColorStop(0, '#34d399'); tG.addColorStop(1, '#60a5fa');
    ctx.fillStyle = tG; ctx.fillRect(PAD, tableTop, CW, 3 * sc);
    // Header
    t('سجل عمليات المشترك', W - PAD - 14 * sc, tableTop + 26 * sc, 13, '#0f172a', 'right', true);
    // Count badge
    ctx.font = `bold ${9.5 * sc}px Arial`;
    const bw = ctx.measureText(`${subscriberOps.length} عملية`).width + 14 * sc;
    ctx.fillStyle = '#f0fdf4'; ctx.strokeStyle = '#86efac'; ctx.lineWidth = 1;
    rrect(PAD + 12 * sc, tableTop + 14 * sc, bw, 20 * sc, 10 * sc); ctx.fill(); ctx.stroke();
    t(`${subscriberOps.length} عملية`, PAD + 12 * sc + bw / 2, tableTop + 28 * sc, 9.5, '#15803d', 'center', true);
    // Column headers
    const colY = tableTop + OPS_HEADER_H * sc - 24 * sc;
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(PAD, colY, CW, 24 * sc);
    t('#', PAD + 14 * sc, colY + 16 * sc, 9, '#94a3b8', 'left');
    t('العملية', PAD + 32 * sc, colY + 16 * sc, 9, '#94a3b8', 'left');
    t('المبلغ', W / 2 - 10 * sc, colY + 16 * sc, 9, '#94a3b8', 'center');
    t('التاريخ', W / 2 + 42 * sc, colY + 16 * sc, 9, '#94a3b8', 'center');
    t('الحالة', W - PAD - 12 * sc, colY + 16 * sc, 9, '#94a3b8', 'right');
    // Rows
    subscriberOps.forEach((op, i) => {
      const ry = tableTop + OPS_HEADER_H * sc + i * OPS_ROW_H * sc;
      if (!visible(ry, OPS_ROW_H * sc)) return;
      if (i > 0) {
        ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PAD + 8 * sc, ry); ctx.lineTo(W - PAD - 8 * sc, ry); ctx.stroke();
      }
      // Row num
      t(String(i + 1), PAD + 14 * sc, ry + 30 * sc, 10, '#94a3b8', 'left');
      // Op name
      t(String(op.operation || ''), PAD + 32 * sc, ry + 30 * sc, 11, '#334155', 'left', true, (W / 2 - 60 * sc) - (PAD + 32 * sc));
      // Amount
      const amt = Number(op.amount);
      t(`${Math.abs(amt).toLocaleString()} ر.س`, W / 2 - 10 * sc, ry + 30 * sc, 11, amt >= 0 ? '#15803d' : '#dc2626', 'center', true);
      // Date
      t(String(op.date || '').replace(/T.*/, ''), W / 2 + 42 * sc, ry + 30 * sc, 9.5, '#64748b', 'center');
      // Status badge
      const stColors: Record<string, { bg: string; ring: string; txt2: string }> = {
        'مكتمل': { bg: '#f0fdf4', ring: '#86efac', txt2: '#15803d' },
        'قيد التنفيذ': { bg: '#fffbeb', ring: '#fcd34d', txt2: '#92400e' },
        'تنشيط النظام': { bg: '#fefce8', ring: '#fde047', txt2: '#854d0e' },
        'ملغي': { bg: '#fef2f2', ring: '#fca5a5', txt2: '#991b1b' },
      };
      const stC = stColors[String(op.status)] ?? { bg: '#f8fafc', ring: '#e2e8f0', txt2: '#475569' };
      ctx.font = `bold ${9 * sc}px Arial`;
      const sw = ctx.measureText(String(op.status || '')).width + 12 * sc;
      ctx.fillStyle = stC.bg; ctx.strokeStyle = stC.ring; ctx.lineWidth = 1;
      rrect(W - PAD - 12 * sc - sw, ry + 19 * sc, sw, 18 * sc, 9 * sc); ctx.fill(); ctx.stroke();
      t(String(op.status || ''), W - PAD - 6 * sc, ry + 31 * sc, 9, stC.txt2, 'right', true);
    });
    ctx.globalAlpha = 1;
  }

  // ── Main page background ──
  function drawPageBg() {
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, CHROME_H, W, H - CHROME_H);
  }

  // ═══════════════════════════════
  // PHASE 1: Typing (0–89)
  // ═══════════════════════════════
  function phaseTyping(f: number) {
    drawPageBg();
    const chars = Math.floor(queryText.length * easeOut(f / 75));
    drawAppBar(0); drawPageTitle(0);
    drawSearchCard(0, queryText.slice(0, chars), false);
    drawChrome();
    ctx.restore();
  }

  // ═══════════════════════════════
  // PHASE 2: Loading → Result (90–134)
  // ═══════════════════════════════
  function phaseLoading(f: number) {
    drawPageBg();
    drawAppBar(0); drawPageTitle(0);
    drawSearchCard(0, queryText, f > 30);
    // Green progress bar
    if (f < 28) {
      const lt = easeOut(f / 27);
      ctx.fillStyle = 'rgba(16,185,129,0.6)';
      ctx.fillRect(14 * sc, (C_SEARCH + C_SEARCH_H) * sc + CHROME_H - 3 * sc, (W - 28 * sc) * lt, 3 * sc);
    }
    drawChrome(); ctx.restore();
  }

  // ═══════════════════════════════
  // PHASE 3: Scroll reveal (135–464)
  // ═══════════════════════════════
  function phaseScroll(f: number) {
    const maxScroll = Math.max(0, TOTAL_CONTENT - (H - CHROME_H) + 40 * sc);
    const sp = easeInOut(Math.min(1, f / 295));
    const scrollY = lerp(0, maxScroll, sp);

    // How many info fields revealed (animated one-by-one)
    const fieldsRevealed = Math.min(
      infoFields.length,
      Math.max(0, Math.floor((f - 30) / 12))
    );
    const finAlpha = Math.min(1, easeOut(Math.max(0, f - 60) / 40));
    const profAlpha = Math.min(1, easeOut(f / 30));
    const opsAlpha = Math.min(1, easeOut(Math.max(0, f - 100) / 40));

    drawPageBg();
    drawAppBar(scrollY); drawPageTitle(scrollY);
    drawSearchCard(scrollY, queryText, true);
    drawProfileCard(scrollY, profAlpha);
    drawInfoFields(scrollY, fieldsRevealed);
    drawFinancialCards(scrollY, finAlpha);
    drawWarningBanner(scrollY);
    drawOpsTable(scrollY, opsAlpha);
    drawChrome(); ctx.restore();
  }

  // ═══════════════════════════════
  // PHASE 4: Hold (465–524)
  // ═══════════════════════════════
  function phaseHold(_f: number) { phaseScroll(329); }

  recorder.start(200);
  function animate() {
    if (frame < 90) phaseTyping(frame);
    else if (frame < 135) phaseLoading(frame - 90);
    else if (frame < 465) phaseScroll(frame - 135);
    else phaseHold(frame - 465);
    frame++;
    if (frame <= TOTAL) setTimeout(animate, 1000 / FPS);
    else setTimeout(() => recorder.stop(), 300);
  }
  animate();
}
