# Stripe Webhook Configuration Helper Script
# Helps configure Stripe webhook endpoint

param(
    [string]$SupabaseProjectUrl = "",
    [string]$StripeApiKey = ""
)

Write-Host "💳 Stripe Webhook Configuration Helper" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

Write-Host "`n📋 This script helps you configure Stripe webhooks." -ForegroundColor Yellow
Write-Host "`nYou'll need:" -ForegroundColor Yellow
Write-Host "  1. Your Supabase project URL" -ForegroundColor Gray
Write-Host "  2. Stripe API key (for CLI operations)" -ForegroundColor Gray

# Get Supabase project URL
if ([string]::IsNullOrEmpty($SupabaseProjectUrl)) {
    $SupabaseProjectUrl = $env:VITE_SUPABASE_URL
    if ([string]::IsNullOrEmpty($SupabaseProjectUrl)) {
        $SupabaseProjectUrl = Read-Host "Enter your Supabase project URL (e.g., https://xxx.supabase.co)"
    }
}

# Extract project reference from URL
$projectRef = ""
if ($SupabaseProjectUrl -match "https://([^.]+)\.supabase\.co") {
    $projectRef = $matches[1]
}

if ([string]::IsNullOrEmpty($projectRef)) {
    Write-Host "❌ Could not extract project reference from URL" -ForegroundColor Red
    exit 1
}

$webhookUrl = "https://$projectRef.supabase.co/functions/v1/stripe-webhook"

Write-Host "`n✅ Webhook URL:" -ForegroundColor Green
Write-Host "  $webhookUrl" -ForegroundColor Cyan

Write-Host "`n📋 Configuration Steps:" -ForegroundColor Yellow
Write-Host "`n1. Go to Stripe Dashboard:" -ForegroundColor Cyan
Write-Host "   https://dashboard.stripe.com/webhooks" -ForegroundColor Gray

Write-Host "`n2. Click 'Add endpoint'" -ForegroundColor Cyan

Write-Host "`n3. Enter endpoint URL:" -ForegroundColor Cyan
Write-Host "   $webhookUrl" -ForegroundColor White -BackgroundColor DarkGray

Write-Host "`n4. Select events to listen to:" -ForegroundColor Cyan
$events = @(
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "customer.subscription.trial_will_end",
    "invoice.payment_action_required",
    "invoice.upcoming"
)

foreach ($event in $events) {
    Write-Host "   ☐ $event" -ForegroundColor Gray
}

Write-Host "`n5. After creating the webhook:" -ForegroundColor Cyan
Write-Host "   - Copy the 'Signing secret' (starts with whsec_)" -ForegroundColor Gray
Write-Host "   - Add it to your environment variables:" -ForegroundColor Gray
Write-Host "     STRIPE_WEBHOOK_SECRET=whsec_xxxxx" -ForegroundColor White -BackgroundColor DarkGray

Write-Host "`n6. Test the webhook:" -ForegroundColor Cyan
Write-Host "   - Use Stripe CLI: stripe listen --forward-to $webhookUrl" -ForegroundColor Gray
Write-Host "   - Or send a test event from Stripe Dashboard" -ForegroundColor Gray

Write-Host "`n📝 Quick Copy Commands:" -ForegroundColor Yellow
Write-Host "`nWebhook URL (copy this):" -ForegroundColor Cyan
Write-Host $webhookUrl -ForegroundColor White -BackgroundColor DarkGray

Write-Host "`n✅ Configuration helper complete!" -ForegroundColor Green
Write-Host "`nAfter configuring, verify webhook is receiving events in Stripe Dashboard." -ForegroundColor Yellow

