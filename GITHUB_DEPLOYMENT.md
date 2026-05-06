# GitHub & Vercel Deployment Guide

## Overview

This project uses GitHub Actions for CI/CD and is configured for automatic deployment to Vercel on every push to the main branch.

## Configured Workflows

### 1. **CI Workflow** (`.github/workflows/ci.yml`)
Runs on every push and pull request to validate code quality:
- Installs dependencies
- Runs TypeScript type checking
- Builds the project
- Uploads build artifacts

### 2. **Deployment Workflow** (`.github/workflows/deploy.yml`)
Automatically deploys to Vercel when changes are merged to main:
- Runs CI checks
- Builds the application
- Deploys to Vercel production

### 3. **PR Preview Workflow** (`.github/workflows/pr-preview.yml`)
Creates preview deployments for pull requests:
- Builds the application
- Deploys preview to Vercel
- Comments on PR with preview URL

## Setup Instructions

### Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Select "Import Git Repository"
4. Find and select `cyrilchris-j/Alumni-intrac`
5. Configure project settings:
   - **Framework Preset:** Vite
   - **Build Command:** `pnpm run build`
   - **Output Directory:** `dist`
   - **Root Directory:** `artifacts/nexora-alumni`
6. Click "Deploy"

### Step 2: Get Vercel Secrets

After deployment, you'll need three secrets for GitHub Actions:

1. **VERCEL_TOKEN**
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Create a new token
   - Copy the token

2. **VERCEL_ORG_ID** & **VERCEL_PROJECT_ID**
   - Go to your project settings in Vercel
   - Copy the `orgId` and `projectId` from the URL or settings

### Step 3: Add GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and Variables → Actions
3. Click "New Repository Secret"
4. Add these secrets:
   - Name: `VERCEL_TOKEN`, Value: (your Vercel token)
   - Name: `VERCEL_ORG_ID`, Value: (your org ID)
   - Name: `VERCEL_PROJECT_ID`, Value: (your project ID)

### Step 4: Add Firebase Environment Variables

If deploying with Firebase authentication enabled:

1. In Vercel Project Settings → Environment Variables
2. Add your Firebase configuration:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

Or add them in GitHub Secrets and update the workflows to pass them to Vercel.

## Deployment Workflow

### Automatic Deployments

**Production Deployment:**
1. Create a feature branch
2. Make your changes
3. Push to GitHub
4. Create a Pull Request
5. GitHub Actions runs CI checks
6. PR Preview automatically deploys
7. Review the preview at the comment URL
8. Merge PR to main
9. Production deployment automatically starts
10. Your app is live!

### Manual Deployment

If you need to manually trigger a deployment:

1. Go to GitHub Repository
2. Click "Actions" tab
3. Select "Deploy to Vercel" workflow
4. Click "Run workflow" dropdown
5. Select branch and click "Run workflow"

## Monitoring Deployments

### GitHub Actions
- View workflow runs: Repository → Actions
- Check individual job logs for debugging
- See build and deploy status

### Vercel Dashboard
- View deployment history: Project → Deployments
- Check application health
- View function logs and analytics
- Manage preview deployments

## Troubleshooting

### Workflow Fails with "Port Already in Use"

**Solution:** The dev server might still be running from a previous session.
```bash
pkill -9 -f vite
```

### TypeScript Errors During CI

**Solution:** Run locally to fix errors before pushing:
```bash
pnpm run typecheck
```

### Build Fails with "Module Not Found"

**Solution:** Ensure all dependencies are installed:
```bash
pnpm install
pnpm run build
```

### Deployment Token Expired

**Solution:**
1. Go to Vercel → Account Settings → Tokens
2. Create a new token
3. Update the `VERCEL_TOKEN` secret in GitHub

### Preview URL Not Showing in PR Comments

**Solution:**
1. Check GitHub Actions permissions (Settings → Actions → Permissions)
2. Ensure `GITHUB_TOKEN` has write access
3. Rerun the workflow

## Best Practices

1. **Always run locally first:**
   ```bash
   pnpm run dev
   pnpm run build
   pnpm run typecheck
   ```

2. **Use meaningful commit messages** for better tracking

3. **Review PR previews** before merging

4. **Keep secrets secure:**
   - Never commit `.env` files
   - Rotate Vercel tokens periodically
   - Use branch protection rules

5. **Monitor deployments:**
   - Check Vercel dashboard regularly
   - Set up Vercel notifications
   - Monitor error rates

## Environment Variables

### Required for Build
- `VITE_API_URL` (if using API)

### Required for Firebase (Optional)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Deployment Status Badges

Add these badges to your README.md:

```markdown
![CI](https://github.com/cyrilchris-j/Alumni-intrac/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/cyrilchris-j/Alumni-intrac/actions/workflows/deploy.yml/badge.svg)
```

## Advanced Configuration

### Custom Build Commands
Edit `.github/workflows/ci.yml` and `.github/workflows/deploy.yml` to change build commands.

### Multiple Environments
To deploy to different environments (staging, production):
1. Create separate Vercel projects
2. Add separate secrets for each environment
3. Create multiple deployment workflows

### Slack Notifications
To get Slack notifications on deployments, see the [Vercel Slack Integration](https://vercel.com/docs/integrations/slack).

## Additional Resources

- [Vercel Deployment Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [Firebase Configuration](https://firebase.google.com/docs/web/setup)

## Need Help?

- Check GitHub Actions logs: Repository → Actions → (select workflow)
- Check Vercel deployment logs: Project → Deployments → (select deployment)
- Review console errors in preview deployments
- Check the troubleshooting section above
