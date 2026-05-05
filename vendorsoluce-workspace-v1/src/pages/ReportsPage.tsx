import { useMemo } from 'react'
import { useWorkspaceStats } from '../store/useWorkspaceStats'
import { useWorkspaceStore } from '../store/workspaceStore'
import { Badge, Card } from '../ui/primitives'

export function ReportsPage() {
  const stats = useWorkspaceStats()
  const vendors = useWorkspaceStore((s) => s.vendors)
  const risks = useWorkspaceStore((s) => s.risks)
  const evidence = useWorkspaceStore((s) => s.evidence)
  const actions = useWorkspaceStore((s) => s.actions)

  const criticalVendors = useMemo(() => vendors.filter((v) => v.criticality === 'High'), [vendors])
  const openRisks = useMemo(() => risks.filter((r) => r.status === 'Open'), [risks])
  const openActions = useMemo(() => actions.filter((a) => a.status === 'Open'), [actions])

  const vendorById = useMemo(() => new Map(vendors.map((v) => [v.id, v])), [vendors])
  const evidenceByVendorCount = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of evidence) m.set(e.vendorId, (m.get(e.vendorId) ?? 0) + 1)
    return m
  }, [evidence])

  return (
    <div className="ws-stack">
      <div className="ws-page-head">
        <div>
          <h1 className="ws-page-title">Vendor Reports</h1>
          <p className="ws-page-subtitle small">
            Snapshot generated from local workspace data (no backend).
          </p>
        </div>
      </div>

      <div className="ws-grid-3">
        <Card>
          <h3>Vendor Readiness Score</h3>
          <div className="ws-stat">{stats.score}/100</div>
          <p className="small">Evidence + open risks + evidence gaps.</p>
        </Card>
        <Card>
          <h3>Workspace Summary</h3>
          <div className="ws-stack-xs ws-mt-2">
            <div className="small">
              <b>{stats.vendors.total}</b> vendors • <b>{stats.vendors.critical}</b> critical
            </div>
            <div className="small">
              <b>{stats.risks.open}</b> open risks • <b>{stats.actions.open}</b> open actions
            </div>
            <div className="small">
              <b>{stats.evidence.total}</b> evidence items
            </div>
          </div>
        </Card>
        <Card>
          <h3>Evidence Coverage</h3>
          <div className="ws-stat">{stats.evidence.coveragePct}%</div>
          <p className="small">{stats.evidence.missingRequired} required evidence items missing.</p>
        </Card>
      </div>

      <div className="ws-grid-2">
        <Card>
          <h3>Critical vendors</h3>
          {criticalVendors.length === 0 ? (
            <p className="small">No critical vendors.</p>
          ) : (
            <table className="ws-table ws-mt-3">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Service</th>
                  <th>Evidence items</th>
                </tr>
              </thead>
              <tbody>
                {criticalVendors.map((v) => (
                  <tr key={v.id}>
                    <td className="ws-font-900">{v.name}</td>
                    <td className="small">{v.service}</td>
                    <td>{evidenceByVendorCount.get(v.id) ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <h3>Action plan</h3>
          {openActions.length === 0 ? (
            <p className="small">No open actions.</p>
          ) : (
            <table className="ws-table ws-mt-3">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Vendor</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {openActions.slice(0, 12).map((a) => (
                  <tr key={a.id}>
                    <td className="ws-font-900">{a.title}</td>
                    <td className="small">{a.vendorId ? vendorById.get(a.vendorId)?.name ?? '—' : '—'}</td>
                    <td className="small">{a.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {openActions.length > 12 ? <p className="small">Showing 12 of {openActions.length} open actions.</p> : null}
        </Card>
      </div>

      <Card>
        <h3>Open risks</h3>
        {openRisks.length === 0 ? (
          <p className="small">No open risks.</p>
        ) : (
          <table className="ws-table ws-mt-3">
            <thead>
              <tr>
                <th>Risk</th>
                <th>Vendor</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {openRisks.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="ws-font-900">{r.title}</div>
                    {r.notes ? <div className="small">{r.notes}</div> : null}
                  </td>
                  <td>{vendorById.get(r.vendorId)?.name ?? '—'}</td>
                  <td className="small">{r.type}</td>
                  <td>
                    <Badge tone="high">{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}

