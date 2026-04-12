let translations = {};
let currentLang = 'en';

export async function initI18n(lang = 'en') {
  currentLang = lang;
  try {
    const response = await fetch(`./locales/${lang}.json`);
    translations = await response.json();
  } catch (error) {
    console.error('Failed to load translations:', error);
    // Fallback: try to load from a default
    translations = {};
  }
}

export function t(key, params = {}) {
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation missing
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // Simple parameter replacement
  return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
    return params[paramKey] !== undefined ? params[paramKey] : match;
  });
}

export function setLanguage(lang) {
  currentLang = lang;
  return initI18n(lang);
}
