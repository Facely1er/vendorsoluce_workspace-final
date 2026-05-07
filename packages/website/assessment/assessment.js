import { getSections } from './assessment-data.js';
import { t, initI18n } from './i18n.js';
import { loadState, saveState, resetState } from './storage.js';
import { downloadPdfReport } from './pdf-generator.js';

// Scoring functions (identical to React version)
export function calculateSectionScore(sectionIndex, answers, sections) {
  const sectionQuestions = sections[sectionIndex].questions;
  let score = 0;
  let answered = 0;

  sectionQuestions.forEach(question => {
    const answer = answers[question.id];
    if (answer === 'yes') {
      score += 2;
      answered++;
    } else if (answer === 'partial') {
      score += 1;
      answered++;
    } else if (answer === 'no') {
      answered++;
    }
  });

  return {
    score,
    total: sectionQuestions.length * 2,
    completed: answered === sectionQuestions.length,
    percentage: Math.round((score / (sectionQuestions.length * 2)) * 100)
  };
}

export function getOverallScore(sections, answers) {
  let totalScore = 0;
  let totalPossible = 0;

  sections.forEach((_, index) => {
    const sectionScore = calculateSectionScore(index, answers, sections);
    totalScore += sectionScore.score;
    totalPossible += sectionScore.total;
  });

  return totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
}

// State management
let state = loadState();
let sections = [];

// Initialize app
export async function init() {
  await initI18n();
  sections = getSections();
  render();
}

// Render functions
function render() {
  const app = document.getElementById('app');
  if (!app) return;

  switch (state.stage) {
    case 'startScreen':
      app.innerHTML = renderStartScreen();
      break;
    case 'onboarding':
      app.innerHTML = renderOnboarding();
      break;
    case 'assessment':
      app.innerHTML = renderAssessment();
      break;
    case 'results':
      app.innerHTML = renderResults();
      break;
  }
}

function renderStartScreen() {
  return `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div class="text-center mb-8">
          <div class="mx-auto w-16 h-16 bg-vendorsoluce-navy/10 dark:bg-vendorsoluce-navy/30 rounded-full flex items-center justify-center mb-4">
            <svg class="h-8 w-8 text-vendorsoluce-navy dark:text-vendorsoluce-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ${t('assessment.title')}
          </h1>
          <p class="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            ${t('assessment.subtitle')}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg text-center">
            <h3 class="text-lg font-medium mb-2 text-gray-900 dark:text-white">${t('assessment.startScreen.nistAligned')}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm">${t('assessment.startScreen.nistDescription')}</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg text-center">
            <h3 class="text-lg font-medium mb-2 text-gray-900 dark:text-white">${t('assessment.startScreen.comprehensive')}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm">${t('assessment.startScreen.comprehensiveDescription')}</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg text-center">
            <h3 class="text-lg font-medium mb-2 text-gray-900 dark:text-white">${t('assessment.startScreen.actionable')}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-sm">${t('assessment.startScreen.actionableDescription')}</p>
          </div>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-8">
          <p class="text-blue-800 dark:text-blue-300 text-sm">
            ${t('assessment.startScreen.infoMessage')}
          </p>
        </div>

        <button 
          onclick="window.assessmentApp.handleStartAssessment()"
          class="w-full bg-vendorsoluce-green hover:bg-vendorsoluce-dark-green text-white font-medium py-3 px-6 rounded-md transition-colors"
        >
          ${t('assessment.startScreen.startAssessment')}
        </button>
      </div>
    </div>
  `;
}

