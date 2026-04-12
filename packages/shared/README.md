# Shared Package

Shared configurations and utilities used across VendorSoluce packages.

## Exports

### `tailwind-colors`
Shared color tokens for consistent branding across packages.

### `tailwind-config`
Shared Tailwind theme configuration.

## Usage

```javascript
// In tailwind.config.js
import { sharedTheme } from 'shared/tailwind-config';

export default {
  theme: {
    ...sharedTheme,
    // Add package-specific extensions
  }
}
```

