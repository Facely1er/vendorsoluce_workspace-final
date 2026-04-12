# Set Vercel Environment Variables
# Run this script from the monorepo root directory
# Values from rebuild-stripe-catalog.js (2025-03-24)

Write-Host "Setting Vercel environment variables..." -ForegroundColor Green
Write-Host ""

# Supabase Configuration
$SUPABASE_URL = "https://dfklqsdfycwjlcasfciu.supabase.co"
$SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"

# Stripe
$STRIPE_PRICE_STARTER = "price_1TEQimI8FTbdI7aVLrFOu3J6"
$STRIPE_PRICE_STARTER_UPDATES = "price_1TEQinI8FTbdI7aVpQf5COYd"
$STRIPE_LINK_STARTER = "https://buy.stripe.com/fZudR9eQWaJc0gqbiD18c0s"
$STRIPE_LINK_STARTER_UPDATES = "https://buy.stripe.com/cNi7sL8syg3w4wGaez18c0t"
$STRIPE_PRICE_PROFESSIONAL = "price_1TEQioI8FTbdI7aVnFRuAknP"
$STRIPE_PRICE_PROFESSIONAL_MONTHLY = "price_1TEQioI8FTbdI7aVnFRuAknP"
$STRIPE_PRICE_PROFESSIONAL_ANNUAL = "price_1TEQiqI8FTbdI7aVQHYivjCO"
$STRIPE_LINK_PROFESSIONAL = "https://buy.stripe.com/5kQ5kDbEK9F88MWeuP18c0u"
$STRIPE_LINK_PROFESSIONAL_MONTHLY = "https://buy.stripe.com/5kQ5kDbEK9F88MWeuP18c0u"
$STRIPE_LINK_PROFESSIONAL_ANNUAL = "https://buy.stripe.com/9B69ATbEKeZs5AKgCX18c0v"
$STRIPE_PRICE_ENTERPRISE = "price_1TEQirI8FTbdI7aVljwHOxRT"
$STRIPE_PRICE_ENTERPRISE_MONTHLY = "price_1TEQirI8FTbdI7aVljwHOxRT"
$STRIPE_PRICE_ENTERPRISE_ANNUAL = "price_1TEQisI8FTbdI7aVS6jT0AzO"
$STRIPE_LINK_ENTERPRISE = "https://buy.stripe.com/00wcN524a18CbZ8gCX18c0w"
$STRIPE_LINK_ENTERPRISE_MONTHLY = "https://buy.stripe.com/00wcN524a18CbZ8gCX18c0w"
$STRIPE_LINK_ENTERPRISE_ANNUAL = "https://buy.stripe.com/8x29AT6kq04y0gq1I318c0x"

Write-Host "Setting VITE_SUPABASE_URL..." -ForegroundColor Yellow
$SUPABASE_URL | vercel env add VITE_SUPABASE_URL production

Write-Host ""
Write-Host "Setting VITE_SUPABASE_ANON_KEY..." -ForegroundColor Yellow
$SUPABASE_ANON_KEY | vercel env add VITE_SUPABASE_ANON_KEY production

Write-Host ""
Write-Host "Setting Stripe vars..." -ForegroundColor Yellow
$STRIPE_PRICE_STARTER | vercel env add VITE_STRIPE_PRICE_STARTER production
$STRIPE_PRICE_STARTER_UPDATES | vercel env add VITE_STRIPE_PRICE_STARTER_UPDATES production
$STRIPE_LINK_STARTER | vercel env add VITE_STRIPE_LINK_STARTER production
$STRIPE_LINK_STARTER_UPDATES | vercel env add VITE_STRIPE_LINK_STARTER_UPDATES production
$STRIPE_PRICE_PROFESSIONAL | vercel env add VITE_STRIPE_PRICE_PROFESSIONAL production
$STRIPE_PRICE_PROFESSIONAL_MONTHLY | vercel env add VITE_STRIPE_PRICE_PROFESSIONAL_MONTHLY production
$STRIPE_PRICE_PROFESSIONAL_ANNUAL | vercel env add VITE_STRIPE_PRICE_PROFESSIONAL_ANNUAL production
$STRIPE_LINK_PROFESSIONAL | vercel env add VITE_STRIPE_LINK_PROFESSIONAL production
$STRIPE_LINK_PROFESSIONAL_MONTHLY | vercel env add VITE_STRIPE_LINK_PROFESSIONAL_MONTHLY production
$STRIPE_LINK_PROFESSIONAL_ANNUAL | vercel env add VITE_STRIPE_LINK_PROFESSIONAL_ANNUAL production
$STRIPE_PRICE_ENTERPRISE | vercel env add VITE_STRIPE_PRICE_ENTERPRISE production
$STRIPE_PRICE_ENTERPRISE_MONTHLY | vercel env add VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY production
$STRIPE_PRICE_ENTERPRISE_ANNUAL | vercel env add VITE_STRIPE_PRICE_ENTERPRISE_ANNUAL production
$STRIPE_LINK_ENTERPRISE | vercel env add VITE_STRIPE_LINK_ENTERPRISE production
$STRIPE_LINK_ENTERPRISE_MONTHLY | vercel env add VITE_STRIPE_LINK_ENTERPRISE_MONTHLY production
$STRIPE_LINK_ENTERPRISE_ANNUAL | vercel env add VITE_STRIPE_LINK_ENTERPRISE_ANNUAL production

Write-Host ""
Write-Host "✓ Environment variables set!" -ForegroundColor Green
Write-Host "Vercel will automatically redeploy your application." -ForegroundColor Green
Write-Host ""
Write-Host "To verify, run: vercel env ls" -ForegroundColor Cyan
