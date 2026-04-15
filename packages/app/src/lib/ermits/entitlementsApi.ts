import type { SupabaseClient } from '@supabase/supabase-js';

export type ErmitsProductRole = 'owner' | 'admin' | 'operator' | 'analyst' | 'viewer';
export type ErmitsAccessStatus = 'active' | 'inactive' | 'expired' | 'suspended';

export type ErmitsAccessResult =
  | {
      access: true;
      isTrial: boolean;
      productRole: ErmitsProductRole;
      trialEndsAt: string | null;
      usageRemaining: number | null;
      organizationId: string;
      organizationSlug: string;
      productId: string;
    }
  | {
      access: false;
      reason:
        | 'no_entitlement'
        | 'trial_expired'
        | 'usage_limit_reached'
        | 'suspended'
        | 'expired'
        | 'inactive';
    };

export function createErmitsEntitlementsApi(client: SupabaseClient) {
  async function checkAccess(productCode: string): Promise<ErmitsAccessResult> {
    const { data: rows, error } = await client
      .from('ermits_product_access_view')
      .select('*')
      .eq('product_code', productCode)
      .eq('status', 'active');

    if (error || !rows || rows.length === 0) {
      return { access: false, reason: 'no_entitlement' };
    }

    const e = rows[0] as Record<string, unknown>;

    const trialEnds = e.trial_ends_at as string | null | undefined;
    if (trialEnds && new Date(trialEnds) < new Date()) {
      await client
        .from('ermits_product_access')
        .update({ status: 'expired' })
        .eq('user_id', e.user_id as string)
        .eq('organization_id', e.organization_id as string)
        .eq('product_id', e.product_id as string);
      return { access: false, reason: 'trial_expired' };
    }

    const usageLimit = e.usage_limit as number | null | undefined;
    const usageCount = (e.usage_count as number | null | undefined) ?? 0;
    if (usageLimit !== null && usageLimit !== undefined && usageCount >= usageLimit) {
      return { access: false, reason: 'usage_limit_reached' };
    }

    return {
      access: true,
      isTrial: Boolean(e.is_trial),
      productRole: e.product_role as ErmitsProductRole,
      trialEndsAt: trialEnds ?? null,
      usageRemaining: usageLimit !== null && usageLimit !== undefined ? usageLimit - usageCount : null,
      organizationId: e.organization_id as string,
      organizationSlug: e.organization_slug as string,
      productId: e.product_id as string,
    };
  }

  async function provisionTrial(userId: string, productCode: string) {
    const { data: product, error: pErr } = await client
      .from('ermits_products')
      .select('id')
      .eq('code', productCode)
      .maybeSingle();

    if (pErr || !product) throw new Error(`Product not found: ${productCode}`);

    const { data: config, error: cErr } = await client
      .from('ermits_trial_configs')
      .select('*')
      .eq('product_slug', productCode)
      .maybeSingle();

    if (cErr || !config) throw new Error(`No trial config for: ${productCode}`);

    const { data: org, error: oErr } = await client
      .from('ermits_organizations')
      .select('id')
      .eq('slug', 'demo')
      .maybeSingle();

    if (oErr || !org) throw new Error('Demo org not found');

    const { data: existing } = await client
      .from('ermits_product_access')
      .select('is_trial')
      .eq('user_id', userId)
      .eq('organization_id', org.id)
      .eq('product_id', product.id)
      .maybeSingle();

    if (existing && !config.allow_repeat) {
      return { error: 'Trial already used for this product' as const };
    }

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + Number(config.trial_days ?? 14));

    const { error } = await client.from('ermits_product_access').upsert(
      {
        organization_id: org.id,
        user_id: userId,
        product_id: product.id,
        product_role: config.trial_plan_role ?? 'analyst',
        status: 'active',
        source: 'trial',
        is_trial: true,
        trial_started_at: now.toISOString(),
        trial_ends_at: trialEnd.toISOString(),
        usage_limit: config.usage_limit ?? null,
        usage_count: 0,
      },
      { onConflict: 'organization_id,user_id,product_id' }
    );

    if (error) throw error;
    return { success: true as const, trialEndsAt: trialEnd };
  }

  async function getAllAccess() {
    const { data, error } = await client.from('ermits_product_access_view').select('*');
    if (error) throw error;
    return data ?? [];
  }

  async function incrementUsage(orgId: string, productId: string) {
    const { error } = await client.rpc('ermits_increment_product_usage', {
      p_org_id: orgId,
      p_product_id: productId,
    });
    if (error) throw error;
  }

  async function logAuditEvent(params: {
    actorUserId: string;
    organizationId?: string;
    productId?: string;
    eventType: string;
    eventAction: string;
    targetTable?: string;
    targetId?: string;
    payload?: Record<string, unknown>;
  }) {
    await client.from('ermits_audit_events').insert({
      actor_user_id: params.actorUserId,
      organization_id: params.organizationId ?? null,
      product_id: params.productId ?? null,
      event_type: params.eventType,
      event_action: params.eventAction,
      target_table: params.targetTable ?? null,
      target_id: params.targetId ?? null,
      event_payload: params.payload ?? {},
    });
  }

  return {
    checkAccess,
    provisionTrial,
    getAllAccess,
    incrementUsage,
    logAuditEvent,
  };
}

export type ErmitsEntitlementsApi = ReturnType<typeof createErmitsEntitlementsApi>;
