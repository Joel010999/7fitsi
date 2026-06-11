'use client';

import { useRef, useCallback } from 'react';
import './GiftCardVisual.css';

export default function GiftCardVisual({ code, amount, recipientName, message, onClose }) {
  const cardRef = useRef(null);

  const handleDownload = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = 1200;
    const h = 700;
    canvas.width = w;
    canvas.height = h;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0a0a0a');
    grad.addColorStop(0.5, '#1a1a1a');
    grad.addColorStop(1, '#0d0d0d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Decorative corner lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(40, 80);
    ctx.lineTo(40, 40);
    ctx.lineTo(80, 40);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(w - 80, 40);
    ctx.lineTo(w - 40, 40);
    ctx.lineTo(w - 40, 80);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(40, h - 80);
    ctx.lineTo(40, h - 40);
    ctx.lineTo(80, h - 40);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(w - 80, h - 40);
    ctx.lineTo(w - 40, h - 40);
    ctx.lineTo(w - 40, h - 80);
    ctx.stroke();

    // Subtle line accent
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, h / 2);
    ctx.lineTo(w - 80, h / 2);
    ctx.stroke();

    // Brand
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '600 16px Arial, sans-serif';
    ctx.letterSpacing = '8px';
    ctx.textAlign = 'left';
    ctx.fillText('7 C E R O   S P O R T S', 80, 100);

    // Gift Card label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = '600 13px Arial, sans-serif';
    ctx.fillText('G I F T   C A R D', 80, 130);

    // Amount
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 90px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`$${parseInt(amount).toLocaleString('es-AR')}`, 80, 280);

    // Recipient name
    if (recipientName) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '400 20px Arial, sans-serif';
      ctx.fillText(`Para: ${recipientName}`, 80, 330);
    }

    // Message
    if (message) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'italic 18px Arial, sans-serif';
      // Word wrap
      const words = message.split(' ');
      let line = '';
      let y = recipientName ? 370 : 340;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > w - 200 && n > 0) {
          ctx.fillText(`"${line.trim()}"`, 80, y);
          line = words[n] + ' ';
          y += 28;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim() ? `"${line.trim()}"` : '', 80, y);
    }

    // Code - bottom area
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '600 14px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CÓDIGO', 80, h - 110);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 36px "Courier New", monospace';
    ctx.fillText(code, 80, h - 70);

    // Valid text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = '400 12px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Válida por 12 meses desde su emisión', w - 80, h - 70);
    ctx.fillText('Presentar este código al momento de la compra', w - 80, h - 50);

    // Download
    const link = document.createElement('a');
    link.download = `GiftCard-${code}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [code, amount, recipientName, message]);

  return (
    <div className="giftcard-modal-overlay" onClick={onClose}>
      <div className="giftcard-modal" onClick={(e) => e.stopPropagation()}>
        <button className="giftcard-modal-close" onClick={onClose}>✕</button>
        
        <div className="giftcard-visual" ref={cardRef}>
          <div className="gc-corner gc-tl"></div>
          <div className="gc-corner gc-tr"></div>
          <div className="gc-corner gc-bl"></div>
          <div className="gc-corner gc-br"></div>
          
          <div className="gc-header">
            <span className="gc-brand">7CERO SPORTS</span>
            <span className="gc-label">GIFT CARD</span>
          </div>
          
          <div className="gc-amount">
            ${parseInt(amount).toLocaleString('es-AR')}
          </div>
          
          {recipientName && (
            <div className="gc-recipient">Para: {recipientName}</div>
          )}
          
          {message && (
            <div className="gc-message">"{message}"</div>
          )}
          
          <div className="gc-divider"></div>
          
          <div className="gc-footer">
            <div className="gc-code-section">
              <span className="gc-code-label">CÓDIGO</span>
              <span className="gc-code">{code}</span>
            </div>
            <div className="gc-validity">
              Válida por 12 meses
            </div>
          </div>
        </div>

        <div className="giftcard-modal-actions">
          <button className="gc-download-btn" onClick={handleDownload}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Descargar Imagen
          </button>
          <button className="gc-copy-btn" onClick={() => { navigator.clipboard.writeText(code); alert('Código copiado!'); }}>
            Copiar Código
          </button>
        </div>
      </div>
    </div>
  );
}
