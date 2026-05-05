import { workspaceActions, useWorkspaceStore } from '../store/workspaceStore'
import { Button, Card, Field } from '../ui/primitives'

export function SettingsPage() {
  const theme = useWorkspaceStore((s) => s.settings.theme)
  const updatedAt = useWorkspaceStore((s) => s.updatedAt)

  return (
    <div className="ws-stack">
      <div className="ws-page-head">
        <div>
          <h1 className="ws-page-title">Settings</h1>
          <p className="ws-page-subtitle small">Local-only configuration.</p>
        </div>
      </div>

      <Card>
        <h3>Appearance</h3>
        <div className="ws-row">
          <Field label="Theme">
            <select
              className="ws-select"
              aria-label="Theme"
              value={theme}
              onChange={(e) => workspaceActions.updateSettings({ theme: e.target.value as any })}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </Field>
          <div className="small">Last saved: {new Date(updatedAt).toLocaleString()}</div>
        </div>
      </Card>

      <Card>
        <h3>Workspace data</h3>
        <p className="small">
          All data is stored in <b>localStorage</b> only.
        </p>
        <div className="ws-actions">
          <Button
            variant="danger"
            onClick={() => {
              if (!confirm('Reset workspace? This clears all vendors, risks, evidence, and actions.')) return
              workspaceActions.resetWorkspace()
            }}
          >
            Reset workspace
          </Button>
        </div>
      </Card>
    </div>
  )
}

