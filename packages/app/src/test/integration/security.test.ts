import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../utils/monitoring', () => ({
  logger: {
    log: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  devConsole: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  },
}));

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('strips all HTML tags from input', async () => {
      const { sanitizeInput } = await import('../../utils/security');
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('');
      expect(sanitizeInput('<b>bold</b> text')).toBe('bold text');
      expect(sanitizeInput('<img src=x onerror=alert(1)>')).toBe('');
    });

    it('preserves plain text', async () => {
      const { sanitizeInput } = await import('../../utils/security');
      expect(sanitizeInput('Hello World')).toBe('Hello World');
      expect(sanitizeInput('user@example.com')).toBe('user@example.com');
    });
  });

  describe('sanitizeHTML', () => {
    it('allows safe HTML tags', async () => {
      const { sanitizeHTML } = await import('../../utils/security');
      expect(sanitizeHTML('<b>bold</b>')).toBe('<b>bold</b>');
      expect(sanitizeHTML('<em>italic</em>')).toBe('<em>italic</em>');
      expect(sanitizeHTML('<a href="https://example.com">link</a>')).toContain('href');
    });

    it('strips dangerous tags', async () => {
      const { sanitizeHTML } = await import('../../utils/security');
      expect(sanitizeHTML('<script>alert(1)</script>')).toBe('');
      expect(sanitizeHTML('<iframe src="evil.com"></iframe>')).toBe('');
      expect(sanitizeHTML('<img src=x onerror=alert(1)>')).toBe('');
    });

    it('strips dangerous attributes', async () => {
      const { sanitizeHTML } = await import('../../utils/security');
      const result = sanitizeHTML('<a href="https://ok.com" onclick="alert(1)">click</a>');
      expect(result).not.toContain('onclick');
      expect(result).toContain('href');
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email formats', async () => {
      const { isValidEmail } = await import('../../utils/security');
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co')).toBe(true);
    });

    it('rejects invalid email formats', async () => {
      const { isValidEmail } = await import('../../utils/security');
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@no-user.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('validates correct URLs', async () => {
      const { isValidUrl } = await import('../../utils/security');
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://sub.domain.com/path?q=1')).toBe(true);
    });

    it('rejects invalid URLs', async () => {
      const { isValidUrl } = await import('../../utils/security');
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('://no-protocol')).toBe(false);
    });
  });

  describe('RateLimiter', () => {
    it('allows requests within the limit', async () => {
      const { RateLimiter } = await import('../../utils/security');
      const limiter = new RateLimiter(3, 60000);
      expect(limiter.isAllowed('test-key')).toBe(true);
      expect(limiter.isAllowed('test-key')).toBe(true);
      expect(limiter.isAllowed('test-key')).toBe(true);
    });

    it('blocks requests exceeding the limit', async () => {
      const { RateLimiter } = await import('../../utils/security');
      const limiter = new RateLimiter(2, 60000);
      expect(limiter.isAllowed('test-key')).toBe(true);
      expect(limiter.isAllowed('test-key')).toBe(true);
      expect(limiter.isAllowed('test-key')).toBe(false);
    });

    it('tracks different keys independently', async () => {
      const { RateLimiter } = await import('../../utils/security');
      const limiter = new RateLimiter(1, 60000);
      expect(limiter.isAllowed('key-a')).toBe(true);
      expect(limiter.isAllowed('key-b')).toBe(true);
      expect(limiter.isAllowed('key-a')).toBe(false);
    });

    it('reports remaining requests', async () => {
      const { RateLimiter } = await import('../../utils/security');
      const limiter = new RateLimiter(5, 60000);
      expect(limiter.getRemainingRequests('test')).toBe(5);
      limiter.isAllowed('test');
      expect(limiter.getRemainingRequests('test')).toBe(4);
    });
  });
});

describe('Environment Validator', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'YOUR_SUPABASE_ANON_KEY');
  });

  it('validates correct Supabase URL format', async () => {
    const { validateEnvironment } = await import('../../utils/environmentValidator');
    const result = validateEnvironment();
    expect(result.valid).toBe(true);
    expect(result.missingRequired).toHaveLength(0);
  });

  it('reports missing Supabase as optional when not set', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    const { validateEnvironment } = await import('../../utils/environmentValidator');
    const result = validateEnvironment();
    expect(result.valid).toBe(true);
    expect(result.missingOptional).toContain('VITE_SUPABASE_URL');
  });

  it('reports optional missing variables as warnings', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    const { validateEnvironment } = await import('../../utils/environmentValidator');
    const result = validateEnvironment();
    expect(result.missingOptional).toContain('VITE_SENTRY_DSN');
    expect(result.valid).toBe(true);
  });

  it('validates Stripe key format', async () => {
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_valid_key_here');
    const { validateEnvironment } = await import('../../utils/environmentValidator');
    const result = validateEnvironment();
    expect(result.errors.filter(e => e.includes('STRIPE'))).toHaveLength(0);
  });

  it('flags invalid Stripe key format', async () => {
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'invalid_key');
    const { validateEnvironment } = await import('../../utils/environmentValidator');
    const result = validateEnvironment();
    expect(result.warnings.some(w => w.includes('STRIPE'))).toBe(true);
  });
});
