// ============================================================================
// VENDORSOLUCE™ DATA MANAGEMENT STRATEGY
// Demo Mode → Trial Mode → Production Mode with Data Migration
// ============================================================================

/**
 * THREE-TIER DATA MANAGEMENT SYSTEM
 * 
 * 1. DEMO MODE (Interactive Demo)
 *    - Uses pre-populated catalog vendors
 *    - Read-only or limited edits
 *    - Max 25 vendors visible
 *    - No persistence (resets on refresh OR uses demo-only localStorage)
 *    - Purpose: Show capabilities, generate interest
 * 
 * 2. TRIAL MODE (Real Implementation Testing)
 *    - User imports their actual vendor data
 *    - Full CRUD operations enabled
 *    - Vendor limit: 50-100 vendors
 *    - Data persists in localStorage
 *    - Purpose: Prove value with real data, evaluate fit
 * 
 * 3. PRODUCTION MODE (Full Access)
 *    - Unlimited vendors
 *    - All features unlocked
 *    - Backend database sync (optional)
 *    - Export to multiple formats
 *    - Purpose: Daily operational use
 */

// ============================================================================
// MODE CONFIGURATION
// ============================================================================

const MODE_CONFIG = {
    demo: {
        name: 'Interactive Demo',
        maxVendors: 25,
        canImport: false,
        canExport: false,
        canEdit: false,         // Can view but not edit vendors
        canDelete: false,       // Cannot delete demo vendors
        pdfEnabled: false,
        sbomEnabled: false,
        dataSource: 'catalog',  // Uses pre-populated catalog
        persistence: 'session', // sessionStorage only (clears on close)
        upgradeMessage: 'Start your free trial to import your own vendor data',
        features: {
            viewRadar: true,
            viewAnalytics: true,
            viewReports: false,
            customRiskWeights: false,
            apiAccess: false
        }
    },
    
    trial: {
        name: 'Free Trial',
        maxVendors: 100,
        canImport: true,
        canExport: true,
        canEdit: true,
        canDelete: true,
        pdfEnabled: true,       // Limited PDF exports
        sbomEnabled: true,
        dataSource: 'user',     // User-imported data
        persistence: 'local',   // localStorage (persists)
        trialDays: 14,
        upgradeMessage: 'Upgrade to Professional for unlimited vendors and advanced features',
        features: {
            viewRadar: true,
            viewAnalytics: true,
            viewReports: true,
            customRiskWeights: false,
            apiAccess: false,
            pdfExportsPerMonth: 5
        }
    },
    
    professional: {
        name: 'Professional',
        maxVendors: Infinity,
        canImport: true,
        canExport: true,
        canEdit: true,
        canDelete: true,
        pdfEnabled: true,
        sbomEnabled: true,
        dataSource: 'user',
        persistence: 'database', // Backend sync
        upgradeMessage: null,
        features: {
            viewRadar: true,
            viewAnalytics: true,
            viewReports: true,
            customRiskWeights: true,
            apiAccess: true,
            pdfExportsPerMonth: Infinity,
            teamCollaboration: true,
            customBranding: true,
            slaSupport: true
        }
    }
};

// ============================================================================
// MODE DETECTION & INITIALIZATION
// ============================================================================

let currentMode = 'demo'; // Default to demo mode

/**
 * Detect current mode based on URL parameter, license key, or auth token
 */
function detectMode() {
    // Option 1: URL parameter (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('mode');
    if (urlMode && MODE_CONFIG[urlMode]) {
        return urlMode;
    }
    
    // Option 2: Check for trial activation
    const trialData = getTrialData();
    if (trialData && !trialData.expired) {
        return 'trial';
    }
    
    // Option 3: Check for license key (for professional)
    const licenseKey = localStorage.getItem('vendorsoluce_license');
    if (licenseKey && validateLicense(licenseKey)) {
        return 'professional';
    }
    
    // Default: demo mode
    return 'demo';
}

