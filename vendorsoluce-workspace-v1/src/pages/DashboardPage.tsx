import { Link, useLocation } from 'react-router-dom'
import { Card } from '../ui/primitives'
import { useWorkspaceStats } from '../store/useWorkspaceStats'
import { useWorkspaceStore } from '../store/workspaceStore'

export function DashboardPage() {
  const location = useLocation()
  const stats = useWorkspaceStats()
  const latestVendors = useWorkspaceStore((s) => s.vendors.slice(0, 5))
  const openActions = useWorkspaceStore((s) => s.actions.filter((a) => a.status === 'Open').slice(0, 6))
  const hasVendors = useWorkspaceStore((s) => s.vendors.length > 0)
  const hasMissingEvidence = stats.evidence.missingRequired > 0
  const hasOpenRisks = stats.risks.open > 0
  const hasOpenActions = stats.actions.open > 0

  const nextLink = !hasVendors
    ? { to: '/intake', label: 'Start Vendor Review', note: 'Create your first vendor profile.' }
    : hasMissingEvidence
      ? { to: '/evidence', label: 'Continue Vendor Review', note: 'Evidence gaps detected. Add documentation.' }
      : hasOpenRisks
        ? { to: '/risks', label: 'Continue Vendor Review', note: 'Open risks detected. Review and mitigate.' }
        : hasOpenActions
          ? { to: '/actions', label: 'Continue Vendor Review', note: 'Actions are pending. Move them forward.' }
          : { to: '/reports', label: 'View Report', note: 'Workspace looks healthy. Review the snapshot.' }

  return (
    <div className="ws-stack">
      <div className="ws-page-head">
        <div>
          <h1 className="ws-page-title">Dashboard</h1>
          <p className="ws-page-subtitle small">
            Minimal local-only workspace for vendor risk management.
          </p>
        </div>
        <div className="ws-actions">
          <Link className="ws-btn primary" to="/intake">
            New vendor intake
          </Link>
          <Link className="ws-btn" to="/reports">
            View vendor report
          </Link>
        </div>
      </div>

      <div className="ws-grid-3">
        <Card>
          <h3>Vendor Readiness</h3>
          <div className="ws-stat ws-stat-track">
            {stats.score}/100
          </div>
          <p className="small">
            Driven by evidence coverage and open risks.
          </p>
        </Card>
        <Card>
          <h3>Critical Vendors</h3>
          <div className="ws-stat">{stats.vendors.critical}</div>
          <p className="small">
            High criticality vendors require evidence + oversight.
          </p>
          <Link className="small" to="/vendors">
            Manage vendors →
          </Link>
        </Card>
        <Card>
          <h3>Open Risks</h3>
          <div className="ws-stat">{stats.risks.open}</div>
          <p className="small">
            Open risks automatically generate actions.
          </p>
          <Link className="small" to="/risks">
            Review risks →
          </Link>
        </Card>
      </div>

      <div className="ws-grid-2">
        <Card>
          <h3>{nextLink.label}</h3>
          <p className="small">{nextLink.note}</p>
          {(location.state as any)?.createdVendorId ? (
            <div className="ws-card ws-card-compact ws-mt-3">
              <div className="ws-font-900">Intake complete</div>
              <div className="small">Vendor profile, risks, and actions were generated.</div>
            </div>
          ) : null}
          <div className="ws-mt-3">
            <Link className="ws-btn primary" to={nextLink.to}>
              {nextLink.label}
            </Link>
          </div>
        </Card>

        <Card>
          <h3>Recent vendors</h3>
          {latestVendors.length === 0 ? (
            <p className="small">No vendors yet. Start with an intake.</p>
          ) : (
            <table className="ws-table ws-mt-3">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Service</th>
                  <th>Criticality</th>
                </tr>
              </thead>
              <tbody>
                {latestVendors.map((v) => (
                  <tr key={v.id}>
                    <td>{v.name}</td>
                    <td className="small">{v.service}</td>
                    <td>{v.criticality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <Card>
        <h3>Action plan (open)</h3>
        {openActions.length === 0 ? (
          <p className="small">No open actions. Add vendors, evidence, and risks to generate a plan.</p>
        ) : (
          <div className="ws-stack-tight ws-mt-3">
            {openActions.map((a) => (
              <div key={a.id} className="ws-card ws-card-compact">
                <div className="ws-font-900">{a.title}</div>
                <div className="small">{a.rationale}</div>
              </div>
            ))}
          </div>
        )}
        <div className="ws-mt-3">
          <Link className="small" to="/actions">
            Go to actions →
          </Link>
        </div>
      </Card>
    </div>
  )
}

