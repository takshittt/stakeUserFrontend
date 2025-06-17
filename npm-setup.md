# NPM Setup Guide

This project now uses npm instead of yarn for package management.

## Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Clean cache and build artifacts
npm run clean

# Fresh install (removes node_modules and reinstalls)
npm run fresh-install
```

## NPM Configuration

The project includes `.npmrc` with these settings:

- `save-exact=true` - Install exact versions
- `package-lock=true` - Generate package-lock.json
- `fund=false` - Disable funding messages
- `audit=false` - Disable audit warnings during install

## Migration from Yarn

If you previously used yarn, run:

```bash
npm run fresh-install
```

This will:

1. Remove existing node_modules
2. Remove package-lock.json
3. Install fresh dependencies with npm
