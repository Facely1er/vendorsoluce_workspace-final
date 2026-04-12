import { extractWordDocumentContent } from './generatePdf';
import { downloadFromStorage, fileExists } from './supabaseStorage';

const ASSESSMENT_EVIDENCE_BUCKET = 'assessment-evidence';

/**
 * Process Word documents from assessment evidence files
 * Extracts content from DOCX files stored in Supabase Storage
 */
export const processAssessmentWordDocuments = async (
  evidenceFilePaths: string[]
): Promise<Array<{ name: string; content: string }>> => {
  const wordDocuments: Array<{ name: string; content: string }> = [];

  for (const filePath of evidenceFilePaths) {
    // Only process DOCX files
    if (!filePath.toLowerCase().endsWith('.docx')) {
      continue;
    }

    try {
      // Check if file exists in storage
      const exists = await fileExists(ASSESSMENT_EVIDENCE_BUCKET, filePath);
      
      if (exists) {
        // Download the file
        const blob = await downloadFromStorage(ASSESSMENT_EVIDENCE_BUCKET, filePath);
        
        // Extract text content
        const content = await extractWordDocumentContent(blob);
        
        // Extract filename from path
        const fileName = filePath.split('/').pop() || filePath;
        
        wordDocuments.push({
          name: fileName,
          content: content.substring(0, 10000) // Limit content length for PDF generation
        });
      }
    } catch (error) {
      console.error(`Error processing Word document ${filePath}:`, error);
      // Continue processing other files even if one fails
    }
  }

  return wordDocuments;
};

/**
 * Process Word document from File object (for client-side uploads)
 */
export const processWordDocumentFile = async (
  file: File
): Promise<{ name: string; content: string }> => {
  if (!file.name.toLowerCase().endsWith('.docx')) {
    throw new Error('File must be a DOCX format');
  }

  try {
    const content = await extractWordDocumentContent(file);
    return {
      name: file.name,
      content: content.substring(0, 10000) // Limit content length
    };
  } catch (error) {
    console.error('Error processing Word document file:', error);
    throw new Error(`Failed to process Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Process multiple Word document files
 */
export const processWordDocumentFiles = async (
  files: File[]
): Promise<Array<{ name: string; content: string }>> => {
  const wordDocuments: Array<{ name: string; content: string }> = [];

  for (const file of files) {
    if (file.name.toLowerCase().endsWith('.docx')) {
      try {
        const processed = await processWordDocumentFile(file);
        wordDocuments.push(processed);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        // Continue processing other files
      }
    }
  }

  return wordDocuments;
};

