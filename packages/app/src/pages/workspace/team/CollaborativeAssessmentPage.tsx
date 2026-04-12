import { useNavigate, Link } from "react-router-dom";
import { Users, PlayCircle, ShieldCheck } from "lucide-react";
import { CollaborationSetup } from "../../../components/collaboration/CollaborationSetup";
import WorkspacePageShell from "../../../components/vendorsoluce-intelligence/WorkspacePageShell";
import PanelCard from "../../../components/vendorsoluce-intelligence/PanelCard";
import { WR } from "shared/constants/routes";

export default function CollaborativeAssessmentPage() {
  const navigate = useNavigate();

  const handleStart = (sessionId: string) => {
    navigate(`${WR.TEAM_COLLABORATE}/${sessionId}`);
  };

  return (
    <WorkspacePageShell
      eyebrow="VendorSoluce collaboration"
      title="Collaborative assessment"
      description="Launch a structured team session for vendor review so procurement, security, legal, and business owners work from the same operating context."
      actions={[{ label: "Back to dashboard", to: WR.VENDOR_INTELLIGENCE, variant: "outline" }]}
      stats={[
        { label: "Session model", value: "Multi-stakeholder", hint: "Security, procurement, legal, and business owners" },
        { label: "Coordination style", value: "Shared", hint: "Single review context with tracked contributors" },
        { label: "Primary outcome", value: "Aligned decisions", hint: "Reduce fragmented vendor review workflows" },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <PanelCard title="Assessment session setup" description="Create the session, invite contributors, and move into a live collaborative review from one consistent workflow.">
          <CollaborationSetup onStart={handleStart} />
        </PanelCard>
        <div className="space-y-6">
          <PanelCard title="How to use this space" description="Keep the collaboration workflow disciplined so the resulting vendor decision can be defended later.">
            <div className="space-y-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-950/40"><Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
                <div><div className="font-medium text-gray-950 dark:text-white">Invite the right roles</div><p>Use the same participants reflected in the RACI and stakeholder views so responsibility stays coherent across the workspace.</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 dark:bg-blue-950/40"><PlayCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
                <div><div className="font-medium text-gray-950 dark:text-white">Run the assessment in one session</div><p>Collect input live instead of splitting review notes across email, spreadsheets, and disconnected comments.</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-purple-50 p-2.5 dark:bg-purple-950/40"><ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" /></div>
                <div><div className="font-medium text-gray-950 dark:text-white">Tie outcomes back to vendor intelligence</div><p>Use the graph-backed vendor detail pages for dependency-driven context after the collaborative decision is made.</p></div>
              </div>
            </div>
          </PanelCard>
          <PanelCard title="Related workspace views" description="These pages should operate together rather than as separate tracks.">
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <Link to={WR.TEAM_STAKEHOLDERS} className="block rounded-xl border border-gray-200/70 px-4 py-3 transition hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-gray-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20">Open stakeholder management</Link>
              <Link to={WR.TEAM_RACI} className="block rounded-xl border border-gray-200/70 px-4 py-3 transition hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-gray-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20">Open RACI matrix</Link>
              <Link to={WR.VENDOR_INTELLIGENCE} className="block rounded-xl border border-gray-200/70 px-4 py-3 transition hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-gray-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20">Open vendor intelligence portfolio</Link>
            </div>
          </PanelCard>
        </div>
      </div>
    </WorkspacePageShell>
  );
}
