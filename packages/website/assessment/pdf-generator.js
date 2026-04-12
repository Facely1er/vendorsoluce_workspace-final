// PDF Report Generator using jsPDF
// This module handles clean PDF report generation for assessment results

export async function generatePdfReport(data) {
  // jsPDF should be loaded via script tag in HTML
  // Try multiple possible locations where jsPDF might be exposed
  let jsPDF;
  if (window.jsPDF) {
    jsPDF = window.jsPDF;
  } else if (window.jspdf && window.jspdf.jsPDF) {
    jsPDF = window.jspdf.jsPDF;
  } else {
    throw new Error('jsPDF library not loaded. Please ensure jsPDF is included in the page.');
  }
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredHeight) => {
    if (yPos + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrapping
  const addText = (text, x, y, maxWidth, fontSize = 10, fontStyle = 'normal') => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return lines.length * (fontSize * 0.35); // Approximate line height
  };

  // Header
  pdf.setFillColor(51, 105, 30); // vendorsoluce-green
  pdf.rect(margin, margin, contentWidth, 15, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.reportTitle || 'Supply Chain Risk Assessment Report', margin + 5, margin + 10);
  
  yPos = margin + 20;

  // Assessment Info
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Assessment Information', margin, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  yPos += addText(`Assessment Name: ${data.assessmentName}`, margin, yPos, contentWidth);
  yPos += addText(`Framework: ${data.framework || 'NIST SP 800-161 Supply Chain Risk Management'}`, margin, yPos, contentWidth);
  yPos += addText(`Completed: ${new Date(data.completedAt || Date.now()).toLocaleDateString()}`, margin, yPos, contentWidth);
  yPos += 5;

  checkPageBreak(30);

  // Executive Summary
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Executive Summary', margin, yPos);
  yPos += 8;

  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(51, 105, 30);
  const overallScoreText = `${data.overallScore}%`;
  const scoreWidth = pdf.getTextWidth(overallScoreText);
  pdf.text(overallScoreText, pageWidth - margin - scoreWidth, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  yPos += addText('Overall Compliance Score', pageWidth - margin - scoreWidth, yPos, scoreWidth);
  yPos += 10;

  // Score interpretation
  let interpretation = '';
  if (data.overallScore >= 80) {
    interpretation = 'Excellent: Strong compliance posture with comprehensive security controls in place.';
  } else if (data.overallScore >= 60) {
    interpretation = 'Good: Solid foundation with room for improvement in specific areas.';
  } else if (data.overallScore >= 40) {
    interpretation = 'Moderate: Basic controls in place, significant improvements needed.';
  } else {
    interpretation = 'Needs Improvement: Critical gaps identified requiring immediate attention.';
  }

  pdf.setFontSize(10);
  yPos += addText(interpretation, margin, yPos, contentWidth);
  yPos += 10;

  checkPageBreak(40);

  // Section Scores
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Section Scores', margin, yPos);
  yPos += 8;

  data.sectionScores.forEach((section, index) => {
    checkPageBreak(15);

    // Section name and score
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${index + 1}. ${section.title}`, margin, yPos);
    
    // Score with color coding
    const scoreText = `${section.percentage}%`;
    const scoreTextWidth = pdf.getTextWidth(scoreText);
    pdf.text(scoreText, pageWidth - margin - scoreTextWidth, yPos);
    
    // Status indicator
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const statusText = section.completed ? 'Complete' : 'Incomplete';
    pdf.text(statusText, pageWidth - margin - scoreTextWidth - 30, yPos);
    
    yPos += 7;

    // Progress bar visualization
    const barWidth = contentWidth * 0.6;
    const barHeight = 3;
    const barX = margin;
    const barY = yPos - 2;
    
    // Background
    pdf.setFillColor(230, 230, 230);
    pdf.rect(barX, barY, barWidth, barHeight, 'F');
    
    // Fill based on score
    const fillWidth = (barWidth * section.percentage) / 100;
    if (section.percentage >= 70) {
      pdf.setFillColor(51, 105, 30); // Green
    } else if (section.percentage >= 50) {
      pdf.setFillColor(255, 193, 7); // Yellow
    } else {
      pdf.setFillColor(244, 67, 54); // Red
    }
    pdf.rect(barX, barY, fillWidth, barHeight, 'F');
    
    yPos += 5;
  });

  yPos += 5;
  checkPageBreak(50);

  // Top Gaps / Recommendations
  if (data.gaps && data.gaps.length > 0) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Gaps & Recommendations', margin, yPos);
    yPos += 8;

    data.gaps.slice(0, 10).forEach((gap, index) => {
      checkPageBreak(25);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${gap.questionId}: ${gap.question}`, margin, yPos);
      yPos += 5;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Control: ${gap.control}`, margin + 5, yPos);
      yPos += 4;

      pdf.setTextColor(0, 0, 0);
      const guidanceLines = addText(`Guidance: ${gap.guidance}`, margin + 5, yPos, contentWidth - 10, 8);
      yPos += guidanceLines * 2.8;
      yPos += 3;
    });
  } else {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 105, 30);
    pdf.text('No critical gaps identified. Excellent compliance posture!', margin, yPos);
    yPos += 10;
  }

  // Footer on last page
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Generated by VendorSoluce - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    pdf.text(
      `vendorsoluce.com`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  return pdf;
}

export async function downloadPdfReport(data) {
  const pdf = await generatePdfReport(data);
  const fileName = `${(data.assessmentName || 'supply-chain-assessment').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}
