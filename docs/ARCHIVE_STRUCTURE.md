# Archive Structure Documentation

## Overview

The root directory has been cleaned up by archiving historical documentation, setup scripts, and backup files into organized archive directories.

## Root Directory Structure

The root now contains only essential files:
- `package.json` - Workspace configuration
- `package-lock.json` - Dependency lock file
- `turbo.json` - Turborepo build configuration
- `README.md` - Main project documentation
- `.gitignore` - Git ignore rules
- `.npmrc` - npm configuration
- `.prettierrc` - Prettier configuration

## Archive Organization

### `archive/setup/`
Contains archived Git setup scripts and documentation:
- `GIT_COMMANDS.md`
- `GIT_SETUP.md`
- `QUICK_GIT_SETUP.md`
- `SETUP.md`
- `setup-git-repo.ps1`
- `push-to-remote.ps1`

### `archive/migrations/`
Contains archived migration documentation:
- `MIGRATION_GUIDE.md`
- `MONOREPO_SETUP_COMPLETE.md`

### `archive/integrations/`
Contains archived integration documentation:
- `INTEGRATION_COMPLETE_SUMMARY.md`
- `UNIFIED_INTEGRATION_IMPLEMENTATION.md`

### `archive/backups/`
Contains backup archive files:
- `packages.zip`
- `packages (2).zip`

## Active Directories

### `docs/`
Active documentation directory (currently contains this file and README).

### `NewUpdate/`
Active updates and strategy documents:
- Journey documentation
- Workflow alignment analysis
- Strategy documents
- HTML prototypes

### `packages/`
Main code packages:
- `app/` - React application
- `website/` - HTML marketing site
- `shared/` - Shared utilities

## Accessing Archived Files

To access archived setup scripts:
```bash
.\archive\setup\setup-git-repo.ps1
```

To view archived documentation:
- See `archive/README.md` for overview
- Check individual subdirectory READMEs for specific content

## Date Archived

January 9, 2026
