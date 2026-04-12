// Email Templates for Marketing Automation
// File: src/templates/emailTemplates.ts

import { emailGradients, emailMarketing } from '../theme/inlineUiTokens';

export interface EmailTemplateData {
  name: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailTemplates {
  private static baseUrl = import.meta.env.VITE_APP_URL || 'https://www.platform.vendorsoluce.com';
  private static vendorPortalUrl = import.meta.env.VITE_VENDOR_PORTAL_URL || 'https://vendortal.com';

  /**
   * Generate CAN-SPAM compliant footer with unsubscribe link
   */
  private static getEmailFooter(unsubscribeUrl?: string, _userId?: string): string {
    const unsubscribeLink = unsubscribeUrl || `${this.baseUrl}/account?tab=notifications`;
    return `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid ${emailMarketing.border}; text-align: center; font-size: 12px; color: ${emailMarketing.muted};">
        <p style="margin: 10px 0;">
          <a href="${unsubscribeLink}" style="color: ${emailMarketing.muted}; text-decoration: underline;">Unsubscribe from marketing emails</a>
        </p>
        <p style="margin: 5px 0;">
          Opt-out requests are processed within 10 business days as required by the CAN-SPAM Act.
        </p>
        <p style="margin: 10px 0;">
          ERMITS LLC | <a href="${this.baseUrl}/master-privacy-policy" style="color: ${emailMarketing.muted}; text-decoration: underline;">Privacy Policy</a> | <a href="${this.baseUrl}/master-terms-of-service" style="color: ${emailMarketing.muted}; text-decoration: underline;">Terms of Service</a>
        </p>
      </div>
    `;
  }

  /**
   * Generate text version of email footer
   */
  private static getEmailFooterText(unsubscribeUrl?: string): string {
    const unsubscribeLink = unsubscribeUrl || `${this.baseUrl}/account?tab=notifications`;
    return `\n\n---\nUnsubscribe from marketing emails: ${unsubscribeLink}\nOpt-out requests are processed within 10 business days as required by the CAN-SPAM Act.\n\nERMITS LLC | Privacy Policy: ${this.baseUrl}/master-privacy-policy | Terms of Service: ${this.baseUrl}/master-terms-of-service`;
  }

  /**
   * Welcome Series - Email 1: Welcome & Quick Start
   */
  static welcomeEmail1(data: { name: string; dashboardUrl?: string; unsubscribeUrl?: string; userId?: string }): EmailTemplateData {
    return {
      name: 'Welcome Email 1 - Quick Start',
      subject: 'Welcome to VendorSoluce™ - Let\'s Get Started!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: ${emailMarketing.bodyText}; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${emailGradients.emerald}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: ${emailMarketing.white}; margin: 0;">Welcome to VendorSoluce™!</h1>
          </div>
          <div style="background: ${emailMarketing.panel}; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi ${data.name || 'there'},</p>
            <p>Thanks for signing up! We're excited to help you manage your supply chain risk.</p>
            <h3 style="color: ${emailMarketing.emerald500};">Get Started in 3 Steps:</h3>
            <ol style="padding-left: 20px;">
              <li style="margin: 10px 0;"><strong>Add Your First Vendor</strong> - Start tracking your suppliers</li>
              <li style="margin: 10px 0;"><strong>Run a Risk Assessment</strong> - Evaluate vendor security</li>
              <li style="margin: 10px 0;"><strong>Analyze an SBOM</strong> - Check for vulnerabilities</li>
            </ol>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardUrl || `${this.baseUrl}/dashboard`}" style="background: ${emailMarketing.emerald500}; color: ${emailMarketing.white}; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
            </div>
            <p>Need help? Check out our <a href="${this.baseUrl}/api-docs">API documentation</a> or <a href="${this.baseUrl}/integration-guides">integration guides</a>, or reply to this email.</p>
            <p>Best regards,<br>The VendorSoluce™ Team</p>
            ${this.getEmailFooter(data.unsubscribeUrl, data.userId)}
          </div>
        </body>
        </html>
      `,
      text: `Welcome to VendorSoluce™!\n\nHi ${data.name || 'there'},\n\nThanks for signing up! Get started by:\n1. Adding your first vendor\n2. Running a risk assessment\n3. Analyzing an SBOM\n\nVisit your dashboard: ${data.dashboardUrl || `${this.baseUrl}/dashboard`}${this.getEmailFooterText(data.unsubscribeUrl)}`,
    };
  }

  /**
   * Welcome Series - Email 2: Feature Highlight
   */
  static welcomeEmail2(data: { name: string; unsubscribeUrl?: string; userId?: string }): EmailTemplateData {
    return {
      name: 'Welcome Email 2 - Feature Highlight',
      subject: 'Discover VendorSoluce™\'s Powerful Features',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: ${emailMarketing.bodyText}; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${emailGradients.blue}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: ${emailMarketing.white}; margin: 0;">Powerful Features at Your Fingertips</h1>
          </div>
          <div style="background: ${emailMarketing.panel}; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi ${data.name || 'there'},</p>
            <p>Here are some features that can help you reduce vendor risk:</p>
            <div style="background: ${emailMarketing.white}; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid ${emailMarketing.emerald500};">
              <h3 style="margin-top: 0; color: ${emailMarketing.emerald500};">🔍 NIST SP 800-161 Compliance</h3>
              <p>Built-in templates for supply chain security assessments aligned with NIST guidelines.</p>
            </div>
            <div style="background: ${emailMarketing.white}; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid ${emailMarketing.blue500};">
              <h3 style="margin-top: 0; color: ${emailMarketing.blue500};">📦 SBOM Analysis</h3>
              <p>Upload and analyze Software Bills of Materials to identify vulnerabilities and license risks.</p>
            </div>
            <div style="background: ${emailMarketing.white}; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid ${emailMarketing.violet500};">
              <h3 style="margin-top: 0; color: ${emailMarketing.violet500};">📊 Risk Dashboard</h3>
              <p>Visualize vendor risk scores and track compliance metrics in real-time.</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.baseUrl}/features" style="background: ${emailMarketing.emerald500}; color: ${emailMarketing.white}; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Explore Features</a>
            </div>
            <p>Best regards,<br>The VendorSoluce™ Team</p>
            ${this.getEmailFooter(data.unsubscribeUrl, data.userId)}
          </div>
        </body>
        </html>
      `,
      text: `Hi ${data.name || 'there'},\n\nHere are some features that can help you reduce vendor risk:\n\n🔍 NIST SP 800-161 Compliance\nBuilt-in templates for supply chain security assessments aligned with NIST guidelines.\n\n📦 SBOM Analysis\nUpload and analyze Software Bills of Materials to identify vulnerabilities and license risks.\n\n📊 Risk Dashboard\nVisualize vendor risk scores and track compliance metrics in real-time.\n\nExplore features: ${this.baseUrl}/features${this.getEmailFooterText(data.unsubscribeUrl)}`,
    };
  }

