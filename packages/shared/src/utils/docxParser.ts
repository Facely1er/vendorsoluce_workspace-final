import { convertToHtml, extractRawText } from 'mammoth';

export const extractDocxRawText = async (file: File | Blob): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await extractRawText({ arrayBuffer });
  return result.value;
};

export const extractDocxHtml = async (file: File | Blob): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await convertToHtml({ arrayBuffer });
  return result.value;
};