/**
 * Initialize application with appropriate mode
 */
function initializeApp() {
    currentMode = detectMode();
    const config = MODE_CONFIG[currentMode];

    // Update UI based on mode
    updateUIForMode(config);
    
    // Load appropriate data
    loadDataForMode(config);
    
    // Set up trial countdown if applicable
    if (currentMode === 'trial') {
        setupTrialCountdown();
    }
}

// ============================================================================
// DATA LOADING BY MODE
// ============================================================================

function loadDataForMode(config) {
    if (config.dataSource === 'catalog') {
        // DEMO MODE: Load pre-populated catalog
        loadDemoCatalogData();
    } else if (config.dataSource === 'user') {
        // TRIAL/PROFESSIONAL: Load user's real data
        loadUserData();
    }
}

/**
 * DEMO MODE: Load pre-populated catalog vendors
 */
function loadDemoCatalogData() {
    const storageKey = 'vendorsoluce_demo_data';
    
    // Check if demo data exists in sessionStorage
    const savedDemo = sessionStorage.getItem(storageKey);
    
    if (savedDemo) {
        // Restore demo session
        vendorData = JSON.parse(savedDemo);
    } else {
        // Initialize with starter set from catalog
        if (typeof getStarterVendorSet === 'function') {
            vendorData = getStarterVendorSet().slice(0, MODE_CONFIG.demo.maxVendors);
        } else {
            // Fallback: use initializeSampleVendors if available
            if (typeof initializeSampleVendors === 'function') {
                vendorData = initializeSampleVendors().slice(0, MODE_CONFIG.demo.maxVendors);
            } else {
                vendorData = [];
            }
        }
        
        // Calculate risks
        vendorData = vendorData.map(vendor => ({
            ...vendor,
            ...calculateVendorRisk(vendor)
        }));
        
        // Save to sessionStorage (clears when browser closes)
        sessionStorage.setItem(storageKey, JSON.stringify(vendorData));
    }
    
    updateAllDisplays();
}

/**
 * TRIAL/PROFESSIONAL MODE: Load user's real data
 */
function loadUserData() {
    const storageKey = 'vendorsoluce_user_data';
    
    // Try localStorage first
    const saved = localStorage.getItem(storageKey);
    
    if (saved && saved !== 'null') {
        vendorData = JSON.parse(saved);
        
        // Recalculate risks (in case algorithm changed)
        vendorData = vendorData.map(vendor => ({
            ...vendor,
            ...calculateVendorRisk(vendor)
        }));
    } else {
        // No user data yet - show onboarding
        vendorData = [];
        showDataOnboarding();
    }
    
    updateAllDisplays();
}

/**
 * Save user data (Trial/Professional modes only)
 */
function saveUserData() {
    if (currentMode === 'demo') {
        // Demo mode: save to sessionStorage
        sessionStorage.setItem('vendorsoluce_demo_data', JSON.stringify(vendorData));
    } else {
        // Trial/Professional: save to localStorage
        localStorage.setItem('vendorsoluce_user_data', JSON.stringify(vendorData));
        
        // Professional mode: also sync to backend
        if (currentMode === 'professional') {
            syncToBackend(vendorData);
        }
    }
}

// ============================================================================
// DATA MIGRATION: DEMO → TRIAL
// ============================================================================

/**
 * Show onboarding wizard when user first enters trial mode
 */
