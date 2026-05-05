import { useMemo, useState } from 'react'
import { workspaceActions, useWorkspaceStore } from '../store/workspaceStore'
import type { RiskType, UUID } from '../store/types'
import { Button, Card, Field } from '../ui/primitives'

const riskTypes: RiskType[] = ['Vendor dependency', 'Data exposure', 'Supply chain risk']

export function RisksPage() {
  const vendors = useWorkspaceStore((s) => s.vendors)
  const risks = useWorkspaceStore((s) => s.risks)
  const vendorById = useMemo(() => new Map(vendors.map((v) => [v.id, v])), [vendors])

  const [vendorId, setVendorId] = useState<UUID | ''>('')
  const [type, setType] = useState<RiskType>('Data exposure')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Mitigated'>('Open')

  const filtered = useMemo(() => {
    return risks.filter((r) => {
      if (vendorId && r.vendorId !== vendorId) return false
      if (statusFilter !== 'All' && r.status !== statusFilter) return false
      return true
    })
  }, [risks, vendorId, statusFilter])

  const canAdd = vendorId !== '' && title.trim().length > 3

  return (
    <div className="ws-stack">
      <div className="ws-page-head">
        <div>
          <h1 className="ws-page-title">Risks</h1>
          <p className="ws-page-subtitle small">
            Risks link to a vendor and generate remediation actions while open.
          </p>
        </div>
        <div className="ws-actions">
          <Field label="Vendor">
            <select
              className="ws-select"
              aria-label="Vendor filter"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value as UUID | '')}
            >
              <option value="">All vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className="ws-select"
              aria-label="Status filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="Open">Open</option>
              <option value="Mitigated">Mitigated</option>
              <option value="All">All</option>
            </select>
          </Field>
        </div>
      </div>

      <Card>
        <h3>Add risk</h3>
        {vendors.length === 0 ? (
          <p className="small">Add a vendor first.</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!canAdd) return
              workspaceActions.addRisk({ vendorId: vendorId as UUID, type, title: title.trim(), notes: notes.trim() })
              setTitle('')
              setNotes('')
              setType('Data exposure')
            }}
          >
            <div className="ws-grid-2">
              <Field label="Vendor">
                <select
                  className="ws-select"
                  aria-label="Vendor"
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value as UUID)}
                >
                  <option value="" disabled>
                    Select vendor…
                  </option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Risk type">
                <select
                  className="ws-select"
                  aria-label="Risk type"
                  value={type}
                  onChange={(e) => setType(e.target.value as RiskType)}
                >
                  {riskTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="ws-spacer-90" />
            <div className="ws-grid-2">
              <Field label="Title">
                <input className="ws-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Access to customer PII" />
              </Field>
              <Field label="Notes (optional)">
                <input className="ws-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Context, impact, controls…" />
              </Field>
            </div>
            <div className="ws-spacer-90" />
            <Button type="submit" variant="primary" disabled={!canAdd}>
              Add risk
            </Button>
          </form>
        )}
      </Card>

      <Card>
        <h3>Risk register</h3>
        {filtered.length === 0 ? (
          <p className="small">No risks in this view.</p>
        ) : (
          <table className="ws-table ws-mt-3">
            <thead>
              <tr>
                <th>Risk</th>
                <th>Vendor</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="ws-font-900">{r.title}</div>
                    {r.notes ? <div className="small">{r.notes}</div> : null}
                  </td>
                  <td>{vendorById.get(r.vendorId)?.name ?? '—'}</td>
                  <td className="small">{r.type}</td>
                  <td>{r.status}</td>
                  <td>
                    <div className="ws-actions">
                      {r.status === 'Open' ? (
                        <Button onClick={() => workspaceActions.setRiskStatus(r.id, 'Mitigated')}>Mark mitigated</Button>
                      ) : (
                        <Button onClick={() => workspaceActions.setRiskStatus(r.id, 'Open')}>Re-open</Button>
                      )}
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (!confirm('Delete this risk?')) return
                          workspaceActions.removeRisk(r.id)
                        }}
                      >
                        Delete
                      </Button>
                    </div>
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

