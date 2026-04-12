import jsPDF from 'jspdf';
export const createPdfDocument = (): jsPDF => new jsPDF('p', 'mm', 'a4');