function showDataOnboarding() {
    const html = `
        <div class="vs-modal show" id="onboardingModal">
            <div class="vs-modal__backdrop"></div>
            <div class="vs-modal__panel" style="max-width: 700px;">
                <div class="vs-modal__header">
                    <div class="vs-modal__title">🎉 Welcome to Your VendorSoluce Trial!</div>
                </div>
                <div class="vs-modal__body">
                    <p style="font-size: 1.1rem; margin-bottom: 20px;">
                        You're now ready to import your actual vendor data. Choose how to get started:
                    </p>
                    
                    <div class="vs-grid2" style="gap: 20px; margin-bottom: 30px;">
                        <!-- Option 1: Import CSV -->
                        <div class="vs-card" style="cursor: pointer; border: 2px solid var(--border); padding: 20px;"
                             onclick="selectOnboardingOption('import')">
                            <div style="font-size: 2rem; margin-bottom: 10px;">📊</div>
                            <div class="vs-card__title">Import Your Vendors</div>
                            <p style="margin-top: 10px; color: var(--muted);">
                                Upload a CSV/Excel file with your existing vendor list
                            </p>
                            <div style="margin-top: 15px; padding: 10px; background: var(--vs-green-pale); 
                                        border-radius: 8px; font-size: 0.9rem;">
                                <strong>Recommended</strong> if you have an existing vendor inventory
                            </div>
                        </div>
                        
                        <!-- Option 2: Start Fresh -->
                        <div class="vs-card" style="cursor: pointer; border: 2px solid var(--border); padding: 20px;"
                             onclick="selectOnboardingOption('fresh')">
                            <div style="font-size: 2rem; margin-bottom: 10px;">➕</div>
                            <div class="vs-card__title">Start Fresh</div>
                            <p style="margin-top: 10px; color: var(--muted);">
                                Manually add vendors one by one as you identify them
                            </p>
                            <div style="margin-top: 15px; padding: 10px; background: var(--bg-2); 
                                        border-radius: 8px; font-size: 0.9rem;">
                                Best for smaller organizations or new TPRM programs
                            </div>
                        </div>
                        
                        <!-- Option 3: Use Industry Template -->
                        <div class="vs-card" style="cursor: pointer; border: 2px solid var(--border); padding: 20px;"
                             onclick="selectOnboardingOption('industry')">
                            <div style="font-size: 2rem; margin-bottom: 10px;">🏢</div>
                            <div class="vs-card__title">Industry Template</div>
                            <p style="margin-top: 10px; color: var(--muted);">
                                Pre-load common vendors for your industry vertical
                            </p>
                            <div style="margin-top: 15px; padding: 10px; background: var(--bg-2); 
                                        border-radius: 8px; font-size: 0.9rem;">
                                Quick start with industry-specific vendor lists
                            </div>
                        </div>
                        
                        <!-- Option 4: Continue Demo Data -->
                        <div class="vs-card" style="cursor: pointer; border: 2px solid var(--border); padding: 20px;"
                             onclick="selectOnboardingOption('demo')">
                            <div style="font-size: 2rem; margin-bottom: 10px;">🎯</div>
                            <div class="vs-card__title">Continue with Demo Data</div>
                            <p style="margin-top: 10px; color: var(--muted);">
                                Keep exploring with sample vendors, replace later
                            </p>
                            <div style="margin-top: 15px; padding: 10px; background: var(--bg-2); 
                                        border-radius: 8px; font-size: 0.9rem;">
                                Useful for learning the platform before importing
                            </div>
                        </div>
                    </div>
                    
                    <div style="padding: 15px; background: var(--bg-2); border-radius: 8px; 
                                border-left: 4px solid var(--vs-green);">
                        <strong>💡 Trial Info:</strong> Your 14-day trial includes up to 100 vendors, 
                        full risk analytics, PDF exports, and all Trial features.
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function selectOnboardingOption(option) {
    closeOnboardingModal();
    
    switch(option) {
        case 'import':
            // Trigger CSV import flow
            const importInput = document.getElementById('importFile') || document.getElementById('importInput');
            if (importInput) {
                importInput.click();
                showImportInstructions();
            } else {
                alert('Import feature will open. Please use the "Import CSV" button in the toolbar.');
            }
            break;
            
        case 'fresh':
            // Close modal and show empty state with "Add Vendor" button highlighted
            showEmptyStateGuidance();
            break;
            
        case 'industry':
            // Show industry selector
            showIndustrySelector();
            break;
            
        case 'demo':
            // Convert demo data to user data
            migrateDemoDataToTrial();
            break;
    }
}

function closeOnboardingModal() {
    document.getElementById('onboardingModal')?.remove();
}

/**
 * Migrate demo data to trial mode (user wants to keep exploring)
 */
function migrateDemoDataToTrial() {
    const demoData = sessionStorage.getItem('vendorsoluce_demo_data');
    
    if (demoData) {
        // Copy demo data to user storage
        localStorage.setItem('vendorsoluce_user_data', demoData);
        vendorData = JSON.parse(demoData);
        
        // Show migration success message
        showMigrationSuccess();
    } else {
        // Load fresh demo data
        if (typeof getStarterVendorSet === 'function') {
            vendorData = getStarterVendorSet().slice(0, 25);
        } else if (typeof initializeSampleVendors === 'function') {
            vendorData = initializeSampleVendors().slice(0, 25);
        } else {
            vendorData = [];
        }
        
        if (typeof calculateVendorRisk === 'function') {
            vendorData = vendorData.map(v => ({ ...v, ...calculateVendorRisk(v) }));
        }
        
        localStorage.setItem('vendorsoluce_user_data', JSON.stringify(vendorData));
    }
    
    updateAllDisplays();
}

function showMigrationSuccess() {
    const notification = `
        <div class="vs-notification" style="position: fixed; top: 80px; right: 20px; 
             background: var(--vs-green); color: white; padding: 20px; border-radius: 12px; 
             box-shadow: var(--shadow-lg); z-index: 10000; max-width: 400px;">
            <div style="font-weight: 700; margin-bottom: 5px;">✅ Demo Data Migrated</div>
            <div style="font-size: 0.9rem;">
                Your demo vendors are now in your trial account. You can edit, delete, 
                or add more vendors up to your 100-vendor trial limit.
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', notification);
    setTimeout(() => {
        document.querySelector('.vs-notification')?.remove();
    }, 5000);
}