  /**
   * Welcome Series - Email 3: Customer Success Story
   */
  static welcomeEmail3(data: { name: string; unsubscribeUrl?: string; userId?: string }): EmailTemplateData {
    return {
      name: 'Welcome Email 3 - Success Story',
      subject: 'How Companies Reduce Vendor Risk with VendorSoluce™',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: ${emailMarketing.bodyText}; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${emailGradients.violet}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: ${emailMarketing.white}; margin: 0;">Real Results from Real Customers</h1>
          </div>
          <div style="background: ${emailMarketing.panel}; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi ${data.name || 'there'},</p>
            <p>Here's what customers are saying about VendorSoluce™:</p>
            <div style="background: ${emailMarketing.white}; padding: 20px; margin: 20px 0; border-radius: 5px; border: 1px solid ${emailMarketing.border};">
              <p style="font-style: italic; margin: 0 0 15px 0;">"VendorSoluce™ has streamlined our vendor risk assessment process. The automated workflows and templates save us significant time."</p>
              <p style="margin: 0; color: ${emailMarketing.muted}; font-size: 14px;">— Enterprise Customer</p>
            </div>
            <div style="background: ${emailMarketing.white}; padding: 20px; margin: 20px 0; border-radius: 5px; border: 1px solid ${emailMarketing.border};">
              <p style="font-style: italic; margin: 0 0 15px 0;">"The SBOM analysis feature helps us identify vulnerabilities in our supply chain. It's become an essential part of our security workflow."</p>
              <p style="margin: 0; color: ${emailMarketing.muted}; font-size: 14px;">— Security Professional</p>
            </div>
            <p style="font-size: 12px; color: ${emailMarketing.muted}; margin-top: 20px; font-style: italic;">* Results may vary. Individual experiences depend on various factors including organization size, existing processes, and implementation approach.</p>
            <p>Ready to get started? Start your first assessment today!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.baseUrl}/dashboard" style="background: ${emailMarketing.emerald500}; color: ${emailMarketing.white}; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
            </div>
            <p>Best regards,<br>The VendorSoluce™ Team</p>
            ${this.getEmailFooter(data.unsubscribeUrl, data.userId)}
          </div>
        </body>
        </html>
      `,
      text: `Hi ${data.name || 'there'},\n\nHere's what customers are saying about VendorSoluce™:\n\n"VendorSoluce™ has streamlined our vendor risk assessment process. The automated workflows and templates save us significant time."\n— Enterprise Customer\n\n"The SBOM analysis feature helps us identify vulnerabilities in our supply chain. It's become an essential part of our security workflow."\n— Security Professional\n\n* Results may vary. Individual experiences depend on various factors including organization size, existing processes, and implementation approach.\n\nReady to get started? Start your first assessment today!\n\nVisit your dashboard: ${this.baseUrl}/dashboard${this.getEmailFooterText(data.unsubscribeUrl)}`,
    };
  }

  /**
   * Welcome Series - Email 4: Advanced Tips
   */
  static welcomeEmail4(data: { name: string; unsubscribeUrl?: string; userId?: string }): EmailTemplateData {
    return {
      name: 'Welcome Email 4 - Advanced Tips',
      subject: 'Pro Tips: Get the Most Out of VendorSoluce™',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: ${emailMarketing.bodyText}; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${emailGradients.amber}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: ${emailMarketing.white}; margin: 0;">Pro Tips for Success</h1>
          </div>
          <div style="background: ${emailMarketing.panel}; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi ${data.name || 'there'},</p>
            <p>Here are some tips to maximize your vendor risk management:</p>
            <div style="background: ${emailMarketing.white}; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid ${emailMarketing.emerald500};">
              <strong>💡 Tip #1: Use Custom Questionnaires</strong>
              <p style="margin: 5px 0 0 0;">Create industry-specific assessment templates for faster evaluations.</p>
            </div>
            <div style="background: ${emailMarketing.white}; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid ${emailMarketing.blue500};">
              <strong>💡 Tip #2: Set Up Automated Reminders</strong>
              <p style="margin: 5px 0 0 0;">Never miss a vendor assessment renewal with automated notifications.</p>
            </div>
            <div style="background: ${emailMarketing.white}; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid ${emailMarketing.violet500};">
              <strong>💡 Tip #3: Export Reports Regularly</strong>
              <p style="margin: 5px 0 0 0;">Generate compliance reports for audits and stakeholder reviews.</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.baseUrl}/api-docs" style="background: ${emailMarketing.emerald500}; color: ${emailMarketing.white}; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View API Documentation</a>
            </div>
            <p>Best regards,<br>The VendorSoluce™ Team</p>
            ${this.getEmailFooter(data.unsubscribeUrl, data.userId)}
          </div>
        </body>
        </html>
      `,
      text: `Hi ${data.name || 'there'},\n\nHere are some tips to maximize your vendor risk management:\n\n💡 Tip #1: Use Custom Questionnaires\nCreate industry-specific assessment templates for faster evaluations.\n\n💡 Tip #2: Set Up Automated Reminders\nNever miss a vendor assessment renewal with automated notifications.\n\n💡 Tip #3: Export Reports Regularly\nGenerate compliance reports for audits and stakeholder reviews.\n\nView API Documentation: ${this.baseUrl}/api-docs${this.getEmailFooterText(data.unsubscribeUrl)}`,
    };
  }

  /**
   * Welcome Series - Email 5: Upgrade Prompt
   */
  static welcomeEmail5(data: { name: string; currentTier?: string; unsubscribeUrl?: string; userId?: string }): EmailTemplateData {
    const isFreeTier = !data.currentTier || data.currentTier === 'free';
    
    return {
      name: 'Welcome Email 5 - Upgrade Prompt',
      subject: isFreeTier ? 'Unlock Full Potential with Professional Plan' : 'You\'re Doing Great!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: ${emailMarketing.bodyText}; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${emailGradients.emerald}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: ${emailMarketing.white}; margin: 0;">${isFreeTier ? 'Ready to Level Up?' : 'Keep Up the Great Work!'}</h1>
          </div>
          <div style="background: ${emailMarketing.panel}; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi ${data.name || 'there'},</p>
            ${isFreeTier ? `
              <p>You've been using VendorSoluce™ for a while. Ready to unlock more features?</p>
              <div style="background: ${emailMarketing.white}; padding: 20px; margin: 20px 0; border-radius: 5px; border: 2px solid ${emailMarketing.emerald500};">
                <h3 style="margin-top: 0; color: ${emailMarketing.emerald500};">Professional — $189/mo or $1,814/yr (Save 20%)</h3>
                <ul style="list-style: none; padding: 0;">
                  <li style="padding: 5px 0;">✓ Up to 100 vendor assessments</li>
                  <li style="padding: 5px 0;">✓ Advanced SBOM analysis</li>
                  <li style="padding: 5px 0;">✓ NIST SP 800-161 + CMMC compliance</li>
                  <li style="padding: 5px 0;">✓ Priority support</li>
                  <li style="padding: 5px 0;">✓ API access</li>
                </ul>
                <p style="margin: 15px 0 0 0; font-size: 14px; color: ${emailMarketing.proseSecondary};">Same tiers and prices as <a href="https://www.vendorsoluce.com/pricing" style="color: ${emailMarketing.emerald600};">vendorsoluce.com/pricing</a>.</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.baseUrl}/pricing" style="background: ${emailMarketing.emerald500}; color: ${emailMarketing.white}; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Plans</a>
              </div>
            ` : `
              <p>You're making great progress! Keep using VendorSoluce™ to manage your vendor risk effectively.</p>
              <p>If you need help or have questions, don't hesitate to reach out.</p>
            `}
            <p>Best regards,<br>The VendorSoluce™ Team</p>
            ${this.getEmailFooter(data.unsubscribeUrl, data.userId)}
          </div>
        </body>
        </html>
      `,
      text: `Hi ${data.name || 'there'},\n\n${isFreeTier ? 'You\'ve been using VendorSoluce™ for a while. Ready to unlock more features?\n\nProfessional — $189/mo or $1,814/yr (Save 20%)\n✓ Up to 100 vendor assessments\n✓ Advanced SBOM analysis\n✓ NIST SP 800-161 + CMMC compliance\n✓ Priority support\n✓ API access\n\nPricing matches www.vendorsoluce.com/pricing.\n\nView plans: ' + this.baseUrl + '/pricing' : 'You\'re making great progress! Keep using VendorSoluce™ to manage your vendor risk effectively.\n\nIf you need help or have questions, don\'t hesitate to reach out.'}${this.getEmailFooterText(data.unsubscribeUrl)}`,
    };
  }

  /**
   * Abandoned Cart - User started checkout but didn't complete
   */
  static abandonedCartEmail(data: { name: string; planName?: string; pricingUrl?: string; unsubscribeUrl?: string; userId?: string }): EmailTemplateData {
    return {
      name: 'Abandoned Cart - Checkout Reminder',
      subject: 'Complete Your VendorSoluce™ Subscription',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: ${emailMarketing.bodyText}; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${emailGradients.amber}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: ${emailMarketing.white}; margin: 0;">Don't Miss Out!</h1>
          </div>
          <div style="background: ${emailMarketing.panel}; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi ${data.name || 'there'},</p>
            <p>We noticed you started the checkout process but didn't complete it. ${data.planName ? `Your ${data.planName} plan` : 'Your subscription'} is waiting for you!</p>
            <div style="background: ${emailMarketing.white}; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid ${emailMarketing.emerald500};">
              <h3 style="margin-top: 0;">What You'll Get:</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="padding: 5px 0;">✓ Complete vendor risk management</li>
                <li style="padding: 5px 0;">✓ NIST SP 800-161 compliance tools</li>
                <li style="padding: 5px 0;">✓ SBOM analysis & vulnerability scanning</li>
                <li style="padding: 5px 0;">✓ Priority support</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.pricingUrl || `${this.baseUrl}/pricing`}" style="background: ${emailMarketing.emerald500}; color: ${emailMarketing.white}; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Subscription</a>
            </div>
            <p>Questions? Reply to this email - we're here to help!</p>
            <p>Best regards,<br>The VendorSoluce™ Team</p>
            ${this.getEmailFooter(data.unsubscribeUrl, data.userId)}
          </div>
        </body>
        </html>
      `,
      text: `Hi ${data.name || 'there'},\n\nWe noticed you started the checkout process but didn't complete it. ${data.planName ? `Your ${data.planName} plan` : 'Your subscription'} is waiting for you!\n\nWhat You'll Get:\n✓ Complete vendor risk management\n✓ NIST SP 800-161 compliance tools\n✓ SBOM analysis & vulnerability scanning\n✓ Priority support\n\nComplete subscription: ${data.pricingUrl || `${this.baseUrl}/pricing`}\n\nQuestions? Reply to this email - we're here to help!${this.getEmailFooterText(data.unsubscribeUrl)}`,
    };
  }

  /**
   * Win-Back Email - For inactive users
   */
  static winBackEmail(data: { name: string; lastActiveDate?: string; dashboardUrl?: string; unsubscribeUrl?: string; userId?: string }): EmailTemplateData {
    return {
      name: 'Win-Back - Re-engagement',
      subject: 'We Miss You - Come Back to VendorSoluce™',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: ${emailMarketing.bodyText}; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${emailGradients.violet}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: ${emailMarketing.white}; margin: 0;">We Miss You!</h1>
          </div>
          <div style="background: ${emailMarketing.panel}; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi ${data.name || 'there'},</p>
            <p>It's been a while since you last used VendorSoluce™. We've added new features and improvements:</p>
            <ul style="padding-left: 20px;">
              <li style="margin: 10px 0;">Enhanced SBOM analysis with real-time vulnerability detection</li>
              <li style="margin: 10px 0;">New NIST SP 800-161 assessment templates</li>
              <li style="margin: 10px 0;">Improved risk dashboard with better visualizations</li>
              <li style="margin: 10px 0;">Faster vendor assessment workflows</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardUrl || `${this.baseUrl}/dashboard`}" style="background: ${emailMarketing.emerald500}; color: ${emailMarketing.white}; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Return to Dashboard</a>
            </div>
            <p>Your data is safe and waiting for you. Come back and see what's new!</p>
            <p>Best regards,<br>The VendorSoluce™ Team</p>
            ${this.getEmailFooter(data.unsubscribeUrl, data.userId)}
          </div>
        </body>
        </html>
      `,
      text: `Hi ${data.name || 'there'},\n\nIt's been a while since you last used VendorSoluce™. We've added new features and improvements:\n\n• Enhanced SBOM analysis with real-time vulnerability detection\n• New NIST SP 800-161 assessment templates\n• Improved risk dashboard with better visualizations\n• Faster vendor assessment workflows\n\nReturn to dashboard: ${data.dashboardUrl || `${this.baseUrl}/dashboard`}\n\nYour data is safe and waiting for you. Come back and see what's new!${this.getEmailFooterText(data.unsubscribeUrl)}`,
    };
  }

  /**
   * Vendor Assessment Invitation Email
   * Sent to vendors when they're invited to complete an assessment
   */
  static vendorAssessmentInvitation(data: { 
    vendorName: string; 
    assessmentId: string; 
    organizationName: string; 
    dueDate?: string; 
    frameworkName?: string;
    unsubscribeUrl?: string;
  }): EmailTemplateData {
    const assessmentUrl = `${this.vendorPortalUrl}/vendor-assessments/${data.assessmentId}`;
    return {
      name: 'Vendor Assessment Invitation',
      subject: `Security Assessment Request from ${data.organizationName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: ${emailMarketing.bodyText}; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${emailGradients.emerald}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: ${emailMarketing.white}; margin: 0;">Security Assessment Request</h1>
          </div>
          <div style="background: ${emailMarketing.panel}; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi ${data.vendorName},</p>
            <p>${data.organizationName} has requested that you complete a security assessment${data.frameworkName ? ` (${data.frameworkName})` : ''}.</p>
            ${data.dueDate ? `<p><strong>Due Date:</strong> ${data.dueDate}</p>` : ''}
            <div style="background: ${emailMarketing.white}; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid ${emailMarketing.emerald500};">
              <h3 style="margin-top: 0;">What to Expect:</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="padding: 5px 0;">✓ Secure, encrypted portal</li>
                <li style="padding: 5px 0;">✓ Save your progress and complete at your own pace</li>
                <li style="padding: 5px 0;">✓ Upload supporting documents</li>
                <li style="padding: 5px 0;">✓ Estimated time: 30 minutes to 3 hours</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${assessmentUrl}" style="background: ${emailMarketing.emerald500}; color: ${emailMarketing.white}; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Assessment Portal</a>
            </div>
            <p style="font-size: 14px; color: ${emailMarketing.muted};">Or visit <a href="${this.vendorPortalUrl}">${this.vendorPortalUrl}</a> and enter your Assessment ID: <code style="background: ${emailMarketing.codeBg}; padding: 2px 6px; border-radius: 3px;">${data.assessmentId}</code></p>
            <p>If you have any questions, please contact ${data.organizationName}'s security team.</p>
            <p>Best regards,<br>The VendorSoluce™ Team</p>
            ${this.getEmailFooter(data.unsubscribeUrl)}
          </div>
        </body>
        </html>
      `,
      text: `Hi ${data.vendorName},\n\n${data.organizationName} has requested that you complete a security assessment${data.frameworkName ? ` (${data.frameworkName})` : ''}.\n${data.dueDate ? `Due Date: ${data.dueDate}\n` : ''}\nAccess your assessment: ${assessmentUrl}\n\nOr visit ${this.vendorPortalUrl} and enter your Assessment ID: ${data.assessmentId}\n\nIf you have any questions, please contact ${data.organizationName}'s security team.\n\nBest regards,\nThe VendorSoluce™ Team${this.getEmailFooterText(data.unsubscribeUrl)}`,
    };
  }

  /**
   * Feature Announcement Email
   */
  static featureAnnouncementEmail(data: { name: string; featureName: string; featureDescription: string; featureUrl?: string; unsubscribeUrl?: string; userId?: string }): EmailTemplateData {
    return {
      name: 'Feature Announcement',
      subject: `New Feature: ${data.featureName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: ${emailMarketing.bodyText}; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${emailGradients.blue}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: ${emailMarketing.white}; margin: 0;">🎉 New Feature Available!</h1>
          </div>
          <div style="background: ${emailMarketing.panel}; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi ${data.name || 'there'},</p>
            <h2 style="color: ${emailMarketing.emerald500};">${data.featureName}</h2>
            <p>${data.featureDescription}</p>
            ${data.featureUrl ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.featureUrl}" style="background: ${emailMarketing.emerald500}; color: ${emailMarketing.white}; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Try It Now</a>
              </div>
            ` : ''}
            <p>We'd love to hear your feedback!</p>
            <p>Best regards,<br>The VendorSoluce™ Team</p>
            ${this.getEmailFooter(data.unsubscribeUrl, data.userId)}
          </div>
        </body>
        </html>
      `,
      text: `Hi ${data.name || 'there'},\n\n🎉 New Feature Available!\n\n${data.featureName}\n\n${data.featureDescription}\n\n${data.featureUrl ? `Try it now: ${data.featureUrl}\n\n` : ''}We'd love to hear your feedback!${this.getEmailFooterText(data.unsubscribeUrl)}`,
    };
  }
}
