/**
 * Unified framework model for NIST-based standards.
 * Consumed by CyberCorrect, CyberCaution, VendorSoluce, AssetManager.
 */

export interface QuestionOption {
  value: number;
  label: string;
  description?: string;
}

export interface Question {
  id: string;
  text: string;
  type?: 'scale' | 'single' | 'multi' | 'text';
  options?: QuestionOption[];
  weight?: number;
  nistMapping?: string;
  controlId?: string;
  [key: string]: unknown;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
}

export interface Section {
  id: string;
  name: string;
  description?: string;
  categories: Category[];
}

export interface MaturityLevel {
  level: number;
  name: string;
  description: string;
  minScore: number;
  maxScore: number;
}

export interface Framework {
  id: string;
  name: string;
  description: string;
  version: string;
  standardId: NISTStandardId;
  maturityLevels?: MaturityLevel[];
  sections: Section[];
  [key: string]: unknown;
}

/** Known NIST-related standards used to feed implementations */
export type NISTStandardId = 'nist-csf-2' | 'nist-800-53' | 'cmmc-v2' | 'fisma' | string;