// ============================================================================
// INDUSTRY TEMPLATE SELECTOR
// ============================================================================

function showIndustrySelector() {
    const industries = [
        { key: 'healthcare', name: 'Healthcare', icon: '🏥', vendors: 45 },
        { key: 'financial', name: 'Financial Services', icon: '🏦', vendors: 42 },
        { key: 'retail', name: 'Retail & E-commerce', icon: '🛍️', vendors: 38 },
        { key: 'manufacturing', name: 'Manufacturing', icon: '🏭', vendors: 35 },
        { key: 'technology', name: 'Technology/SaaS', icon: '💻', vendors: 48 },
        { key: 'education', name: 'Education', icon: '🎓', vendors: 32 }
    ];
    
    const html = `
        <div class="vs-modal show" id="industryModal">
            <div class="vs-modal__backdrop" onclick="closeIndustryModal()"></div>
            <div class="vs-modal__panel">
                <div class="vs-modal__header">
                    <div class="vs-modal__title">Select Your Industry</div>
                    <button class="secondary" onclick="closeIndustryModal()" style="position: absolute; right: 16px; top: 16px; padding: 8px 12px; min-width: auto;">✕</button>
                </div>
                <div class="vs-modal__body">
                    <p style="margin-bottom: 20px;">
                        We'll pre-load common vendors for your industry to get you started quickly.
                    </p>
                    <div class="vs-grid2">
                        ${industries.map(ind => `
                            <div class="vs-card" style="cursor: pointer; border: 2px solid var(--border); 
                                 text-align: center; padding: 30px;"
                                 onclick="loadIndustryTemplate('${ind.key}')">
                                <div style="font-size: 3rem; margin-bottom: 10px;">${ind.icon}</div>
                                <div class="vs-card__title">${ind.name}</div>
                                <div style="margin-top: 10px; color: var(--muted);">
                                    ~${ind.vendors} common vendors
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="text-align: center; margin-top: 20px;">
                        <button class="secondary" onclick="closeIndustryModal()">
                            Never mind, I'll add manually
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function closeIndustryModal() {
    document.getElementById('industryModal')?.remove();
}

function loadIndustryTemplate(industry) {
    // Load industry-specific vendors from catalog
    if (typeof getVendorsByIndustry === 'function') {
        vendorData = getVendorsByIndustry(industry);
    } else {
        // Fallback: use VS_TEMPLATES if available
        const templates = typeof VS_TEMPLATES !== 'undefined' ? VS_TEMPLATES : {};
        const template = templates[industry] || {};
        const vendorNames = Object.values(template).flat();
        
        // Map to vendor records
        if (typeof VS_CATALOG !== 'undefined') {
            vendorData = vendorNames.map(name => {
                const catalogVendor = VS_CATALOG.find(v => v.name === name);
                if (catalogVendor) {
                    return {
                        id: (typeof generateId === 'function') ? generateId() : Math.random().toString(36).slice(2),
                        name: catalogVendor.name,
                        category: 'strategic',
                        dataTypes: ['Confidential'],
                        sector: catalogVendor.category || 'SaaS',
                        location: 'Unknown',
                        contact: '',
                        notes: '',
                        providesSoftware: catalogVendor.providesSoftware || true,
                        sbomAvailable: false,
                        sbomFormat: 'none'
                    };
                }
                return null;
            }).filter(Boolean);
        } else {
            vendorData = [];
        }
    }
    
    // Apply trial limit
    const limit = MODE_CONFIG[currentMode]?.maxVendors || 100;
    if (vendorData.length > limit) {
        vendorData = vendorData.slice(0, limit);
    }
    
    // Calculate risks
    if (typeof calculateVendorRisk === 'function') {
        vendorData = vendorData.map(v => ({ ...v, ...calculateVendorRisk(v) }));
    }
    
    // Save to user storage
    saveUserData();
    
    closeIndustryModal();
    
    // Update displays
    if (typeof updateAllDisplays === 'function') {
        updateAllDisplays();
    }
    
    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification(`Loaded ${vendorData.length} vendors for ${industry}`, 'success');
    } else {
        alert(`Successfully loaded ${vendorData.length} vendors for ${industry}`);
    }
}

