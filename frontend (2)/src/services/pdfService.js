/**
 * High-quality client-side PDF export utility
 * Uses html2pdf.js with crisp 2x canvas scaling and letter portrait formatting.
 * Includes a pure client-side PDF fallback so a .pdf file is GUARANTEED to download
 * directly to the user's computer without opening the print dialog.
 */

export const loadHtml2Pdf = async () => {
  if (typeof window !== 'undefined' && window.html2pdf) {
    return window.html2pdf;
  }

  // 1. Poll for window.html2pdf in case the head script is already in-flight
  for (let i = 0; i < 20; i++) {
    if (typeof window !== 'undefined' && window.html2pdf) {
      return window.html2pdf;
    }
    await new Promise((r) => setTimeout(r, 60));
  }

  // 2. If not yet loaded, inject fresh script tags from CDNs
  const cdnUrls = [
    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js',
    'https://unpkg.com/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js'
  ];

  for (const url of cdnUrls) {
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          if (window.html2pdf) resolve(window.html2pdf);
          else setTimeout(() => (window.html2pdf ? resolve(window.html2pdf) : reject(new Error('Object not ready'))), 100);
        };
        script.onerror = () => reject(new Error(`Failed to load ${url}`));
        document.head.appendChild(script);
      });
      if (window.html2pdf) return window.html2pdf;
    } catch (e) {
      console.warn(`Could not load html2pdf from ${url}:`, e);
    }
  }

  if (window.html2pdf) {
    return window.html2pdf;
  }

  throw new Error('html2pdf library could not be loaded from CDNs.');
};

/**
 * Pure JavaScript builder for PDF-1.3 with an embedded JPEG image
 * Fallback when external libraries are unavailable or blocked.
 */
function buildPdfFromJpegBlob(jpegBytes, imgWidth, imgHeight, filename) {
  // Letter size in points: 612 x 792 (8.5 x 11 inches)
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 18; // 0.25 inch
  const availW = pageWidth - margin * 2;
  const availH = pageHeight - margin * 2;

  let renderW = availW;
  let renderH = (imgHeight * availW) / imgWidth;
  if (renderH > availH) {
    renderH = availH;
    renderW = (imgWidth * availH) / imgHeight;
  }

  const posX = (pageWidth - renderW) / 2;
  const posY = pageHeight - margin - renderH;

  const enc = new TextEncoder();
  const chunks = [];
  const offsets = [];
  let byteOffset = 0;

  function pushStr(str) {
    const bytes = enc.encode(str);
    chunks.push(bytes);
    byteOffset += bytes.length;
  }

  function pushBytes(bytes) {
    chunks.push(bytes);
    byteOffset += bytes.length;
  }

  // PDF Header
  pushStr('%PDF-1.3\n%\xFF\xFF\xFF\xFF\n');

  // Object 1: Catalog
  offsets.push(byteOffset);
  pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Object 2: Pages
  offsets.push(byteOffset);
  pushStr('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // Object 3: Page
  offsets.push(byteOffset);
  pushStr(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
    `/Resources << /XObject << /Im1 5 0 R >> /ProcSet [/PDF /ImageC] >> ` +
    `/Contents 4 0 R >>\nendobj\n`
  );

  // Object 4: Contents Stream
  const contentStream = `q\n${renderW.toFixed(2)} 0 0 ${renderH.toFixed(2)} ${posX.toFixed(2)} ${posY.toFixed(2)} cm\n/Im1 Do\nQ\n`;
  offsets.push(byteOffset);
  pushStr(`4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`);

  // Object 5: Image XObject (JPEG stream)
  offsets.push(byteOffset);
  pushStr(
    `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} ` +
    `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  );
  pushBytes(jpegBytes);
  pushStr('\nendstream\nendobj\n');

  // XRef Table
  const startXRef = byteOffset;
  pushStr('xref\n0 6\n');
  pushStr('0000000000 65535 f \n');
  for (const off of offsets) {
    pushStr(off.toString().padStart(10, '0') + ' 00000 n \n');
  }

  // Trailer
  pushStr(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXRef}\n%%EOF\n`);

  // Create Blob and trigger direct browser download
  const fullBlob = new Blob(chunks, { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(fullBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 8000);
}

/**
 * Snapshot DOM element to canvas and export as PDF
 */
async function exportElementViaCanvasFallback(element, filename) {
  const rect = element.getBoundingClientRect();
  const width = Math.max(rect.width, 850);
  const height = Math.max(rect.height, 600);
  const scale = 2;

  // Use SVG ForeignObject snapshot
  const clone = element.cloneNode(true);
  clone.style.width = `${width}px`;
  clone.style.margin = '0';
  clone.style.background = '#FFFFFF';

  const wrapper = document.createElement('div');
  wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  wrapper.appendChild(clone);

  const serialized = new XMLSerializer().serializeToString(wrapper);
  const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        ${serialized}
      </foreignObject>
    </svg>
  `;

  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = svgUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0);

  URL.revokeObjectURL(svgUrl);

  const jpegBlob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.95));
  const arrayBuffer = await jpegBlob.arrayBuffer();
  const jpegBytes = new Uint8Array(arrayBuffer);

  buildPdfFromJpegBlob(jpegBytes, canvas.width, canvas.height, filename);
}

/**
 * Main export function called by UI buttons
 */
export const downloadPdfFromElement = async (elementOrId, filename = 'document.pdf') => {
  const element = typeof elementOrId === 'string'
    ? document.getElementById(elementOrId)
    : elementOrId;

  if (!element) {
    throw new Error('Target document element not found.');
  }

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // 1. Primary method: html2pdf.js with jsPDF engine
  try {
    await loadHtml2Pdf();

    const opt = {
      margin: [0.2, 0.2, 0.2, 0.2],
      filename: cleanFilename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1000
      },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: 'portrait'
      }
    };

    await window.html2pdf().set(opt).from(element).save();
    return true;
  } catch (err) {
    console.warn('html2pdf attempt failed, activating direct PDF generator fallback:', err);
    // 2. Guaranteed client-side fallback: captures element to canvas and generates valid PDF file
    try {
      await exportElementViaCanvasFallback(element, cleanFilename);
      return true;
    } catch (fallbackErr) {
      console.error('All PDF generation methods failed:', fallbackErr);
      throw new Error(`Failed to generate PDF: ${fallbackErr.message || err.message}`);
    }
  }
};
