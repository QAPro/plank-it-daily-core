# Custom Domain Setup - innerfire.fit

## Overview

Your production deployment is now configured to use the custom domain `innerfire.fit` instead of the default `inner-fire.vercel.app` domain.

**Configuration Status:**
- ✅ Domains added to Vercel project
- ⏳ DNS records need to be configured (see below)
- ✅ Production environment assigned to custom domain

## Domain Configuration

Vercel has been configured with the following domains:

1. **innerfire.fit** (apex domain)
   - Redirects to www.innerfire.fit (307 redirect)
   - Environment: Production

2. **www.innerfire.fit** (primary domain)
   - Main production domain
   - Environment: Production

3. **inner-fire.vercel.app** (fallback)
   - Default Vercel domain
   - Environment: Production
   - Will continue to work as a backup

## Required DNS Configuration

To complete the setup, you need to add the following DNS records to your domain registrar where you purchased `innerfire.fit`.

### DNS Records to Add

#### Record 1: Apex Domain (innerfire.fit)

| Field | Value |
|-------|-------|
| **Type** | A |
| **Name** | @ |
| **Value** | `76.76.21.21` |
| **TTL** | 3600 (or Auto) |

#### Record 2: WWW Subdomain (www.innerfire.fit)

| Field | Value |
|-------|-------|
| **Type** | CNAME |
| **Name** | www |
| **Value** | `2c173b42743a263a.vercel-dns-016.com.` |
| **TTL** | 3600 (or Auto) |

**Important:** Make sure to include the trailing dot (.) in the CNAME value.

## Step-by-Step Instructions

### Step 1: Access Your Domain Registrar

Log in to the service where you purchased `innerfire.fit`. Common registrars include:
- GoDaddy
- Namecheap
- Google Domains
- Cloudflare
- Route 53 (AWS)

### Step 2: Navigate to DNS Settings

Look for one of these sections:
- DNS Management
- DNS Settings
- Name Servers
- Advanced DNS
- Manage DNS

### Step 3: Add the A Record

1. Click "Add Record" or "Add New Record"
2. Select type: **A**
3. Name/Host: **@** (or leave blank for root domain)
4. Value/Points to: **76.76.21.21**
5. TTL: **3600** (or Auto/Default)
6. Save the record

### Step 4: Add the CNAME Record

1. Click "Add Record" or "Add New Record"
2. Select type: **CNAME**
3. Name/Host: **www**
4. Value/Points to: **2c173b42743a263a.vercel-dns-016.com.**
5. TTL: **3600** (or Auto/Default)
6. Save the record

### Step 5: Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours** to propagate globally
- Typically takes **15-30 minutes** for most changes
- You can check propagation status at: https://dnschecker.org

### Step 6: Verify in Vercel

1. Go to: https://vercel.com/phils-projects-36ed4b87/inner-fire/settings/domains
2. Click "Refresh" next to each domain
3. Wait for "Invalid Configuration" to change to "Valid Configuration"
4. Once valid, your domain is live!

## Testing Your Domain

After DNS propagation:

1. Visit https://innerfire.fit
   - Should redirect to https://www.innerfire.fit
   
2. Visit https://www.innerfire.fit
   - Should load your production app
   
3. Check SSL certificate
   - Vercel automatically provisions SSL certificates
   - Look for the padlock icon in your browser

## Troubleshooting

### Domain shows "Invalid Configuration" after 24 hours

**Possible causes:**
- DNS records not added correctly
- Typo in the DNS values
- DNS not propagated yet

**Solutions:**
1. Double-check DNS records match exactly
2. Use https://dnschecker.org to verify DNS propagation
3. Click "Refresh" in Vercel domains settings
4. Contact your domain registrar support

### "ERR_NAME_NOT_RESOLVED" error

**Cause:** DNS records haven't propagated yet

**Solution:** Wait longer, DNS can take up to 48 hours

### SSL certificate error

**Cause:** Vercel is still provisioning the SSL certificate

**Solution:** 
- Wait 5-10 minutes after DNS is valid
- Vercel automatically provisions Let's Encrypt SSL certificates
- No action needed on your part

### Domain works without www but not with www (or vice versa)

**Cause:** One of the DNS records is missing or incorrect

**Solution:**
- Verify both A and CNAME records are added
- Check for typos in the values
- Ensure CNAME value has the trailing dot

## Updating Supabase Redirect URLs

After your domain is live, update your Supabase authentication settings:

### Production Supabase

1. Go to: https://supabase.com/dashboard/project/kgwmolptoctmosefnpfg/auth/url-configuration
2. Add to "Redirect URLs":
   - `https://innerfire.fit/**`
   - `https://www.innerfire.fit/**`
3. Update "Site URL" to: `https://www.innerfire.fit`
4. Save changes

### Staging Supabase

1. Go to: https://supabase.com/dashboard/project/lhbgfppojpfhaooflfip/auth/url-configuration
2. Keep existing preview URLs
3. No changes needed (staging uses Vercel preview URLs)

## Environment Variables

No changes needed to environment variables! Vercel automatically uses the correct environment variables based on the branch:

- **main branch** → Production environment → innerfire.fit
- **develop branch** → Preview environment → Staging database
- **PR branches** → Preview environment → Staging database

## Pipeline Behavior After Domain Setup

### Production Deployments (main branch)

```bash
git push origin main
```

**Result:**
- Deploys to production
- Accessible at:
  - ✅ https://www.innerfire.fit (primary)
  - ✅ https://innerfire.fit (redirects to www)
  - ✅ https://inner-fire.vercel.app (fallback)

### Staging Deployments (develop branch)

```bash
git push origin develop
```

**Result:**
- Deploys to staging
- Accessible at:
  - ✅ https://inner-fire-git-develop-*.vercel.app
  - Uses staging database

### Preview Deployments (PR branches)

```bash
# Create PR from feature branch
```

**Result:**
- Deploys preview
- Accessible at:
  - ✅ https://inner-fire-git-[branch-name]-*.vercel.app
  - Uses staging database

## DNS Record Reference

Quick copy-paste reference:

```
# A Record (apex domain)
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

# CNAME Record (www subdomain)
Type: CNAME
Name: www
Value: 2c173b42743a263a.vercel-dns-016.com.
TTL: 3600
```

## Vercel Automatic Features

Once DNS is configured, Vercel automatically provides:

- ✅ **SSL/TLS certificates** (Let's Encrypt)
- ✅ **Auto-renewal** of certificates
- ✅ **HTTP to HTTPS redirect**
- ✅ **Global CDN** distribution
- ✅ **DDoS protection**
- ✅ **Automatic www redirect** (from apex to www)

## Support Resources

- **Vercel DNS Documentation:** https://vercel.com/docs/concepts/projects/domains
- **DNS Checker Tool:** https://dnschecker.org
- **SSL Checker:** https://www.sslshopper.com/ssl-checker.html
- **Vercel Support:** https://vercel.com/support

## Summary

✅ **Completed:**
- Custom domain added to Vercel project
- Production environment assigned to innerfire.fit
- DNS configuration values obtained

⏳ **Next Steps:**
1. Add DNS records to your domain registrar
2. Wait for DNS propagation (15-30 minutes typically)
3. Verify domains in Vercel show "Valid Configuration"
4. Update Supabase redirect URLs
5. Test the live domain

**Once DNS is configured, your production deployments will automatically go to innerfire.fit!**

---
**Last Updated:** November 18, 2025  
**Status:** DNS configuration pending
