# NEXORA Alumni Network - Quick Commands Reference

## Essential Commands

### 🚀 Development

```bash
# Navigate to the application
cd artifacts/nexora-alumni

# Start development server (HMR enabled)
pnpm run dev
# Access at: http://localhost:5173/

# Start with custom port
PORT=3000 pnpm run dev

# Type checking during development
pnpm run typecheck

# Watch for TypeScript errors
pnpm run typecheck --watch
```

### 🏗️ Production Build

```bash
# Build for production
pnpm run build

# Preview production build locally
pnpm run serve

# Build with source maps (debugging)
pnpm run build --sourcemap

# Check bundle size
pnpm run build
# Results in: dist/public/assets/
```

### 📦 Dependency Management

```bash
# Install all dependencies
pnpm install

# Add a new package
pnpm add package-name

# Add dev dependency
pnpm add -D package-name

# Remove a package
pnpm remove package-name

# Update all packages
pnpm update

# Check for outdated packages
pnpm outdated

# Clean install (nuclear option)
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 🧹 Cleanup

```bash
# Clear node_modules
rm -rf node_modules
pnpm install

# Clear build artifacts
rm -rf artifacts/nexora-alumni/dist

# Clear pnpm cache
pnpm store prune

# Full project clean
rm -rf node_modules dist
pnpm install
pnpm run build
```

## Workspace Commands (from root)

```bash
# Build entire workspace
pnpm run build

# Type check all packages
pnpm run typecheck

# Run script in specific package
pnpm --filter @workspace/nexora-alumni run dev

# Install dependencies for all
pnpm install

# List workspace structure
pnpm list --depth=0
```

## Development Workflow

### Daily Development
```bash
# 1. Start dev server
cd artifacts/nexora-alumni
pnpm run dev

# 2. In another terminal, run type checking
pnpm run typecheck

# 3. Make changes, HMR will reload automatically
# 4. Check console for errors
```

### Before Commit
```bash
# Type check
pnpm run typecheck

# Build test
pnpm run build

# If clean, commit
git add .
git commit -m "Feature description"
git push origin branch-name
```

### Before Deployment
```bash
# Full clean build
rm -rf dist node_modules
pnpm install
pnpm run build

# Verify build success
ls dist/public/index.html

# Deploy!
pnpm run serve
```

## Testing & Verification

### Check Build
```bash
# Production build
pnpm run build

# Verify no errors
echo $?  # Should be 0

# Check bundle size
du -sh dist/public

# Detailed build output
pnpm run build --verbose
```

### Development Verification
```bash
# Type check
pnpm run typecheck

# Check for console errors
# - Open browser DevTools
# - Check Console tab
# - No red errors should appear

# Test authentication
# 1. Go to http://localhost:5173/
# 2. Try login with test credentials
# 3. Check role redirect works
```

### Performance Check
```bash
# Build analysis
pnpm run build

# Check gzip size
# Results show: "gzip: XXX kB"

# Run Lighthouse
# Use Chrome DevTools > Lighthouse
# Target: 90+ score
```

## Git Commands

### Version Control
```bash
# Check status
git status

# View recent commits
git log --oneline -10

# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "Descriptive message"

# Push to remote
git push origin feature/new-feature

# Create pull request
# Use GitHub UI or gh CLI

# Merge after review
git checkout main
git merge feature/new-feature
git push origin main
```

### Branch Management
```bash
# List local branches
git branch

# List all branches
git branch -a

# Delete local branch
git branch -d feature-name

# Delete remote branch
git push origin --delete feature-name

# Rename branch
git branch -m old-name new-name
```

## Debugging Commands

### Browser DevTools
```bash
# In Console:
// Check auth state
localStorage.getItem('firebaseAuth')

// Check current user
console.log(window.currentUser)

// Check role
console.log(localStorage.getItem('userRole'))

// Clear cache
localStorage.clear()
sessionStorage.clear()
```

### Server Logs
```bash
# View dev server output
# Check terminal where pnpm run dev was executed

# Check for specific errors
# Filter console for error messages
# Look for stack traces

# Save logs to file
pnpm run dev > dev.log 2>&1

# View logs
tail -f dev.log
```

### Network Debugging
```bash
# In DevTools Network tab:
# 1. Filter by XHR/Fetch
# 2. Check Firebase API calls
# 3. Verify response status
# 4. Check payload in Preview tab

# Check CORS issues
# Look for red errors with CORS mention
# See CORS headers in Response tab
```

## Firebase CLI Commands

```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Deploy functions
firebase deploy --only functions

# Emulate locally
firebase emulators:start

# View logs
firebase functions:log

# Clear firestore data (careful!)
firebase firestore:delete --recursive --yes /
```

## Deployment Commands

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy preview
vercel deploy

# Deploy production
vercel deploy --prod

# View deployments
vercel list

# Rollback
vercel rollback
```

### GitHub Pages
```bash
# Build
pnpm run build

# Deploy using gh-pages
npm run deploy

# Or manual push
cd dist/public
git init
git add .
git commit -m "Deploy"
git push -f origin main:gh-pages
```

### Netlify
```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# View logs
netlify logs
```

### Docker
```bash
# Build image
docker build -t nexora-alumni .

# Run container
docker run -p 3000:3000 nexora-alumni

# Push to registry
docker push your-registry/nexora-alumni
```