// ============================================================================
// UI UPDATES BY MODE
// ============================================================================

function updateUIForMode(config) {
    // Update header to show mode
    const headerStatus = document.querySelector('.radar-status');
    if (headerStatus) {
        headerStatus.textContent = `MODE: ${config.name.toUpperCase()}`;
    }
    
    // Show/hide import button
    const importBtn = document.getElementById('importBtn');
    if (importBtn) {
        importBtn.style.display = config.canImport ? 'inline-flex' : 'none';
    }
    
    // Update KPI display if vendor limit
    if (config.maxVendors !== Infinity) {
        updateVendorLimitDisplay(vendorData.length, config.maxVendors);
    }
    
    // Show trial countdown if applicable
    if (currentMode === 'trial') {
        showTrialCountdown();
    }
    
    // Disable edit/delete in demo mode
    if (!config.canEdit) {
        disableEditingFeatures();
    }
}

function updateVendorLimitDisplay(current, max) {
    const limitEl = document.getElementById('kpiCap');
    if (limitEl) {
        limitEl.textContent = max;
        limitEl.style.color = current >= max * 0.9 ? 'var(--risk-high)' : 'inherit';
    }
}

function disableEditingFeatures() {
    // Make vendor cards click-to-view only (no edit)
    document.querySelectorAll('.vendor-card').forEach(card => {
        card.style.cursor = 'pointer';
        // Remove edit handlers, add view-only handler
    });
}

// ============================================================================
// TRIAL MANAGEMENT
// ============================================================================

