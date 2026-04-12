# VendorSoluce clean repo

This package intentionally excludes generated artifacts and local machine residue:
- node_modules
- Turbo caches
- generated dist folders
- editor/tooling residue (.bolt, .cursor, .giga)
- generated Tailwind CSS output

## Fresh setup

```bash
npm install
npm run build:website
npm run build:app
npm run build:portal
```

## Notes

- The website CSS is rebuilt by the website package build.
- This is a source-first repo intended for a clean install in the target environment.
