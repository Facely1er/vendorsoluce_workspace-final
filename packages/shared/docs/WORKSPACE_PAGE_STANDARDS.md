# Workspace Page Structure Standards

## Overview

All authenticated workspace pages must follow consistent structural patterns to maintain a unified user experience and enable effective governance. This document defines the mandatory standards for workspace pages.

## Core Principles

1. **Consistent Layout**: All workspace pages use the same shell/wrapper components
2. **Unified Components**: Use approved UI components (PanelCard, not Card)
3. **Standardized Spacing**: Use defined spacing constants, not ad-hoc classes
4. **Predictable Structure**: Header → Stats → Body with consistent rhythm

## Required Components

### Page Wrapper

**MUST USE**: `WorkspacePageShell` (directly) or `WorkspacePage` (wrapper)

```tsx
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';

// OR

import WorkspacePage from '../../components/workspace/WorkspacePage';
```

**DO NOT**: Create custom page containers with max-w/mx-auto/px patterns

### Content Sections

**MUST USE**: `PanelCard` for all sectioned content

```tsx
import PanelCard from '../../components/vendorsoluce-intelligence/PanelCard';

<PanelCard
  title="Section Title"
  description="Brief description of this section"
>
  {/* Content */}
</PanelCard>
```

**DO NOT USE**: Raw `Card` component from `components/ui/Card`

### Spacing Classes

**MUST USE**: Exported constants from WorkspacePageShell

```tsx
import {
  WORKSPACE_PAGE_BODY_GRID_CLASS,      // For multi-section layouts (gap-6)
  WORKSPACE_PAGE_BODY_STACK_CLASS,     // For single-column (gap-6)
  WORKSPACE_PAGE_BODY_STACK_LOOSE_CLASS // For dashboards (gap-8)
} from '../../components/vendorsoluce-intelligence/WorkspacePageShell';

// Usage
<div className={WORKSPACE_PAGE_BODY_GRID_CLASS}>
  {children}
</div>
```

**DO NOT USE**: Ad-hoc spacing like `space-y-6`, `gap-6`, `gap-8` at page body level

## Page Structure Template

### Standard Page Layout

```tsx
import React from 'react';
import WorkspacePageShell, { WORKSPACE_PAGE_BODY_GRID_CLASS } from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import PanelCard from '../../components/vendorsoluce-intelligence/PanelCard';
import { Button } from '../../components/ui/Button';

const MyWorkspacePage: React.FC = () => {
  return (
    <WorkspacePageShell
      title="Page Title"
      description="Page description explaining the purpose and context."
      actions={[
        { label: 'Primary Action', onClick: handleAction, variant: 'primary' },
        { label: 'Secondary', onClick: handleSecondary, variant: 'outline' }
      ]}
      stats={[
        { label: 'Metric 1', value: 42, hint: 'Description' },
        { label: 'Metric 2', value: '85%', hint: 'Description' }
      ]}
    >
      <div className={WORKSPACE_PAGE_BODY_GRID_CLASS}>
        <PanelCard
          title="First Section"
          description="Section description"
        >
          {/* Section content */}
        </PanelCard>

        <PanelCard
          title="Second Section"
          description="Section description"
        >
          {/* Section content */}
        </PanelCard>
      </div>
    </WorkspacePageShell>
  );
};

export default MyWorkspacePage;
```

### Two-Column Layout Pattern

```tsx
<div className={WORKSPACE_PAGE_BODY_GRID_CLASS}>
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
    {/* Main content - 2 columns */}
    <div className="space-y-6 lg:col-span-2">
      <PanelCard title="Main Section 1">
        {/* Content */}
      </PanelCard>
      <PanelCard title="Main Section 2">
        {/* Content */}
      </PanelCard>
    </div>

    {/* Sidebar - 1 column */}
    <div className="space-y-6">
      <PanelCard title="Sidebar Section">
        {/* Content */}
      </PanelCard>
    </div>
  </div>
</div>
```

## Header Actions

### Two Patterns (Choose One)

**Pattern A: Actions Array** (preferred for simple buttons)

```tsx
<WorkspacePageShell
  actions={[
    { label: 'Create', onClick: handleCreate, variant: 'primary' },
    { label: 'Export', onClick: handleExport, variant: 'outline' }
  ]}
/>
```

**Pattern B: headerActionsSlot** (for complex layouts only)

```tsx
<WorkspacePageShell
  headerActionsSlot={
    <>
      <Button variant="outline" onClick={handleRefresh}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
      <Button variant="primary" onClick={handleAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Add
      </Button>
    </>
  }
/>
```

