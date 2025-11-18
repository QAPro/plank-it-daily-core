# CI/CD Setup Instructions

This document explains how to set up the automated CI/CD pipeline for Inner Fire PWA.

## Overview

The CI/CD pipeline automatically:
- Builds and tests code on every push
- Deploys to **production** when pushing to `main` branch
- Deploys to **staging** when pushing to `develop` branch
- Creates **preview deployments** for pull requests

## GitHub Actions Workflows

Two workflows have been created:

### 1. `deploy.yml` - Main Deployment Workflow
- Triggers on push to `main` or `develop` branches
- Runs linting and tests
- Builds the project
- Deploys to Vercel (production for main, preview for develop)

### 2. `preview.yml` - PR Preview Workflow
- Triggers on pull request events
- Creates a preview deployment for each PR
- Comments on the PR with the preview URL

## Required GitHub Secrets

To enable the CI/CD pipeline, you need to add the following secrets to your GitHub repository:

### How to Add Secrets

1. Go to your GitHub repository: `https://github.com/QAPro/plank-it-daily-core`
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each of the following secrets:

### Secret 1: VERCEL_TOKEN

**Name:** `VERCEL_TOKEN`

**How to get the value:**
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Give it a name like "GitHub Actions CI/CD"
4. Set expiration (recommend "No Expiration" for production)
5. Click "Create"
6. Copy the token immediately (you won't be able to see it again)

### Secret 2: VERCEL_ORG_ID

**Name:** `VERCEL_ORG_ID`

**How to get the value:**
1. Go to your Vercel project settings
2. Navigate to the project root directory on your local machine
3. Run: `cat .vercel/project.json` (if you've deployed before)
4. Or run: `vercel link` to link the project and it will create the file
5. Look for the `"orgId"` field

**Alternative method:**
1. Go to https://vercel.com/account
2. Your Org ID is in the URL: `vercel.com/[team-name]/settings`
3. Or check the Vercel CLI output when running `vercel whoami`

### Secret 3: VERCEL_PROJECT_ID

**Name:** `VERCEL_PROJECT_ID`

**How to get the value:**
1. Go to your project settings in Vercel
2. The Project ID is shown in the "General" settings page
3. Or run: `cat .vercel/project.json` and look for `"projectId"`

**Alternative method:**
1. Go to https://vercel.com/phils-projects-36ed4b87/inner-fire/settings
2. Scroll down to find the Project ID

## Verifying the Setup

After adding the secrets:

1. Make a small change to the `develop` branch
2. Push the change: `git push origin develop`
3. Go to the **Actions** tab in GitHub to see the workflow running
4. Check Vercel deployments to confirm the deployment succeeded

## Workflow Diagram

```
┌─────────────────┐
│  Push to main   │ ──→ Build & Test ──→ Deploy to Production
└─────────────────┘

┌─────────────────┐
│ Push to develop │ ──→ Build & Test ──→ Deploy to Staging
└─────────────────┘

┌─────────────────┐
│  Pull Request   │ ──→ Build & Test ──→ Preview Deployment ──→ Comment on PR
└─────────────────┘
```

## Troubleshooting

### Workflow fails with "VERCEL_TOKEN not found"
- Make sure you've added all three secrets to GitHub
- Check that the secret names match exactly (case-sensitive)

### Deployment succeeds but uses wrong environment
- Check that environment variables are set correctly in Vercel
- Verify the branch-specific environment variables in Vercel settings

### Build fails
- Check the GitHub Actions logs for specific error messages
- Ensure all dependencies are listed in `package.json`
- Verify that the build command works locally

## Next Steps

After setting up CI/CD:
1. Test the pipeline by creating a pull request
2. Verify preview deployments are working
3. Merge to develop to test staging deployment
4. Merge to main to test production deployment

---
Last updated: November 18, 2025
