import { useMemo, useState } from 'react'
import { workspaceActions, useWorkspaceStore } from '../store/workspaceStore'
import type { Criticality, Vendor } from '../store/types'
import { Badge, Button, Card, Field } from '../ui/primitives'

const criticalities: Criticality[] = ['Low', 'Medium', 'High']

export function VendorsPage() {
  const vendors = useWorkspaceStore((s) => s.vendors)
  const [name, setName] = useState('')
  const [service, setService] = useState('')
  const [criticality, setCriticality] = useState<Criticality>('Medium')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return vendors
    return vendors.filter((v) => (v.name + ' ' + v.service).toLowerCase().includes(q))
  }, [vendors, query])

  const canAdd = name.trim().length > 1 && service.trim().length > 1

  const toneFor = (c: Criticality): 'low' | 'medium' | 'high' =>
    c === 'Low' ? 'low' : c === 'Medium' ? 'medium' : 'high'

  const renderRow = (v: Vendor) => (
    <tr key={v.id}>
      <td>
        <div className="ws-font-900">{v.name}</div>
        <div className="small">{v.service}</div>
      </td>
      <td>
        <Badge tone={toneFor(v.criticality)}>{v.criticality}</Badge>
      </td>
      <td className="small">{new Date(v.createdAt).toLocaleDateString()}</td>
      <td>
        <div className="ws-actions">
          <select
            className="ws-select"
            aria-label="Vendor criticality"
            value={v.criticality}
            onChange={(e) => workspaceActions.updateVendor(v.id, { criticality: e.target.value as Criticality })}
          >
            {criticalities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Button
            variant="danger"
            onClick={() => {
              if (!confirm(`Remove vendor "${v.name}"? This also deletes linked risks and evidence.`)) return
              workspaceActions.removeVendor(v.id)
            }}
          >
            Remove
          </Button>
        </div>
      </td>
    </tr>
  )

  return (
    <div className="ws-stack">
      <div className="ws-page-head">
        <div>
          <h1 className="ws-page-title">Vendors</h1>
          <p className="ws-page-subtitle small">Track name, service, and criticality.</p>
        </div>
        <div className="ws-actions">
          <Field label="Search">
            <input className="ws-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Acme…" />
          </Field>
        </div>
      </div>

      <Card>
        <h3>Add vendor</h3>
        <form
          className="ws-row"
          onSubmit={(e) => {
            e.preventDefault()
            if (!canAdd) return
            workspaceActions.addVendor({ name: name.trim(), service: service.trim(), criticality })
            setName('')
            setService('')
            setCriticality('Medium')
          }}
        >
          <Field label="Name">
            <input className="ws-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Payments" />
          </Field>
          <Field label="Service">
            <input className="ws-input" value={service} onChange={(e) => setService(e.target.value)} placeholder="Payment processing" />
          </Field>
          <Field label="Criticality">
            <select
              className="ws-select"
              aria-label="Criticality"
              value={criticality}
              onChange={(e) => setCriticality(e.target.value as Criticality)}
            >
              {criticalities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit" variant="primary" disabled={!canAdd}>
            Add
          </Button>
        </form>
      </Card>

      <Card>
        <h3>Vendor list</h3>
        {filtered.length === 0 ? (
          <p className="small">No vendors match this view.</p>
        ) : (
          <table className="ws-table ws-mt-3">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Criticality</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{filtered.map(renderRow)}</tbody>
          </table>
        )}
      </Card>
    </div>
  )
}

