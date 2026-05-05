import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workspaceActions, useWorkspaceStore } from '../store/workspaceStore'
import type { Criticality, DataHandled, ServiceType } from '../store/types'
import { Card, Field } from '../ui/primitives'

const criticalities: Criticality[] = ['Low', 'Medium', 'High']
const serviceTypes: ServiceType[] = [
  'Cloud hosting',
  'SaaS application',
  'Payment processor',
  'HR/payroll provider',
  'Data analytics provider',
  'IT/security provider',
  'Other',
]
const dataHandledOptions: DataHandled[] = [
  'No sensitive data',
  'Business contact data',
  'Employee data',
  'Customer personal data',
  'Financial data',
  'Health data',
  'Authentication/security data',
]

export function IntakePage() {
  const vendors = useWorkspaceStore((s) => s.vendors)
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [serviceType, setServiceType] = useState<ServiceType>('Cloud hosting')
  const [dataHandled, setDataHandled] = useState<Record<DataHandled, boolean>>({
    'No sensitive data': false,
    'Business contact data': true,
    'Employee data': false,
    'Customer personal data': false,
    'Financial data': false,
    'Health data': false,
    'Authentication/security data': false,
  })
  const [criticality, setCriticality] = useState<Criticality>('Medium')
  const [serviceDescription, setServiceDescription] = useState('')
  const [contractOwner, setContractOwner] = useState('')
  const [reviewDueDate, setReviewDueDate] = useState('') // yyyy-mm-dd

  const selectedDataHandled = useMemo(
    () => dataHandledOptions.filter((d) => dataHandled[d]),
    [dataHandled],
  )

  const canSubmit = useMemo(() => {
    if (name.trim().length < 2) return false
    if (selectedDataHandled.length === 0) return false
    // Prevent contradictory selection.
    if (dataHandled['No sensitive data'] && selectedDataHandled.length > 1) return false
    return true
  }, [name, dataHandled, selectedDataHandled.length])

  return (
    <div className="ws-stack">
      <div className="ws-page-head">
        <div>
          <h1 className="ws-page-title">Vendor Intake</h1>
          <p className="ws-page-subtitle small">
            Guided intake creates the vendor profile, risk flags, and remediation actions in one flow.
          </p>
        </div>
        <div className="small">
          <span className="ws-font-900">{vendors.length}</span> vendors in workspace
        </div>
      </div>

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!canSubmit) return
            const vendorId = workspaceActions.addVendorFromIntake({
              name: name.trim(),
              serviceType,
              serviceDescription: serviceDescription.trim() || undefined,
              dataHandled: selectedDataHandled,
              criticality,
              contractOwner: contractOwner.trim() || undefined,
              reviewDueDate: reviewDueDate || undefined,
            })

            setName('')
            setServiceType('Cloud hosting')
            setCriticality('Medium')
            setServiceDescription('')
            setContractOwner('')
            setReviewDueDate('')
            setDataHandled({
              'No sensitive data': false,
              'Business contact data': true,
              'Employee data': false,
              'Customer personal data': false,
              'Financial data': false,
              'Health data': false,
              'Authentication/security data': false,
            })

            // No vendor detail route exists yet; route to dashboard to show updated readiness.
            navigate('/dashboard', { replace: true, state: { createdVendorId: vendorId } })
          }}
        >
          <div className="ws-grid-2">
            <Field label="Vendor name">
              <input
                className="ws-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="QA Vendor"
                autoFocus
              />
            </Field>
            <Field label="Service type">
              <select
                className="ws-select"
                aria-label="Service type"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as ServiceType)}
              >
                {serviceTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="ws-spacer-90" />

          <div className="ws-grid-2">
            <Field label="Data handled (select all that apply)">
              <div className="ws-card ws-card-compact">
                <div className="ws-checklist">
                  {dataHandledOptions.map((d) => (
                    <label
                      key={d}
                      className="small ws-inline"
                    >
                      <input
                        type="checkbox"
                        checked={dataHandled[d]}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setDataHandled((p) => {
                            const next = { ...p, [d]: checked }
                            if (d === 'No sensitive data' && checked) {
                              for (const other of dataHandledOptions) {
                                if (other !== 'No sensitive data') next[other] = false
                              }
                            }
                            if (d !== 'No sensitive data' && checked) next['No sensitive data'] = false
                            return next
                          })
                        }}
                      />
                      {d}
                    </label>
                  ))}
                </div>
              </div>
              {!canSubmit ? (
                <div className="small ws-help">
                  Select at least one data-handled option (or only “No sensitive data”).
                </div>
              ) : null}
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

              <div className="ws-spacer-75" />

              <Field label="Review due date (optional)">
                <input
                  className="ws-input"
                  type="date"
                  aria-label="Review due date"
                  value={reviewDueDate}
                  onChange={(e) => setReviewDueDate(e.target.value)}
                />
              </Field>
            </Field>
          </div>

          <div className="ws-spacer-90" />

          <div className="ws-grid-2">
            <Field label="Service description (optional)">
              <input
                className="ws-input"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Short description of scope and integrations"
              />
            </Field>
            <Field label="Contract owner (optional)">
              <input
                className="ws-input"
                value={contractOwner}
                onChange={(e) => setContractOwner(e.target.value)}
                placeholder="Name or team"
              />
            </Field>
          </div>

          <div className="ws-spacer-90" />

          <div className="ws-row">
            <button className="ws-btn primary" type="submit" disabled={!canSubmit}>
              Create vendor + generate plan
            </button>
            <div className="small">
              This will auto-create relevant risks and remediation actions.
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}

