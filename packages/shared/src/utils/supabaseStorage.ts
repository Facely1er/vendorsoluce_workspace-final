import { supabase, isSupabaseEnabled } from '../lib/supabase';

// Storage bucket configuration
const TEMPLATES_BUCKET = 'templates';
const ASSESSMENT_EVIDENCE_BUCKET = 'assessment-evidence';

const STORAGE_DISABLED_MSG =
  'Storage is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use file storage.';

/**
 * Get the public URL for a file in Supabase Storage
 */
export const getStorageUrl = (bucketName: string, filePath: string): string => {
  if (!isSupabaseEnabled()) return '';
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
};

/**
 * Get the public URL for a template file
 */
export const getTemplateUrl = (templatePath: string): string => {
  // Remove '/templates/' prefix if present
  const cleanPath = templatePath.startsWith('/templates/') 
    ? templatePath.substring('/templates/'.length)
    : templatePath.startsWith('templates/')
    ? templatePath.substring('templates/'.length)
    : templatePath;
  
  return getStorageUrl(TEMPLATES_BUCKET, cleanPath);
};

/**
 * Download a file from Supabase Storage
 */
export const downloadFromStorage = async (bucketName: string, filePath: string): Promise<Blob> => {
  if (!isSupabaseEnabled()) {
    throw new Error(STORAGE_DISABLED_MSG);
  }
  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(filePath);
  
  if (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }
  
  if (!data) {
    throw new Error('No data returned from storage');
  }
  
  return data;
};

/**
 * Check if a file exists in Supabase Storage. Returns false when Supabase is disabled so callers can use fallbacks (e.g. fetch from public).
 */
export const fileExists = async (bucketName: string, filePath: string): Promise<boolean> => {
  if (!isSupabaseEnabled()) return false;
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(filePath.split('/').slice(0, -1).join('/'), {
        search: filePath.split('/').pop()
      });
    
    if (error) return false;
    
    return data && data.length > 0;
  } catch {
    return false;
  }
};

/**
 * Upload a file to the assessment evidence bucket.
 * When Supabase is disabled (demo mode), returns a local blob URL so the UI can show "uploaded" without backend.
 */
export const uploadAssessmentEvidence = async (
  file: File,
  assessmentId: string,
  questionId: string
): Promise<{ path: string; url: string }> => {
  if (!isSupabaseEnabled()) {
    const blobUrl = URL.createObjectURL(file);
    const demoPath = `demo/${assessmentId}/${questionId}/${file.name}`;
    return { path: demoPath, url: blobUrl };
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}_${timestamp}`;
  const filePath = `${assessmentId}/${questionId}/${fileName}`;

  const uploadedPath = await uploadToStorage(
    ASSESSMENT_EVIDENCE_BUCKET,
    filePath,
    file,
    { upsert: false, contentType: file.type }
  );

  const url = getStorageUrl(ASSESSMENT_EVIDENCE_BUCKET, uploadedPath);

  return { path: uploadedPath, url };
};

/**
 * Upload a file to Supabase Storage
 */
export const uploadToStorage = async (
  bucketName: string, 
  filePath: string, 
  file: File | Blob,
  options?: { upsert?: boolean; contentType?: string }
): Promise<string> => {
  if (!isSupabaseEnabled()) {
    throw new Error(STORAGE_DISABLED_MSG);
  }
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      upsert: options?.upsert || false,
      contentType: options?.contentType
    });
  
  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
  
  return data.path;
};

/**
 * List files in a Storage bucket folder
 */
export const listFiles = async (bucketName: string, folderPath: string = '') => {
  if (!isSupabaseEnabled()) {
    throw new Error(STORAGE_DISABLED_MSG);
  }
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(folderPath);
  
  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }
  
  return data;
};