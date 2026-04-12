import DOMPurify from 'dompurify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface HtmlToPdfOptions {
  pageWidthMm?: number;
  pageHeightMm?: number;
  contentWidthMm?: number;
  scale?: number;
}

export const renderHtmlToPdf = async (
  htmlContent: string,
  options: HtmlToPdfOptions = {}
): Promise<jsPDF> => {
  const pageWidthMm = options.pageWidthMm ?? 210;
  const pageHeightMm = options.pageHeightMm ?? 295;
  const contentWidthMm = options.contentWidthMm ?? pageWidthMm;
  const scale = options.scale ?? 2;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = DOMPurify.sanitize(htmlContent);
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '210mm';
  tempDiv.style.padding = '20px';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  tempDiv.style.fontSize = '12px';
  tempDiv.style.lineHeight = '1.4';
  tempDiv.style.color = '#333';
  tempDiv.style.backgroundColor = '#fff';

  document.body.appendChild(tempDiv);

  try {
    const canvas = await html2canvas(tempDiv, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgHeight = (canvas.height * contentWidthMm) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, contentWidthMm, imgHeight);
    heightLeft -= pageHeightMm;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, contentWidthMm, imgHeight);
      heightLeft -= pageHeightMm;
    }

    return pdf;
  } finally {
    if (tempDiv.parentNode) {
      document.body.removeChild(tempDiv);
    }
  }
};