function activateTrial(email) {
    const trialData = {
        email: email,
        activatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        expired: false
    };
    
    localStorage.setItem('vendorsoluce_trial', JSON.stringify(trialData));
    
    // Switch to trial mode
    currentMode = 'trial';
    initializeApp();
    
    return trialData;
}

function getTrialData() {
    const stored = localStorage.getItem('vendorsoluce_trial');
    if (!stored) return null;
    
    const trialData = JSON.parse(stored);
    const now = new Date();
    const expires = new Date(trialData.expiresAt);
    
    trialData.expired = now > expires;
    trialData.daysRemaining = Math.max(0, Math.ceil((expires - now) / (24 * 60 * 60 * 1000)));
    
    return trialData;
}

function setupTrialCountdown() {
    const trialData = getTrialData();
    if (!trialData) return;
    
    // Update countdown every hour
    setInterval(() => {
        const updated = getTrialData();
        if (updated.expired) {
            handleTrialExpiration();
        } else {
            updateTrialCountdownDisplay(updated);
        }
    }, 60 * 60 * 1000); // Every hour
}

function showTrialCountdown() {
    const trialData = getTrialData();
    if (!trialData) return;
    
    const banner = `
        <div class="alert-banner" style="background: var(--vs-green-pale); 
             border-left: 6px solid var(--vs-green); margin-bottom: 16px;">
            <div class="alert-icon">⏱️</div>
            <div class="alert-content">
                <div class="alert-title">Trial Active</div>
                <div>${trialData.daysRemaining} days remaining • 
                      ${vendorData.length}/${MODE_CONFIG.trial.maxVendors} vendors used
                </div>
            </div>
            <button class="primary" onclick="showUpgradeToProfessional()">
                Upgrade Now
            </button>
        </div>
    `;
    
    const container = document.querySelector('.radar-container');
    container.insertAdjacentHTML('afterbegin', banner);
}

