import { useMemo, useState } from 'react'
import { workspaceActions, useWorkspaceStore } from '../store/workspaceStore'
import type { EvidenceType, UUID } from '../store/types'
import { Button, Card, Field } from '../ui/primitives'

const evidenceTypes: EvidenceType[] = ['Vendor documentation', 'Contracts', 'Assessments']

export function EvidencePage() {
  const vendors = useWorkspaceStore((s) => s.vendors)
  const evidence = useWorkspaceStore((s) => s.evidence)
  const vendorById = useMemo(() => new Map(vendors.map((v) => [v.id, v])), [vendors])

  const [vendorId, setVendorId] = useState<UUID | ''>('')
  const [type, setType] = useState<EvidenceType>('Vendor documentation')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')

  const canAdd = vendorId !== '' && title.trim().length > 2

  return (
    <div className="ws-stack">
      <div className="ws-page-head">
        <div>
          <h1 className="ws-page-title">Evidence</h1>
          <p className="ws-page-subtitle small">Track vendor documentation, contracts, and assessments.</p>
        </div>
      </div>

      <Card>
        <h3>Add evidence</h3>
        {vendors.length === 0 ? (
          <p className="small">Add a vendor first.</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!canAdd) return
              workspaceActions.addEvidence({
                vendorId: vendorId as UUID,
                type,
                title: title.trim(),
                url: url.trim() || undefined,
                notes: notes.trim() || undefined,
              })
              setTitle('')
              setUrl('')
              setNotes('')
              setType('Vendor documentation')
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
              <Field label="Evidence type">
                <select
                  className="ws-select"
                  aria-label="Evidence type"
                  value={type}
                  onChange={(e) => setType(e.target.value as EvidenceType)}
                >
                  {evidenceTypes.map((t) => (
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
                <input className="ws-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="SOC 2 Type II (2026)" />
              </Field>
              <Field label="URL (optional)">
                <input className="ws-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
              </Field>
            </div>
            <div className="ws-spacer-90" />
            <Field label="Notes (optional)">
              <textarea className="ws-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Key clauses, scope, expiry, exceptions…" />
            </Field>
            <div className="ws-spacer-90" />
            <Button type="submit" variant="primary" disabled={!canAdd}>
              Add evidence
            </Button>
          </form>
        )}
      </Card>

      <Card>
        <h3>Evidence library</h3>
        {evidence.length === 0 ? (
          <p className="small">No evidence added yet.</p>
        ) : (
          <table className="ws-table ws-mt-3">
            <thead>
              <tr>
                <th>Evidence</th>
                <th>Vendor</th>
                <th>Type</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {evidence.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div className="ws-font-900">{e.title}</div>
                    {e.url ? (
                      <div className="small">
                        <a href={e.url} target="_blank" rel="noreferrer">
                          {e.url}
                        </a>
                      </div>
                    ) : null}
                    {e.notes ? <div className="small">{e.notes}</div> : null}
                  </td>
                  <td>{vendorById.get(e.vendorId)?.name ?? '—'}</td>
                  <td className="small">{e.type}</td>
                  <td className="small">{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (!confirm('Delete this evidence item?')) return
                        workspaceActions.removeEvidence(e.id)
                      }}
                    >
                      Delete
                    </Button>
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

