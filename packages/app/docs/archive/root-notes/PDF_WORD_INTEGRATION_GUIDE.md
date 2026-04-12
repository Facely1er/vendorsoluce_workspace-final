# PDF Generation with Word Document Integration Guide

This guide explains how to use the enhanced PDF generation functionality that integrates assessment results with Word document content.

## Overview

The enhanced PDF generation system provides:
- **Comprehensive Assessment Reports** - Detailed PDFs with question-level responses
- **Word Document Integration** - Extract and include Word document content in PDF reports
- **Flexible Export Options** - Simple summary or comprehensive detailed reports

## Key Features

### 1. Comprehensive Assessment Reports

Generate detailed PDF reports that include:
- Overall compliance scores with visual indicators
- Section-by-section breakdowns
- Question-level responses with answers
- Evidence file references
- Word document content integration
- Key findings and recommendations

### 2. Word Document Processing

Extract text content from Word documents (DOCX) and include them in PDF reports:
- Process uploaded Word documents
- Extract content from stored evidence files
- Include document content in assessment reports

## Usage Examples

### Basic Assessment Report (Simple)

```typescript
import { generateResultsPdf } from '../utils/generatePdf';

await generateResultsPdf(
  'Supply Chain Risk Assessment - Results',
  75,
  [
    { title: 'Supplier Risk Management', percentage: 80 },
    { title: 'Vulnerability Management', percentage: 70 }
  ],
  'January 15, 2024',
  'assessment-results.pdf'
);
```

### Comprehensive Assessment Report

```typescript
import { generateComprehensiveAssessmentPdf, type ComprehensiveAssessmentData } from '../utils/generatePdf';
import { processAssessmentWordDocuments } from '../utils/wordDocumentProcessor';

// Prepare assessment data
const assessmentData: ComprehensiveAssessmentData = {
  assessmentName: 'Supply Chain Risk Assessment',
  frameworkName: 'NIST SP 800-161',
  overallScore: 75,
  sectionScores: [
    { title: 'Supplier Risk Management', percentage: 80, completed: true },
    { title: 'Vulnerability Management', percentage: 70, completed: true }
  ],
  completedDate: 'January 15, 2024',
  assessmentId: 'assessment-123',
  vendorName: 'Example Vendor Corp',
  organizationName: 'Your Organization',
  questions: [
    {
      id: 'AC-1',
      section: 'Access Control',
      question: 'Does your organization maintain a formal access control policy?',
      answer: 'Yes',
      type: 'yes_no',
      guidance: 'This should include documented procedures...',
      evidenceFiles: ['policy-document.docx']
    }
  ],
  wordDocuments: [
    {
      name: 'Security Policy.docx',
      content: 'Extracted content from Word document...'
    }
  ]
};

await generateComprehensiveAssessmentPdf(
  assessmentData,
  'comprehensive-assessment-report.pdf'
);
```

### Processing Word Documents from Evidence Files

```typescript
import { processAssessmentWordDocuments } from '../utils/wordDocumentProcessor';
import { generateComprehensiveAssessmentPdf } from '../utils/generatePdf';

// Get evidence file paths from assessment
const evidenceFilePaths = [
  'assessments/123/security-policy.docx',
  'assessments/123/compliance-certificate.docx'
];

// Process Word documents
const wordDocuments = await processAssessmentWordDocuments(evidenceFilePaths);

// Include in assessment data
const assessmentData: ComprehensiveAssessmentData = {
  // ... other assessment data
  wordDocuments: wordDocuments
};

await generateComprehensiveAssessmentPdf(assessmentData, 'report.pdf');
```

### Processing Uploaded Word Documents

```typescript
import { processWordDocumentFiles } from '../utils/wordDocumentProcessor';

// Handle file upload
const handleFileUpload = async (files: FileList) => {
  const fileArray = Array.from(files);
  const wordDocs = await processWordDocumentFiles(fileArray);
  
  // Use wordDocs in your assessment data
  console.log('Processed documents:', wordDocs);
};
```

### Integration in SupplyChainResults Component

The `SupplyChainResults` component now supports both simple and comprehensive exports:

```typescript
// Simple export (backward compatible)
handleExport(false);

// Comprehensive export with all details
handleExport(true);
```

## API Reference

### `generateComprehensiveAssessmentPdf`

Generates a comprehensive PDF report with detailed assessment data.

**Parameters:**
- `data: ComprehensiveAssessmentData` - Complete assessment data including questions and Word documents
- `filename: string` - Output PDF filename