function handleTrialExpiration() {
    // Show expiration modal
    const html = `
        <div class="vs-modal show" id="expirationModal">
            <div class="vs-modal__backdrop"></div>
            <div class="vs-modal__panel">
                <div class="vs-modal__header">
                    <div class="vs-modal__title">Trial Expired</div>
                </div>
                <div class="vs-modal__body">
                    <p style="font-size: 1.1rem; margin-bottom: 20px;">
                        Your 14-day trial has ended. Your vendor data is safely stored.
                    </p>
                    <div class="vs-card">
                        <div class="vs-card__title">Continue with Professional</div>
                        <ul class="vs-bullets">
                            <li>Unlimited vendors</li>
                            <li>Advanced analytics & reporting</li>
                            <li>API access</li>
                            <li>Priority support</li>
                        </ul>
                        <div style="margin-top: 20px;">
                            <button class="primary" onclick="upgradeToProfessional()">
                                Upgrade to Professional
                            </button>
                        </div>
                    </div>
                    <p style="margin-top: 20px; color: var(--muted); font-size: 0.9rem;">
                        Your data will remain accessible in read-only mode until you upgrade.
                    </p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// ============================================================================
// MODE SWITCHING & UPGRADE FLOWS
// ============================================================================

function startTrial() {
    const html = `
        <div class="vs-modal show" id="trialSignupModal">
            <div class="vs-modal__backdrop"></div>
            <div class="vs-modal__panel">
                <div class="vs-modal__header">
                    <div class="vs-modal__title">Start Your Free Trial</div>
                    <button class="secondary" onclick="closeTrialSignup()" style="position: absolute; right: 16px; top: 16px; padding: 8px 12px; min-width: auto;">✕</button>
                </div>
                <div class="vs-modal__body">
                    <form onsubmit="submitTrialSignup(event)">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">
                                Work Email
                            </label>
                            <input type="email" id="trialEmail" required
                                   style="width: 100%; padding: 12px; border: 1px solid var(--border); 
                                          border-radius: 8px; font-size: 1rem;"
                                   placeholder="you@company.com">
                        </div>
                        
                        <div class="vs-card" style="background: var(--vs-green-pale); margin-bottom: 20px;">
                            <strong>14-Day Trial Includes:</strong>
                            <ul class="vs-bullets" style="margin-top: 10px;">
                                <li>Up to 100 vendors</li>
                                <li>Full risk analytics</li>
                                <li>PDF report generation</li>
                                <li>CSV import/export</li>
                                <li>SBOM tracking</li>
                            </ul>
                        </div>
                        
                        <button type="submit" class="primary" style="width: 100%;">
                            Start Free Trial
                        </button>
                        
                        <p style="margin-top: 15px; font-size: 0.85rem; color: var(--muted); text-align: center;">
                            No credit card required • Full access for 14 days
                        </p>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function submitTrialSignup(event) {
    event.preventDefault();
    const email = document.getElementById('trialEmail').value;
    
    // Activate trial
    activateTrial(email);
    
    closeTrialSignup();
    
    // Show welcome message and onboarding
    showTrialWelcome(email);
}

function closeTrialSignup() {
    document.getElementById('trialSignupModal')?.remove();
}

function showTrialWelcome(email) {
    const notification = `
        <div class="vs-notification" style="position: fixed; top: 80px; right: 20px; 
             background: var(--vs-green); color: white; padding: 25px; border-radius: 12px; 
             box-shadow: var(--shadow-lg); z-index: 10000; max-width: 450px;">
            <div style="font-size: 1.5rem; margin-bottom: 10px;">🎉</div>
            <div style="font-weight: 700; font-size: 1.2rem; margin-bottom: 8px;">
                Trial Activated!
            </div>
            <div style="font-size: 0.95rem; margin-bottom: 15px;">
                Welcome to VendorSoluce, ${email.split('@')[0]}! Your 14-day trial starts now.
            </div>
            <button class="btn" style="background: white; color: var(--vs-green);" 
                    onclick="this.closest('.vs-notification').remove(); showDataOnboarding();">
                Import Your Vendors →
            </button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', notification);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function showNotification(message, type = 'info') {
    const colors = {
        success: 'var(--vs-green)',
        error: 'var(--risk-critical)',
        warning: 'var(--risk-high)',
        info: 'var(--vs-green-dark)'
    };
    
    const notification = `
        <div class="vs-notification" style="position: fixed; top: 80px; right: 20px; 
             background: ${colors[type]}; color: white; padding: 20px; border-radius: 12px; 
             box-shadow: var(--shadow-lg); z-index: 10000; max-width: 400px;">
            ${message}
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', notification);
    setTimeout(() => {
        document.querySelector('.vs-notification')?.remove();
    }, 4000);
}

function validateLicense(licenseKey) {
    // Implement license validation logic
    // For now, just check if it exists and matches pattern
    return /^VS-PRO-[A-Z0-9]{16}$/.test(licenseKey);
}

function syncToBackend(data) {
    // Professional mode: sync to backend database
    // Implement API call to your backend
    // TODO: Add backend API integration
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Expose functions globally for onclick handlers
if (typeof window !== 'undefined') {
    window.startTrial = startTrial;
    window.submitTrialSignup = submitTrialSignup;
    window.closeTrialSignup = closeTrialSignup;
    window.showDataOnboarding = showDataOnboarding;
    window.selectOnboardingOption = selectOnboardingOption;
    window.closeOnboardingModal = closeOnboardingModal;
    window.migrateDemoDataToTrial = migrateDemoDataToTrial;
    window.showIndustrySelector = showIndustrySelector;
    window.closeIndustryModal = closeIndustryModal;
    window.loadIndustryTemplate = loadIndustryTemplate;
    window.activateTrial = activateTrial;
    window.detectMode = detectMode;
    window.initializeApp = initializeApp;
}
