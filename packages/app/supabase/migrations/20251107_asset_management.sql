-- Asset Management Migration
-- Created: 2025-11-07
-- Purpose: Add asset inventory and asset-vendor relationship management

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('software', 'hardware', 'service', 'data', 'infrastructure', 'third_party')),
  category TEXT NOT NULL,
  criticality_level TEXT NOT NULL CHECK (criticality_level IN ('low', 'medium', 'high', 'critical')),
  business_impact TEXT NOT NULL CHECK (business_impact IN ('low', 'medium', 'high', 'critical')),
  data_classification TEXT NOT NULL CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted')),
  location TEXT,
  owner TEXT NOT NULL,
  custodian TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated', 'under_review')),
  version TEXT,
  cost DECIMAL,
  acquisition_date DATE,
  end_of_life_date DATE,
  compliance_requirements TEXT[] DEFAULT '{}',
  security_controls TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  risk_score INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create asset_vendor_relationships table
CREATE TABLE IF NOT EXISTS asset_vendor_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('primary_vendor', 'secondary_vendor', 'support_vendor', 'licensing_vendor', 'maintenance_vendor')),
  criticality_to_asset TEXT NOT NULL CHECK (criticality_to_asset IN ('low', 'medium', 'high', 'critical')),
  data_access_level TEXT NOT NULL CHECK (data_access_level IN ('none', 'read_only', 'read_write', 'full_access')),
  integration_type TEXT CHECK (integration_type IN ('api', 'database', 'file_transfer', 'web_service', 'direct_access', 'cloud_service')),
  contract_id TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  security_requirements TEXT[] DEFAULT '{}',
  compliance_requirements TEXT[] DEFAULT '{}',
  risk_factors TEXT[] DEFAULT '{}',
  mitigation_controls TEXT[] DEFAULT '{}',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(asset_id, vendor_id, relationship_type)
);

-- Create due_diligence_requirements table
CREATE TABLE IF NOT EXISTS due_diligence_requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  framework TEXT NOT NULL CHECK (framework IN ('nist', 'cmmc', 'iso27001', 'soc2', 'gdpr', 'hipaa', 'custom')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  due_date DATE NOT NULL,
  completed_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create alerts table (for asset-vendor risk monitoring)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('overdue_assessment', 'high_risk_relationship', 'contract_expiring', 'compliance_issue', 'security_incident')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  acknowledged BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_criticality ON assets(criticality_level);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_asset_vendor_relationships_asset ON asset_vendor_relationships(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_vendor_relationships_vendor ON asset_vendor_relationships(vendor_id);
CREATE INDEX IF NOT EXISTS idx_due_diligence_asset ON due_diligence_requirements(asset_id);
CREATE INDEX IF NOT EXISTS idx_due_diligence_vendor ON due_diligence_requirements(vendor_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_asset ON alerts(asset_id);
CREATE INDEX IF NOT EXISTS idx_alerts_vendor ON alerts(vendor_id);

-- Enable Row Level Security
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_vendor_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE due_diligence_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assets
CREATE POLICY "Users can view their own assets" ON assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets" ON assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets" ON assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets" ON assets
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for asset_vendor_relationships
CREATE POLICY "Users can view their asset-vendor relationships" ON asset_vendor_relationships
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_vendor_relationships.asset_id AND assets.user_id = auth.uid())
  );

CREATE POLICY "Users can insert their asset-vendor relationships" ON asset_vendor_relationships
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_vendor_relationships.asset_id AND assets.user_id = auth.uid())
  );

CREATE POLICY "Users can update their asset-vendor relationships" ON asset_vendor_relationships
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_vendor_relationships.asset_id AND assets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete their asset-vendor relationships" ON asset_vendor_relationships
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_vendor_relationships.asset_id AND assets.user_id = auth.uid())
  );

-- Create RLS policies for due_diligence_requirements
CREATE POLICY "Users can view their due diligence requirements" ON due_diligence_requirements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = due_diligence_requirements.asset_id AND assets.user_id = auth.uid())
  );

CREATE POLICY "Users can insert their due diligence requirements" ON due_diligence_requirements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = due_diligence_requirements.asset_id AND assets.user_id = auth.uid())
  );

CREATE POLICY "Users can update their due diligence requirements" ON due_diligence_requirements
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = due_diligence_requirements.asset_id AND assets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete their due diligence requirements" ON due_diligence_requirements
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = due_diligence_requirements.asset_id AND assets.user_id = auth.uid())
  );

-- Create RLS policies for alerts
CREATE POLICY "Users can view their alerts" ON alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their alerts" ON alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_vendor_relationships_updated_at BEFORE UPDATE ON asset_vendor_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_due_diligence_requirements_updated_at BEFORE UPDATE ON due_diligence_requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE assets IS 'Asset inventory tracking with criticality and business impact classifications';
COMMENT ON TABLE asset_vendor_relationships IS 'Maps assets to vendors with relationship details and risk assessment';
COMMENT ON TABLE due_diligence_requirements IS 'Automated due diligence requirements based on asset-vendor relationships';
COMMENT ON TABLE alerts IS 'Risk monitoring alerts for assets and vendor relationships';