**When to use headerActionsSlot**: Only when you need custom layout, conditional rendering, or complex button groups that don't fit the actions array pattern.

## Mode Attribute

Use the `mode` prop to differentiate page types:

- `mode="guide"`: Documentation, playbooks, how-to pages (gray accent)
- `mode="execute"`: Forms, wizards, action pages (green accent)
- No mode: Standard pages (default)

```tsx
<WorkspacePageShell
  mode="guide"
  title="Vendor Risk Assessment Playbook"
  description="Step-by-step guide for conducting vendor assessments"
/>
```

## Loading & Empty States

### Loading State

```tsx
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import LoadingBlock from '../../components/vendorsoluce-intelligence/LoadingBlock';

// Full page loading
if (loading) {
  return (
    <WorkspacePageShell title="Page Title" description="Loading...">
      <LoadingSkeleton variant="dashboard" />
    </WorkspacePageShell>
  );
}

// Section loading
<PanelCard title="Data Section">
  {loading ? (
    <LoadingBlock label="Loading data..." />
  ) : (
    {/* Content */}
  )}
</PanelCard>
```

### Empty State

```tsx
import WorkspaceEmptyState from '../../components/common/WorkspaceEmptyState';

{items.length === 0 ? (
  <WorkspaceEmptyState
    icon={<Package className="h-8 w-8" />}
    title="No items yet"
    description="Get started by adding your first item."
    action={
      <Button variant="primary" onClick={handleAdd}>
        Add First Item
      </Button>
    }
  />
) : (
  {/* Content */}
)}
```

## Common Mistakes

### ❌ Don't Do This

```tsx
// DON'T: Use raw Card component
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
<Card><CardHeader>Title</CardHeader></Card>

// DON'T: Ad-hoc spacing at page level
<div className="space-y-6">
  <PanelCard>...</PanelCard>
</div>

// DON'T: Custom container patterns
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

// DON'T: Duplicate stats in body when already in header
<WorkspacePageShell stats={[...]}>
  <div className="grid">
    {stats.map(s => <Card>{s.value}</Card>)} {/* Duplicate! */}
  </div>
</WorkspacePageShell>
```

### ✅ Do This Instead

```tsx
// DO: Use PanelCard
import PanelCard from '../../components/vendorsoluce-intelligence/PanelCard';
<PanelCard title="Title">Content</PanelCard>

// DO: Use spacing constants
import { WORKSPACE_PAGE_BODY_GRID_CLASS } from '...';
<div className={WORKSPACE_PAGE_BODY_GRID_CLASS}>
  <PanelCard>...</PanelCard>
</div>

// DO: Use WorkspacePageShell
<WorkspacePageShell title="..." description="...">

// DO: Use stats in header only
<WorkspacePageShell
  stats={[
    { label: 'Total', value: 42, hint: 'All items' }
  ]}
>
  {/* Body content - no duplicate stats */}
</WorkspacePageShell>
```

## Validation

All workspace pages are validated by `packages/shared/scripts/verify-workspace-layout.mjs`:

- ✓ Must use WorkspacePageShell or WorkspacePage
- ✓ Must use PanelCard (not Card) for sections
- ✓ Must use spacing constants (not ad-hoc classes)
- ✓ Must not import marketing home components
- ✓ Must not use legacy container patterns

Run validation:
```bash
node packages/shared/scripts/verify-workspace-layout.mjs
```

## Migration Checklist

When updating an existing page:

- [ ] Replace `Card` imports with `PanelCard`
- [ ] Replace all `<Card>` with `<PanelCard>`
- [ ] Import spacing constant: `WORKSPACE_PAGE_BODY_GRID_CLASS`
- [ ] Apply spacing constant to body wrapper div
- [ ] Remove ad-hoc `space-y-*` or `gap-*` from page body level
- [ ] Ensure using `WorkspacePageShell` or `WorkspacePage`
- [ ] Remove duplicate stats displays from body
- [ ] Choose between `actions` array or `headerActionsSlot`
- [ ] Add `mode` attribute if appropriate (guide/execute)
- [ ] Use standard loading/empty state components
- [ ] Run `verify-workspace-layout.mjs` to confirm

## Examples

See these reference implementations:

- **Simple page**: `ProfilePage.tsx`
- **With stats**: `BillingPage.tsx`
- **Two-column**: `UserDashboard.tsx` (after refactor)
- **With mode**: `TeamRaciPage.tsx`
- **Complex actions**: `AssetManagementPage.tsx`

## Questions?

Refer to:
- `WorkspacePageShell.tsx` - Shell component source
- `WorkspacePage.tsx` - Simplified wrapper
- `PanelCard.tsx` - Content section component
- This document for patterns and standards