**Returns:** `Promise<void>`

### `extractWordDocumentContent`

Extracts plain text from a Word document.

**Parameters:**
- `file: File | Blob` - Word document file

**Returns:** `Promise<string>` - Extracted text content

### `extractWordDocumentHtml`

Extracts HTML content from a Word document.

**Parameters:**
- `file: File | Blob` - Word document file

**Returns:** `Promise<string>` - Extracted HTML content

### `processAssessmentWordDocuments`

Processes Word documents from Supabase Storage evidence files.

**Parameters:**
- `evidenceFilePaths: string[]` - Array of file paths in storage

**Returns:** `Promise<Array<{ name: string; content: string }>>`

### `processWordDocumentFile`

Processes a single Word document file.

**Parameters:**
- `file: File` - Word document file

**Returns:** `Promise<{ name: string; content: string }>`

## Data Structures

### `ComprehensiveAssessmentData`

```typescript
interface ComprehensiveAssessmentData {
  assessmentName: string;
  frameworkName: string;
  overallScore: number;
  sectionScores: { title: string; percentage: number; completed: boolean }[];
  completedDate: string;
  assessmentId?: string;
  vendorName?: string;
  organizationName?: string;
  questions?: AssessmentQuestion[];
  wordDocuments?: Array<{ name: string; content: string }>;
  metadata?: {
    contactEmail?: string;
    dueDate?: string;
    status?: string;
  };
}
```

### `AssessmentQuestion`

```typescript
interface AssessmentQuestion {
  id: string;
  section: string;
  question: string;
  answer: string | number | boolean | null;
  type: 'yes_no' | 'yes_no_na' | 'text' | 'file_upload' | 'scale';
  guidance?: string;
  evidenceFiles?: string[];
}
```

## Best Practices

1. **Limit Content Length**: Word document content is automatically truncated to 10,000 characters to prevent PDF generation issues.

2. **Error Handling**: Always wrap PDF generation in try-catch blocks:
   ```typescript
   try {
     await generateComprehensiveAssessmentPdf(data, filename);
   } catch (error) {
     console.error('PDF generation failed:', error);
     // Show user-friendly error message
   }
   ```

3. **Loading States**: Show loading indicators during PDF generation as it can take time:
   ```typescript
   const [isGenerating, setIsGenerating] = useState(false);
   
   const handleExport = async () => {
     setIsGenerating(true);
     try {
       await generateComprehensiveAssessmentPdf(data, filename);
     } finally {
       setIsGenerating(false);
     }
   };
   ```

4. **File Size Considerations**: Large Word documents may slow down PDF generation. Consider:
   - Processing documents asynchronously
   - Limiting the number of documents per report
   - Using pagination for very large reports

5. **Storage Paths**: When using `processAssessmentWordDocuments`, ensure file paths match your Supabase Storage bucket structure.

## Troubleshooting

### Word Document Extraction Fails

- Ensure the file is a valid DOCX format
- Check file permissions in Supabase Storage
- Verify the file isn't corrupted

### PDF Generation Errors

- Check browser console for detailed error messages
- Ensure html2canvas and jsPDF are properly loaded
- Verify HTML content is valid

### Large Documents

- Consider splitting very large assessments into multiple PDFs
- Use simple export for quick summaries
- Process Word documents in batches

## Dependencies

- `mammoth` (^1.6.0) - Word document parsing
- `jspdf` (^3.0.2) - PDF generation
- `html2canvas` (^1.4.1) - HTML to canvas conversion

## Migration Guide

### Updating Existing Code

If you're using the old `generateResultsPdf` function, you can continue using it for backward compatibility. To upgrade to comprehensive reports:

1. Import the new function:
   ```typescript
   import { generateComprehensiveAssessmentPdf } from '../utils/generatePdf';
   ```

2. Prepare comprehensive data structure:
   ```typescript
   const data: ComprehensiveAssessmentData = {
     // ... your assessment data
   };
   ```

3. Replace the old function call:
   ```typescript
   // Old
   await generateResultsPdf(title, score, sections, date, filename);
   
   // New
   await generateComprehensiveAssessmentPdf(data, filename);
   ```

## Examples in Codebase

- `src/pages/SupplyChainResults.tsx` - Example of using both simple and comprehensive exports
- `src/utils/generatePdf.ts` - Core PDF generation functions
- `src/utils/wordDocumentProcessor.ts` - Word document processing utilities