function renderOnboarding() {
  return `
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          ${t('assessment.onboarding.nameYourAssessment')}
        </h2>

        <p class="text-gray-600 dark:text-gray-300 mb-6">
          ${t('assessment.onboarding.assessmentDescription')}
        </p>

        <div class="mb-6">
          <label for="assessmentName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ${t('assessment.onboarding.assessmentNameLabel')}
          </label>
          <input
            type="text"
            id="assessmentName"
            value="${state.assessmentName}"
            onchange="window.assessmentApp.handleNameChange(event.target.value)"
            class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-vendorsoluce-green focus:border-vendorsoluce-green bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="${t('assessment.onboarding.assessmentNamePlaceholder')}"
          />
        </div>

        <div class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md mb-6">
          <h3 class="font-medium text-gray-900 dark:text-white mb-2">${t('assessment.onboarding.whatToExpect')}</h3>
          <ul class="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>${t('assessment.onboarding.expectation1')}</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>${t('assessment.onboarding.expectation2')}</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>${t('assessment.onboarding.expectation3')}</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>${t('assessment.onboarding.expectation4')}</span>
            </li>
          </ul>
        </div>

        <button 
          onclick="window.assessmentApp.handleContinueToAssessment()"
          class="w-full bg-vendorsoluce-green hover:bg-vendorsoluce-dark-green text-white font-medium py-3 px-6 rounded-md transition-colors"
        >
          ${t('assessment.onboarding.continueToAssessment')}
        </button>
      </div>
    </div>
  `;
}

