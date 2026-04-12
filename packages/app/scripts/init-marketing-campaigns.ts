// Initialize Default Marketing Campaigns
// Creates default marketing campaigns and email templates
// Run this script to set up initial marketing automation workflows
// File: scripts/init-marketing-campaigns.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CampaignTemplate {
  name: string;
  description: string;
  type: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  templates: Array<{
    name: string;
    subject: string;
    html_content: string;
    delay_days: number;
    delay_hours: number;
    sequence_order: number;
  }>;
}

const defaultCampaigns: CampaignTemplate[] = [
  {
    name: 'Welcome Series',
    description: '5-email welcome sequence for new users',
    type: 'welcome',
    trigger_type: 'event',
    trigger_config: {
      event_type: 'user_signup',
    },
    templates: [
      {
        name: 'Welcome Email 1 - Quick Start',
        subject: 'Welcome to VendorSoluce - Let\'s Get Started!',
        html_content: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Welcome to VendorSoluce!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hi {{name}},</p>
              <p>Thanks for signing up! We're excited to help you manage your supply chain risk.</p>
              <h3 style="color: #10b981;">Get Started in 3 Steps:</h3>
              <ol style="padding-left: 20px;">
                <li style="margin: 10px 0;"><strong>Add Your First Vendor</strong> - Start tracking your suppliers</li>
                <li style="margin: 10px 0;"><strong>Run a Risk Assessment</strong> - Evaluate vendor security</li>
                <li style="margin: 10px 0;"><strong>Analyze an SBOM</strong> - Check for vulnerabilities</li>
              </ol>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{dashboardUrl}}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
              </div>
              <p>Need help? Check out our <a href="{{baseUrl}}/docs">documentation</a> or reply to this email.</p>
              <p>Best regards,<br>The VendorSoluce Team</p>
            </div>
          </body>
          </html>
        `,
        delay_days: 0,
        delay_hours: 0,
        sequence_order: 1,
      },
      {
        name: 'Welcome Email 2 - Feature Highlight',
        subject: 'Discover VendorSoluce\'s Powerful Features',
        html_content: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Powerful Features at Your Fingertips</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hi {{name}},</p>
              <p>Here are some features that can help you reduce vendor risk:</p>
              <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #10b981;">
                <h3 style="margin-top: 0; color: #10b981;">🔍 NIST SP 800-161 Compliance</h3>
                <p>Built-in templates for supply chain security assessments aligned with NIST guidelines.</p>
              </div>
              <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #3b82f6;">
                <h3 style="margin-top: 0; color: #3b82f6;">📦 SBOM Analysis</h3>
                <p>Upload and analyze Software Bills of Materials to identify vulnerabilities and license risks.</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{baseUrl}}/features" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Explore Features</a>
              </div>
              <p>Best regards,<br>The VendorSoluce Team</p>
            </div>
          </body>
          </html>
        `,
        delay_days: 2,
        delay_hours: 0,
        sequence_order: 2,
      },
      {
        name: 'Welcome Email 3 - Success Story',
        subject: 'How Companies Reduce Vendor Risk with VendorSoluce',
        html_content: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Real Results from Real Customers</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hi {{name}},</p>
              <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border: 1px solid #e5e7eb;">
                <p style="font-style: italic; margin: 0 0 15px 0;">"VendorSoluce helped us reduce vendor risk assessment time by 80%."</p>
                <p style="margin: 0; color: #6b7280;">— Sarah Chen, CISO at TechCorp</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{dashboardUrl}}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
              </div>
              <p>Best regards,<br>The VendorSoluce Team</p>
            </div>
          </body>
          </html>
        `,
        delay_days: 5,
        delay_hours: 0,
        sequence_order: 3,
      },
      {
        name: 'Welcome Email 4 - Advanced Tips',
        subject: 'Pro Tips: Get the Most Out of VendorSoluce',
        html_content: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Pro Tips for Success</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hi {{name}},</p>
              <p>Here are some tips to maximize your vendor risk management:</p>
              <div style="background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #10b981;">
                <strong>💡 Tip #1: Use Custom Questionnaires</strong>
                <p style="margin: 5px 0 0 0;">Create industry-specific assessment templates for faster evaluations.</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{baseUrl}}/docs" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Documentation</a>
              </div>
              <p>Best regards,<br>The VendorSoluce Team</p>
            </div>
          </body>
          </html>
        `,
        delay_days: 10,
        delay_hours: 0,
        sequence_order: 4,
      },
      {
        name: 'Welcome Email 5 - Upgrade Prompt',
        subject: 'Unlock Full Potential with Professional Plan',
        html_content: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Ready to Level Up?</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hi {{name}},</p>
              <p>You've been using VendorSoluce for a while. Ready to unlock more features?</p>
              <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border: 2px solid #10b981;">
                <h3 style="margin-top: 0; color: #10b981;">Professional Plan - $129/month</h3>
                <ul style="list-style: none; padding: 0;">
                  <li style="padding: 5px 0;">✓ Up to 100 vendor assessments</li>
                  <li style="padding: 5px 0;">✓ Advanced SBOM analysis</li>
                  <li style="padding: 5px 0;">✓ NIST SP 800-161 + CMMC compliance</li>
                  <li style="padding: 5px 0;">✓ Priority support</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{pricingUrl}}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Plans</a>
              </div>
              <p>Best regards,<br>The VendorSoluce Team</p>
            </div>
          </body>
          </html>
        `,
        delay_days: 14,
        delay_hours: 0,
        sequence_order: 5,
      },
    ],
  },
  {
    name: 'Abandoned Cart',
    description: 'Reminder email for users who started checkout but didn\'t complete',
    type: 'abandoned_cart',
    trigger_type: 'event',
    trigger_config: {
      event_type: 'checkout_started',
      delay_hours: 24, // Send 24 hours after checkout started
    },
    templates: [
      {
        name: 'Abandoned Cart Reminder',
        subject: 'Complete Your VendorSoluce Subscription',
        html_content: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Don't Miss Out!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hi {{name}},</p>
              <p>We noticed you started the checkout process but didn't complete it. Your subscription is waiting for you!</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{pricingUrl}}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Subscription</a>
              </div>
              <p>Best regards,<br>The VendorSoluce Team</p>
            </div>
          </body>
          </html>
        `,
        delay_days: 0,
        delay_hours: 24,
        sequence_order: 1,
      },
    ],
  },
  {
    name: 'Win-Back Campaign',
    description: 'Re-engagement campaign for inactive users',
    type: 'win_back',
    trigger_type: 'event',
    trigger_config: {
      event_type: 'user_inactive',
      conditions: {
        days_inactive: 30, // Trigger after 30 days of inactivity
      },
    },
    templates: [
      {
        name: 'Win-Back Email',
        subject: 'We Miss You - Come Back to VendorSoluce',
        html_content: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">We Miss You!</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hi {{name}},</p>
              <p>It's been a while since you last used VendorSoluce. We've added new features and improvements!</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{dashboardUrl}}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Return to Dashboard</a>
              </div>
              <p>Best regards,<br>The VendorSoluce Team</p>
            </div>
          </body>
          </html>
        `,
        delay_days: 0,
        delay_hours: 0,
        sequence_order: 1,
      },
    ],
  },
];

async function initializeCampaigns() {
  console.log('Initializing marketing campaigns...');

  for (const campaignTemplate of defaultCampaigns) {
    try {
      // Check if campaign already exists
      const { data: existing } = await supabase
        .from('vs_marketing_campaigns')
        .select('id')
        .eq('name', campaignTemplate.name)
        .single();

      let campaignId: string;

      if (existing) {
        console.log(`Campaign "${campaignTemplate.name}" already exists, updating...`);
        campaignId = existing.id;
        
        // Update campaign
        await supabase
          .from('vs_marketing_campaigns')
          .update({
            description: campaignTemplate.description,
            trigger_config: campaignTemplate.trigger_config,
            status: 'active',
          })
          .eq('id', campaignId);
      } else {
        // Create campaign
        const { data: campaign, error } = await supabase
          .from('vs_marketing_campaigns')
          .insert({
            name: campaignTemplate.name,
            description: campaignTemplate.description,
            type: campaignTemplate.type,
            trigger_type: campaignTemplate.trigger_type,
            trigger_config: campaignTemplate.trigger_config,
            status: 'active',
          })
          .select()
          .single();

        if (error) throw error;
        campaignId = campaign.id;
        console.log(`Created campaign: ${campaignTemplate.name}`);
      }

      // Create/update templates
      for (const template of campaignTemplate.templates) {
        const { data: existingTemplate } = await supabase
          .from('vs_email_templates')
          .select('id')
          .eq('campaign_id', campaignId)
          .eq('name', template.name)
          .single();

        if (existingTemplate) {
          await supabase
            .from('vs_email_templates')
            .update({
              subject: template.subject,
              html_content: template.html_content,
              delay_days: template.delay_days,
              delay_hours: template.delay_hours,
              sequence_order: template.sequence_order,
              is_active: true,
            })
            .eq('id', existingTemplate.id);
        } else {
          await supabase
            .from('vs_email_templates')
            .insert({
              campaign_id: campaignId,
              name: template.name,
              subject: template.subject,
              html_content: template.html_content,
              delay_days: template.delay_days,
              delay_hours: template.delay_hours,
              sequence_order: template.sequence_order,
              is_active: true,
            });
        }
      }

      console.log(`✓ Processed ${campaignTemplate.templates.length} templates for "${campaignTemplate.name}"`);
    } catch (error) {
      console.error(`Error processing campaign "${campaignTemplate.name}":`, error);
    }
  }

  console.log('\n✅ Marketing campaigns initialized successfully!');
}

// Run the initialization
initializeCampaigns()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

