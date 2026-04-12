import React, { useState } from 'react';
import { ArrowRight, Award, CheckCircle, Clock, FileText, HelpCircle, MessageCircle, Shield, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import PanelCard from '../../components/vendorsoluce-intelligence/PanelCard';
import { MetricPill } from '../../components/vendorsoluce-intelligence/MetricPill';
import VendorOnboardingWizard from '../../components/vendor/VendorOnboardingWizard';
import VendorDashboard from '../../components/vendor/VendorDashboard';
import ChatbotTrigger from '../../components/chatbot/ChatbotTrigger';
import { useChatbot } from '../../components/chatbot/ChatbotProvider';

type OnboardingStep = 'welcome' | 'wizard' | 'dashboard';

const VendorOnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [_isCompleted, setIsCompleted] = useState(false);
  const { openChatbot } = useChatbot();
  if (currentStep === 'wizard') return <VendorOnboardingWizard onComplete={() => { setIsCompleted(true); setCurrentStep('dashboard'); }} />;
  if (currentStep === 'dashboard') return <VendorDashboard />;
  return (
    <WorkspacePageShell eyebrow="Vendor-facing journey" title="Vendor onboarding" description="Introduce vendors to a cleaner onboarding experience with clear expectations, support access, and a guided path into the workspace ecosystem." actions={[{ label: 'Start onboarding', onClick: () => setCurrentStep('wizard'), variant: 'primary' }, { label: 'Get help', onClick: () => openChatbot('vendor-onboarding'), variant: 'outline' }]} stats={[{ label: 'Assessment alignment', value: 'NIST SP 800-161', hint: 'Baseline requirement mapping' }, { label: 'Support access', value: 'In-product', hint: 'Chatbot + guided onboarding' }, { label: 'Target outcome', value: 'Vendor readiness', hint: 'From intake to evidence collection' }]}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <PanelCard title="Why vendors should complete onboarding" description="Set expectations early and show that the flow is structured, not bureaucratic."><div className="grid gap-4 md:grid-cols-3">{[{ icon: Shield, title: 'Secure assessment', body: 'Complete a structured, evidence-oriented onboarding flow aligned to supply chain assurance expectations.' }, { icon: Users, title: 'Trusted network', body: 'Join a monitored vendor ecosystem with clearer visibility, review milestones, and buyer confidence.' }, { icon: FileText, title: 'Operational readiness', body: 'Move from registration to requirements, evidence, and status tracking in one coherent journey.' }].map(({ icon: Icon, title, body }) => <div key={title} className="rounded-2xl border border-gray-200/70 bg-white p-6 dark:border-gray-800 dark:bg-gray-950/50"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40"><Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /></div><h3 className="text-base font-semibold text-gray-950 dark:text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{body}</p></div>)}</div></PanelCard>
          <PanelCard title="What the onboarding flow covers" description="Keep the sequence clear so vendors know what happens before they start."><div className="grid gap-4 md:grid-cols-2">{[{ icon: CheckCircle, title: 'Company profile setup', body: 'Core identity, business profile, and scope confirmation.' }, { icon: Shield, title: 'Security posture intake', body: 'Controls, policies, and security operating baseline.' }, { icon: Clock, title: 'Evidence readiness', body: 'Understand the documents and answers needed later in the portal.' }, { icon: Award, title: 'Qualification outcome', body: 'Create a cleaner path toward approval, follow-up, or remediation.' }].map(({ icon: Icon, title, body }) => <div key={title} className="flex gap-4 rounded-2xl border border-gray-200/70 bg-gray-50/60 p-5 dark:border-gray-800 dark:bg-gray-900/50"><div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-950"><Icon className="h-5 w-5 text-gray-700 dark:text-gray-200" /></div><div><div className="text-sm font-semibold text-gray-950 dark:text-white">{title}</div><p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">{body}</p></div></div>)}</div></PanelCard>
        </div>
        <div className="space-y-6">
          <PanelCard title="Journey signals" description="Give vendors a quick read on what this onboarding flow is optimized for."><div className="grid gap-3"><MetricPill label="Experience" value="Guided" tone="good" /><MetricPill label="Expected pace" value="Structured" tone="default" /><MetricPill label="Support model" value="Self-service + help" tone="warn" /></div></PanelCard>
          <PanelCard title="Need assistance?" description="Support should feel integrated, not bolted on after the fact."><div className="space-y-4"><div className="flex items-start gap-3 rounded-2xl border border-gray-200/70 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/50"><MessageCircle className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400" /><div><div className="text-sm font-semibold text-gray-950 dark:text-white">In-product support</div><p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">Use the onboarding assistant when a vendor needs clarification on requirements or next steps.</p></div></div><div className="flex flex-wrap gap-3"><ChatbotTrigger context="vendor-onboarding" variant="minimal" size="sm" /><Button variant="outline" size="sm" onClick={() => openChatbot('vendor-onboarding')}><HelpCircle className="mr-2 h-4 w-4" />Open help</Button><Button variant="primary" size="sm" onClick={() => setCurrentStep('wizard')}><ArrowRight className="mr-2 h-4 w-4" />Start now</Button></div></div></PanelCard>
        </div>
      </div>
    </WorkspacePageShell>
  );
};

export default VendorOnboardingPage;
