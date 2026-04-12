const STORAGE_KEY = 'vendorsoluce_assessment_state';
const DEBOUNCE_MS = 250;

let saveTimeout = null;

export function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
  }
  
  return {
    stage: 'startScreen',
    currentSection: 0,
    answers: {},
    assessmentName: 'Supply Chain Risk Assessment'
  };
}

export function saveState(state) {
  // Debounce saves to avoid excessive writes
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }, DEBOUNCE_MS);
}

export function resetState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset state:', error);
  }
}
