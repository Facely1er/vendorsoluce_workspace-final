-- Migration: Marketing Automation System
-- File: supabase/migrations/20250120_marketing_automation.sql
-- Description: Creates tables for marketing automation workflows, campaigns, and email tracking

-- Marketing Campaigns Table
CREATE TABLE IF NOT EXISTS vs_marketing_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('welcome', 'trial', 'abandoned_cart', 'win_back', 'feature_announcement', 'educational', 'upgrade_prompt', 'custom')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('event', 'schedule', 'manual')),
  trigger_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES vs_profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Email Templates Table
CREATE TABLE IF NOT EXISTS vs_email_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES vs_marketing_campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  delay_days INTEGER DEFAULT 0,
  delay_hours INTEGER DEFAULT 0,
  sequence_order INTEGER DEFAULT 0,
  conditions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Marketing Workflows Table (tracks individual user journeys)
CREATE TABLE IF NOT EXISTS vs_marketing_workflows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES vs_profiles(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES vs_marketing_campaigns(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  current_step INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Sends Table (tracks individual email sends)
CREATE TABLE IF NOT EXISTS vs_email_sends (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workflow_id UUID REFERENCES vs_marketing_workflows(id) ON DELETE CASCADE,
  template_id UUID REFERENCES vs_email_templates(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES vs_profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES vs_marketing_campaigns(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  email_provider_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Events Table (tracks events for automation triggers)
CREATE TABLE IF NOT EXISTS vs_user_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES vs_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Analytics Table
CREATE TABLE IF NOT EXISTS vs_campaign_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES vs_marketing_campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON vs_marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_type ON vs_marketing_campaigns(type);
CREATE INDEX IF NOT EXISTS idx_email_templates_campaign ON vs_email_templates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_workflows_user ON vs_marketing_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_campaign ON vs_marketing_workflows(campaign_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON vs_marketing_workflows(status);
CREATE INDEX IF NOT EXISTS idx_email_sends_user ON vs_email_sends(user_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_status ON vs_email_sends(status);
CREATE INDEX IF NOT EXISTS idx_email_sends_scheduled ON vs_email_sends(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_events_user ON vs_user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_type ON vs_user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_created ON vs_user_events(created_at);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign ON vs_campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_date ON vs_campaign_analytics(date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON vs_marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON vs_email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_workflows_updated_at
  BEFORE UPDATE ON vs_marketing_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to log user events
CREATE OR REPLACE FUNCTION log_user_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO vs_user_events (user_id, event_type, event_data)
  VALUES (p_user_id, p_event_type, p_event_data)
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE vs_marketing_campaigns IS 'Marketing campaigns and automation workflows';
COMMENT ON TABLE vs_email_templates IS 'Email templates for marketing campaigns';
COMMENT ON TABLE vs_marketing_workflows IS 'Individual user journeys through marketing campaigns';
COMMENT ON TABLE vs_email_sends IS 'Tracks individual email sends and engagement metrics';
COMMENT ON TABLE vs_user_events IS 'User events that trigger marketing automation';
COMMENT ON TABLE vs_campaign_analytics IS 'Daily analytics aggregated by campaign';

