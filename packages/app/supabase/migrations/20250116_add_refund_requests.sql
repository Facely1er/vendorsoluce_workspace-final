-- Migration: Add Refund Requests Table
-- File: supabase/migrations/20250116_add_refund_requests.sql
-- Description: Adds refund request tracking table for e-commerce policy compliance

-- Create refund_requests table
CREATE TABLE IF NOT EXISTS vs_refund_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES vs_profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES vs_subscriptions(id),
  invoice_id TEXT, -- Stripe invoice ID
  stripe_payment_intent_id TEXT, -- Stripe payment intent ID
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  reason TEXT NOT NULL, -- 'technical_failure', 'billing_error', 'discretionary', 'other'
  description TEXT NOT NULL, -- User's detailed explanation
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'processed', 'cancelled'
  eligibility_check JSONB, -- Stores eligibility validation results
  admin_notes TEXT, -- Internal notes for admin review
  stripe_refund_id TEXT, -- Stripe refund ID if processed
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vs_refund_requests_user_id 
  ON vs_refund_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_vs_refund_requests_status 
  ON vs_refund_requests(status) 
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_vs_refund_requests_subscription_id 
  ON vs_refund_requests(subscription_id);

CREATE INDEX IF NOT EXISTS idx_vs_refund_requests_invoice_id 
  ON vs_refund_requests(invoice_id);

-- Add comments
COMMENT ON TABLE vs_refund_requests IS 'Tracks refund requests per e-commerce policy requirements';
COMMENT ON COLUMN vs_refund_requests.status IS 'pending: awaiting review, approved: approved but not processed, rejected: request denied, processed: refund completed, cancelled: user cancelled request';
COMMENT ON COLUMN vs_refund_requests.reason IS 'technical_failure, billing_error, discretionary, other';
COMMENT ON COLUMN vs_refund_requests.eligibility_check IS 'Stores automated eligibility validation results';
