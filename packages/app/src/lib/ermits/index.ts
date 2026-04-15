export * from './entitlementsApi';
export * from './demo';
export * from './authPlane';

import { supabase } from '../supabase';
import { createErmitsEntitlementsApi } from './entitlementsApi';
import { createErmitsAuthPlane } from './authPlane';

export const ermitsEntitlements = createErmitsEntitlementsApi(supabase);
export const ermitsAuthPlane = createErmitsAuthPlane(supabase);