## Environment Setup

### Set Environment Variables

#### Vercel
```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_PROJECT_ID
# ... add all required vars
```

#### Local .env
```bash
# Create .env.local
cat > .env.local << EOF
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
EOF
```

#### Docker
```bash
docker run -e VITE_FIREBASE_API_KEY=key -p 3000:3000 nexora-alumni
```

## Package Installation

### Add New Packages
```bash
# Add UI component library
pnpm add @shadcn/ui

# Add form library
pnpm add react-hook-form zod

# Add state management
pnpm add zustand

# Add HTTP client
pnpm add axios

# Add notifications
pnpm add sonner

# Add date handling
pnpm add date-fns
```

### Update Packages
```bash
# Update specific package
pnpm update package-name

# Update to latest
pnpm update package-name@latest

# Update all
pnpm update --latest

# Update with breaking changes
pnpm update --breaking
```

## Performance Commands

### Bundle Analysis
```bash
# Generate build
pnpm run build

# View sizes
ls -lh dist/public/assets/

# Check for large chunks
pnpm run build --verbose | grep "kB"

# Analyze dependencies
pnpm why package-name
```

### Performance Monitoring
```bash
# Lighthouse CLI
npm install -g @lhci/cli@*
lhci autorun

# Performance measurements
# Use Chrome DevTools > Performance
# Record > Stop > Analyze

# Check Core Web Vitals
# Use PageSpeed Insights
# Compare before/after changes
```

## Advanced Commands

### Monorepo Operations
```bash
# Filter specific package
pnpm --filter @workspace/nexora-alumni run dev

# Filter multiple
pnpm --filter "@workspace/nexora-*" run build

# List all packages
pnpm list --depth=-1

# Check dependencies
pnpm why firestore
```

### Development with Multiple Terminals
```bash
# Terminal 1: Dev server
cd artifacts/nexora-alumni
pnpm run dev

# Terminal 2: Type watching
pnpm run typecheck

# Terminal 3: Git operations
git status
git add .
git commit -m "Message"
```

### Scripting
```bash
# Run multiple commands
pnpm run typecheck && pnpm run build

# Run with variables
NODE_ENV=production pnpm run build

# Run with filtering
pnpm -r --if-present run build

# Watch mode
pnpm run typecheck --watch
```

## Useful Aliases

Add to `.bashrc` or `.zshrc`:

```bash
alias dev="cd artifacts/nexora-alumni && pnpm run dev"
alias build="cd artifacts/nexora-alumni && pnpm run build"
alias serve="cd artifacts/nexora-alumni && pnpm run serve"
alias type="pnpm run typecheck"
alias clean="rm -rf node_modules dist && pnpm install"
alias commit="git add . && git commit -m"
alias push="git push origin"
```

Usage:
```bash
dev              # Start dev server
build            # Build for production
serve            # Preview production build
type             # Run type checking
clean            # Clean and reinstall
commit "msg"     # Commit with message
push             # Push current branch
```

## Emergency Commands

### If Everything Breaks
```bash
# Nuclear reset
rm -rf node_modules dist artifacts/*/dist
pnpm install
pnpm run build

# If pnpm broken
npm install -g pnpm@latest
pnpm install
```

### Undo Recent Changes
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Discard all local changes
git checkout -- .

# Stash changes temporarily
git stash
git stash pop
```

### Check Everything
```bash
# System check
node --version
pnpm --version
git --version

# Project check
pnpm list --depth=0
git log --oneline -3
pnpm run typecheck

# Build check
pnpm run build
ls dist/public/index.html
```

## Common Issues & Solutions

### Issue: "Port already in use"
```bash
# Find process using port 5173
lsof -i :5173

# Kill process
kill -9 <PID>

# Or use different port
PORT=3000 pnpm run dev
```

### Issue: "ENOENT: no such file or directory"
```bash
# Clear cache
pnpm store prune

# Reinstall
rm -rf node_modules
pnpm install
```

### Issue: "TypeScript errors"
```bash
# Check errors
pnpm run typecheck

# Fix if possible
pnpm run typecheck --noEmit

# See detailed errors
pnpm run typecheck --pretty=false
```

### Issue: "Build fails"
```bash
# Clear and rebuild
rm -rf dist
pnpm run build --verbose

# Check specific errors
# Look at bottom of output

# Rebuild from scratch
rm -rf node_modules dist
pnpm install
pnpm run build
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────┐
│  NEXORA Alumni Network - Commands        │
├─────────────────────────────────────────┤
│  pnpm run dev        Start dev server    │
│  pnpm run build      Production build    │
│  pnpm run serve      Preview production  │
│  pnpm run typecheck  Type checking       │
│                                          │
│  git status          View changes        │
│  git commit -am "msg" Commit changes     │
│  git push origin     Push to remote      │
│                                          │
│  PORT=3000 pnpm dev  Custom port         │
│  rm -rf dist         Clear build         │
│  pnpm install        Install deps        │
└─────────────────────────────────────────┘
```

---

For more information, see:
- **README.md** - Full documentation
- **QUICKSTART.md** - Quick setup guide
- **DEPLOYMENT.md** - Deployment instructions

Happy coding! 🚀
