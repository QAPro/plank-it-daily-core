# Inner Fire - Staging Environment Deployment Instructions

## Current Status

✅ **Completed:**
- Production environment fully deployed at **innerfire.fit**
- Production Supabase database configured and operational
- Staging Supabase project created (`lhbgfppojpfhaooflfip`)
- Staging database schema migrated successfully (128 tables)
- `develop` branch exists in GitHub repository
- Vercel project connected to GitHub repository

🔄 **Next Step:**
- Configure environment variables for the `develop` branch in Vercel

---

## Staging Environment Configuration

### Staging Supabase Details

**Project Reference:** `lhbgfppojpfhaooflfip`  
**Project URL:** https://lhbgfppojpfhaooflfip.supabase.co  
**Database:** Fully migrated with 128 tables (same schema as production)

### Environment Variables for Develop Branch

You need to add the following environment variables in Vercel, specifically for the **Preview** environment with the **develop** branch:

```
VITE_SUPABASE_URL=https://lhbgfppojpfhaooflfip.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoYmdmcHBvanBmaGFvb2ZsZmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5MjI1NzUsImV4cCI6MjA0NzQ5ODU3NX0.Xp_RjLUNXjwCpnTpNWPQh8VqGWdmDVpY-2kUP8Xjfck
VITE_SUPABASE_PROJECT_ID=lhbgfppojpfhaooflfip
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_SOCIAL_FEATURES=true
```

---

## Step-by-Step Instructions

### Option 1: Add Variables via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - Navigate to https://vercel.com/dashboard
   - Click on the **inner-fire** project

2. **Open Settings:**
   - Click on **Settings** tab
   - Click on **Environment Variables** in the left sidebar

3. **Add Each Variable:**
   
   For each of the 5 variables listed above:
   
   a. **Click "Add Another"** (or use the first empty row)
   
   b. **Fill in the Key field:**
      - Example: `VITE_SUPABASE_URL`
   
   c. **Fill in the Value field:**
      - Example: `https://lhbgfppojpfhaooflfip.supabase.co`
   
   d. **Select Environment:**
      - Click the **"All Environments"** dropdown
      - Select **"Preview"**
      - Click **"Select a custom Preview branch"**
      - Type `develop` in the search field
      - Select the **develop** branch from the dropdown
   
   e. **Repeat for all 5 variables**

4. **Save Changes:**
   - Click the **"Save"** button at the bottom
   - Vercel will confirm that the variables have been saved

### Option 2: Import from .env File (Faster)

1. **Download the .env.staging file:**
   - The file is located at: `/home/ubuntu/plank-it-daily-core/.env.staging`
   - Contains all 5 environment variables

2. **In Vercel Dashboard:**
   - Go to **Settings** → **Environment Variables**
   - Click **"Import .env"** button
   - Paste the contents of `.env.staging` file
   - Select **Preview** environment
   - Select **develop** branch
   - Click **Save**

---

## Trigger Staging Deployment

Once the environment variables are configured:

### Method 1: Push to Develop Branch

```bash
cd /home/ubuntu/plank-it-daily-core
git checkout develop
git commit --allow-empty -m "Trigger staging deployment"
git push origin develop
```

### Method 2: Via Vercel Dashboard

1. Go to **Deployments** tab
2. Click **"Deploy"** button
3. Select **develop** branch
4. Click **"Deploy"**

---

## Verify Staging Deployment

After deployment completes (usually 2-5 minutes):

1. **Check Deployment Status:**
   - Go to Vercel Dashboard → **Deployments**
   - Look for the latest deployment from the `develop` branch
   - Status should show "Ready"

2. **Get Staging URL:**
   - Click on the deployment
   - Copy the deployment URL (will be something like `inner-fire-git-develop-*.vercel.app`)

3. **Test Staging Site:**
   - Open the staging URL in your browser
   - Try to sign up/log in (this will test the Supabase connection)
   - Check that the app loads correctly

4. **Verify Database Connection:**
   - Any data created on staging should appear in the staging Supabase project
   - Go to https://supabase.com/dashboard/project/lhbgfppojpfhaooflfip
   - Check **Table Editor** to see if data is being created

---

## Troubleshooting

### If Deployment Fails:

1. **Check Build Logs:**
   - Go to the failed deployment in Vercel
   - Click "Build Logs"
   - Look for error messages

2. **Common Issues:**
   - **Environment variables not set:** Verify all 5 variables are present
   - **Wrong environment selected:** Make sure variables are set for "Preview" + "develop" branch
   - **Build errors:** Check if the code in develop branch has any syntax errors

### If App Loads But Can't Connect to Database:

1. **Verify Environment Variables:**
   - In Vercel, go to the deployment
   - Click "..." menu → "View Function Logs"
   - Check if the correct Supabase URL is being used

2. **Check Supabase Project:**
   - Ensure the staging project is not paused
   - Go to https://supabase.com/dashboard/project/lhbgfppojpfhaooflfip
   - Check project status (should be "Active")

---

## Next Steps After Staging is Working

Once staging deployment is successful:

1. **Set up automated preview deployments** for pull requests
2. **Generate VAPID keys** for push notifications (separate for staging/production)
3. **Configure custom domain** for staging (optional, e.g., staging.innerfire.fit)
4. **Set up monitoring** and error tracking for staging environment

---

## Important Notes

- **Staging and Production are completely separate:**
  - Different databases
  - Different user accounts
  - Different data
  - Changes in staging do NOT affect production

- **When to use Staging:**
  - Test new features before deploying to production
  - Test database migrations
  - Test integrations with external services
  - Allow team members to review changes

- **Deployment Workflow:**
  1. Develop features in feature branches
  2. Merge to `develop` branch → Auto-deploys to staging
  3. Test on staging
  4. Merge `develop` to `main` → Auto-deploys to production

---

## Contact & Support

If you encounter any issues or need clarification on any step, please let me know!
