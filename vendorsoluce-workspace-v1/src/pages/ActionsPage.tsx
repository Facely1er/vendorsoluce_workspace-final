import { useMemo, useState } from 'react'
import { workspaceActions, useWorkspaceStore } from '../store/workspaceStore'
import type { UUID } from '../store/types'
import { Button, Card, Field } from '../ui/primitives'

export function ActionsPage() {
  const vendors = useWorkspaceStore((s) => s.vendors)
  const actions = useWorkspaceStore((s) => s.actions)
  const vendorById = useMemo(() => new Map(vendors.map((v) => [v.id, v])), [vendors])

  const [vendorId, setVendorId] = useState<UUID | ''>('')
  const [title, setTitle] = useState('')
  const [rationale, setRationale] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Open' | 'In Progress' | 'Completed' | 'All'>('Open')

  const filtered = useMemo(() => {
    return actions.filter((a) => {
      if (vendorId && a.vendorId !== vendorId) return false
      if (statusFilter !== 'All' && a.status !== statusFilter) return false
      return true
    })
  }, [actions, vendorId, statusFilter])

  const canAdd = title.trim().length > 3 && rationale.trim().length > 5

  return (
    <div className="ws-stack">
      <div className="ws-page-head">
        <div>
          <h1 className="ws-page-title">Actions</h1>
          <p className="ws-page-subtitle small">
            The action plan is auto-generated from criticality, missing evidence, and open risks.
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
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="All">All</option>
            </select>
          </Field>
        </div>
      </div>

      <Card>
        <h3>Add manual action</h3>
        <form
          className="ws-grid-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!canAdd) return
            workspaceActions.addManualAction({
              vendorId: vendorId || undefined,
              title: title.trim(),
              rationale: rationale.trim(),
            })
            setTitle('')
            setRationale('')
          }}
        >
          <Field label="Title">
            <input className="ws-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Schedule quarterly security review" />
          </Field>
          <Field label="Rationale">
            <input className="ws-input" value={rationale} onChange={(e) => setRationale(e.target.value)} placeholder="Why this matters…" />
          </Field>
          <div className="ws-actions">
            <Button type="submit" variant="primary" disabled={!canAdd}>
              Add action
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3>Action plan</h3>
        {filtered.length === 0 ? (
          <p className="small">No actions in this view.</p>
        ) : (
          <table className="ws-table ws-mt-3">
            <thead>
              <tr>
                <th>Action</th>
                <th>Vendor</th>
                <th>Source</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="ws-font-900">{a.title}</div>
                    <div className="small">{a.rationale}</div>
                  </td>
                  <td>{a.vendorId ? vendorById.get(a.vendorId)?.name ?? '—' : '—'}</td>
                  <td className="small">{a.source}</td>
                  <td>{a.status}</td>
                  <td>
                    <div className="ws-actions">
                      {a.status === 'Open' ? (
                        <Button onClick={() => workspaceActions.setActionStatus(a.id, 'In Progress')}>Start</Button>
                      ) : a.status === 'In Progress' ? (
                        <Button onClick={() => workspaceActions.setActionStatus(a.id, 'Completed')}>Complete</Button>
                      ) : (
                        <Button onClick={() => workspaceActions.setActionStatus(a.id, 'Open')}>Re-open</Button>
                      )}
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (a.source !== 'Manual') {
                            alert('System-generated actions cannot be deleted. Resolve the underlying cause instead.')
                            return
                          }
                          if (!confirm('Delete this manual action?')) return
                          workspaceActions.removeAction(a.id)
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