function renderAssessment() {
  const currentSectionData = sections[state.currentSection];
  const sectionScore = calculateSectionScore(state.currentSection, state.answers, sections);
  const overallScore = getOverallScore(sections, state.answers);
  const totalQuestions = sections.flatMap(s => s.questions).length;
  const answeredCount = Object.keys(state.answers).length;

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex justify-between items-center mb-4">
          <button
            onclick="window.assessmentApp.handleBackToStart()"
            class="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            ${t('assessment.backToStart')}
          </button>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            ${t('assessment.progress.progressLabel', { answered: answeredCount, total: totalQuestions })}
          </div>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">${state.assessmentName}</h1>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        ${sections.map((section, index) => {
          const score = calculateSectionScore(index, state.answers, sections);
          return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 class="font-semibold mb-2 text-gray-900 dark:text-white">${t(section.titleKey)}</h3>
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-300">${t('assessment.score')}: ${score.percentage}%</p>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    ${score.completed ? t('assessment.complete') : t('assessment.incomplete')}
                  </p>
                </div>
                <button
                  onclick="window.assessmentApp.handleSectionChange(${index})"
                  class="px-3 py-1 text-sm rounded-md ${state.currentSection === index ? 'bg-vendorsoluce-green text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}"
                >
                  ${state.currentSection === index ? t('assessment.current') : t('assessment.view')}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <div class="flex items-center space-x-3 mb-2">
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">${t(currentSectionData.titleKey)}</h2>
              <span class="text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                ${t('assessment.section')} ${state.currentSection + 1} / ${sections.length}
              </span>
            </div>
            <p class="text-gray-600 dark:text-gray-300 mb-2">${t(currentSectionData.descriptionKey)}</p>
            <div class="mt-3">
              <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>${t('assessment.sectionProgress')}</span>
                <span>${t('assessment.progress.questionsAnswered', {
                  count: currentSectionData.questions.filter(q => state.answers[q.id]).length,
                  total: currentSectionData.questions.length
                })}</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  class="bg-vendorsoluce-green h-2 rounded-full transition-all duration-300"
                  style="width: ${(currentSectionData.questions.filter(q => state.answers[q.id]).length / currentSectionData.questions.length) * 100}%"
                ></div>
              </div>
            </div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-vendorsoluce-green">${overallScore}%</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">${t('assessment.overallScore')}</div>
          </div>
        </div>

        <div class="space-y-6">
          ${currentSectionData.questions.map(question => {
            const currentAnswer = state.answers[question.id];
            return `
              <div class="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                <div class="flex items-start gap-2 mb-2">
                  <div class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium px-2 py-1 rounded text-sm font-mono">
                    ${question.id}
                  </div>
                  <p class="font-medium text-gray-900 dark:text-white flex-1">${t(question.questionKey)}</p>
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded mb-3">
                  <div class="flex items-start gap-2">
                    <svg class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">${question.control}</p>
                      <p class="text-sm text-gray-600 dark:text-gray-300">${t(question.guidanceKey)}</p>
                    </div>
                  </div>
                </div>
                
                <div class="flex gap-2 mt-2">
                  <button
                    onclick="window.assessmentApp.handleAnswer('${question.id}', 'yes')"
                    class="px-4 py-2 text-sm rounded-md flex items-center gap-1 transition-colors ${currentAnswer === 'yes' ? 'bg-vendorsoluce-green text-white' : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    ${t('components.yes')}
                  </button>
                  <button
                    onclick="window.assessmentApp.handleAnswer('${question.id}', 'partial')"
                    class="px-4 py-2 text-sm rounded-md flex items-center gap-1 transition-colors ${currentAnswer === 'partial' ? 'bg-vendorsoluce-green text-white' : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                    </svg>
                    ${t('components.partial')}
                  </button>
                  <button
                    onclick="window.assessmentApp.handleAnswer('${question.id}', 'no')"
                    class="px-4 py-2 text-sm rounded-md flex items-center gap-1 transition-colors ${currentAnswer === 'no' ? 'bg-vendorsoluce-green text-white' : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    ${t('components.no')}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="flex justify-between mt-6">
          <button
            onclick="window.assessmentApp.handlePreviousSection()"
            ${state.currentSection === 0 ? 'disabled' : ''}
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 ${state.currentSection === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}"
          >
            ${t('assessment.previousSection')}
          </button>
          
          ${state.currentSection < sections.length - 1 ? `
            <button
              onclick="window.assessmentApp.handleNextSection()"
              class="px-4 py-2 bg-vendorsoluce-green hover:bg-vendorsoluce-dark-green text-white rounded-md"
            >
              ${t('assessment.nextSection')}
            </button>
          ` : `
            <button
              onclick="window.assessmentApp.handleViewResults()"
              class="px-4 py-2 bg-vendorsoluce-green hover:bg-vendorsoluce-dark-green text-white rounded-md flex items-center gap-2"
            >
              ${t('assessment.viewResults')}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderResults() {
  const sectionScores = sections.map((section, index) => {
    const score = calculateSectionScore(index, state.answers, sections);
    return {
      title: t(section.titleKey),
      percentage: score.percentage,
      completed: score.completed
    };
  });
  const overallScore = getOverallScore(sections, state.answers);

  // Find gaps (questions answered 'no' or 'partial')
  const gaps = [];
  sections.forEach((section, sectionIndex) => {
    section.questions.forEach(question => {
      const answer = state.answers[question.id];
      if (answer === 'no' || answer === 'partial') {
        gaps.push({
          section: t(section.titleKey),
          questionId: question.id,
          question: t(question.questionKey),
          control: question.control,
          guidance: t(question.guidanceKey),
          answer: answer
        });
      }
    });
  });

  return `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ${t('results.title')}
        </h1>
        <p class="text-gray-600 dark:text-gray-300 mb-8">
          ${state.assessmentName}
        </p>

        <div class="mb-8">
          <div class="text-center mb-6">
            <div class="text-5xl font-bold text-vendorsoluce-green mb-2">${overallScore}%</div>
            <div class="text-lg text-gray-600 dark:text-gray-400">${t('results.overallScore')}</div>
          </div>

          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">${t('results.sectionScores')}</h2>
          <div class="space-y-3">
            ${sectionScores.map(score => `
              <div class="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">${score.title}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    ${score.completed ? t('assessment.complete') : t('assessment.incomplete')}
                  </div>
                </div>
                <div class="text-2xl font-bold ${score.percentage >= 70 ? 'text-green-600' : score.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}">
                  ${score.percentage}%
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        ${gaps.length > 0 ? `
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">${t('results.topGaps')}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">${t('results.topGapsDescription')}</p>
            <div class="space-y-4">
              ${gaps.map((gap, index) => `
                <div class="border-l-4 border-yellow-500 pl-4 py-2">
                  <div class="flex items-start gap-2 mb-1">
                    <span class="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium px-2 py-1 rounded text-xs font-mono">
                      ${gap.questionId}
                    </span>
                    <span class="text-xs px-2 py-1 rounded ${gap.answer === 'no' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'}">
                      ${gap.answer === 'no' ? t('components.no') : t('components.partial')}
                    </span>
                  </div>
                  <div class="font-medium text-gray-900 dark:text-white mb-1">${gap.question}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <strong>${gap.control}</strong>
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">${gap.guidance}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="mb-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p class="text-green-800 dark:text-green-300">${t('results.noGaps')}</p>
          </div>
        `}

        <div class="flex gap-4 justify-center">
          <button
            onclick="window.assessmentApp.handleDownloadPdf()"
            class="px-6 py-3 bg-vendorsoluce-green hover:bg-vendorsoluce-dark-green text-white rounded-md font-medium transition-colors"
          >
            ${t('results.downloadPdf')}
          </button>
          <button
            onclick="window.assessmentApp.handleDownloadJson()"
            class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            ${t('results.downloadJson')}
          </button>
          <button
            onclick="window.assessmentApp.handleRestart()"
            class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            ${t('results.restart')}
          </button>
        </div>
      </div>
    </div>
  `;
}

// Event handlers
export const assessmentApp = {
  handleStartAssessment() {
    state.stage = 'onboarding';
    saveState(state);
    render();
  },

  handleNameChange(name) {
    state.assessmentName = name;
    saveState(state);
  },

  handleContinueToAssessment() {
    state.stage = 'assessment';
    saveState(state);
    render();
  },

  handleBackToStart() {
    state.stage = 'startScreen';
    state.currentSection = 0;
    saveState(state);
    render();
  },

  handleSectionChange(index) {
    state.currentSection = index;
    saveState(state);
    render();
  },

  handleAnswer(questionId, answer) {
    state.answers[questionId] = answer;
    saveState(state);
    render();
  },

  handlePreviousSection() {
    if (state.currentSection > 0) {
      state.currentSection--;
      saveState(state);
      render();
    }
  },

  handleNextSection() {
    if (state.currentSection < sections.length - 1) {
      state.currentSection++;
      saveState(state);
      render();
    }
  },

  handleViewResults() {
    state.stage = 'results';
    saveState(state);
    render();
  },

  async handleDownloadPdf() {
    const sectionScores = sections.map((section, index) => {
      const score = calculateSectionScore(index, state.answers, sections);
      return {
        title: t(section.titleKey),
        percentage: score.percentage,
        completed: score.completed,
        score: score.score,
        total: score.total
      };
    });

    const gaps = [];
    sections.forEach((section) => {
      section.questions.forEach(question => {
        const answer = state.answers[question.id];
        if (answer === 'no' || answer === 'partial') {
          gaps.push({
            questionId: question.id,
            question: t(question.questionKey),
            control: question.control,
            guidance: t(question.guidanceKey),
            answer: answer
          });
        }
      });
    });

    const pdfData = {
      reportTitle: t('results.reportTitle'),
      framework: t('results.framework'),
      assessmentName: state.assessmentName,
      overallScore: getOverallScore(sections, state.answers),
      sectionScores: sectionScores,
      gaps: gaps,
      completedAt: new Date().toISOString()
    };

    try {
      await downloadPdfReport(pdfData);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  },

  handleDownloadJson() {
    const sectionScores = sections.map((section, index) => {
      const score = calculateSectionScore(index, state.answers, sections);
      return {
        title: t(section.titleKey),
        percentage: score.percentage,
        completed: score.completed,
        score: score.score,
        total: score.total
      };
    });

    const exportData = {
      timestamp: new Date().toISOString(),
      assessmentName: state.assessmentName,
      overallScore: getOverallScore(sections, state.answers),
      sectionScores: sectionScores,
      answers: state.answers
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.assessmentName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  handleRestart() {
    if (confirm('Are you sure you want to restart? All progress will be lost.')) {
      resetState();
      state = loadState();
      render();
    }
  }
};

// Make app available globally
window.assessmentApp = assessmentApp;
