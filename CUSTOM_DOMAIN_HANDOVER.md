# Custom Domain Configuration - Quick Start

## ✅ What Just Happened

Your production deployment has been configured to use **innerfire.fit** as the custom domain instead of the default Vercel domain.

**Current Status:**
- ✅ Domain added to Vercel project
- ✅ Production environment assigned
- ✅ Automatic redirect from innerfire.fit → www.innerfire.fit
- ⏳ **DNS configuration needed** (see below)

## 🚀 Quick Setup (3 Steps)

### Step 1: Add DNS Records

Go to your domain registrar (where you bought innerfire.fit) and add these two DNS records:

**Record 1:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Record 2:**
```
Type: CNAME
Name: www
Value: 2c173b42743a263a.vercel-dns-016.com.
```

### Step 2: Wait for DNS Propagation

- Typically takes **15-30 minutes**
- Can take up to 48 hours in rare cases
- Check status at: https://dnschecker.org

### Step 3: Verify in Vercel

1. Go to: https://vercel.com/phils-projects-36ed4b87/inner-fire/settings/domains
2. Click "Refresh" next to each domain
3. Wait for "Valid Configuration" status
4. Done! Your site is live at https://www.innerfire.fit

## 📋 After DNS is Live

### Update Supabase Redirect URLs

**Production Supabase:**
1. Go to: https://supabase.com/dashboard/project/kgwmolptoctmosefnpfg/auth/url-configuration
2. Add these redirect URLs:
   - `https://innerfire.fit/**`
   - `https://www.innerfire.fit/**`
3. Update Site URL to: `https://www.innerfire.fit`
4. Save

## 🎯 How Deployments Work Now

### Production (main branch)
```bash
git push origin main
```
**Deploys to:** https://www.innerfire.fit ✨

### Staging (develop branch)
```bash
git push origin develop
```
**Deploys to:** https://inner-fire-git-develop-*.vercel.app

### Preview (PR branches)
**Deploys to:** https://inner-fire-git-[branch]-*.vercel.app

## 📚 Detailed Documentation

For complete instructions, troubleshooting, and technical details, see:
- **CUSTOM_DOMAIN_SETUP.md** - Complete DNS configuration guide
- **DEPLOYMENT_SUMMARY.md** - Full deployment overview

## ❓ Common Questions

**Q: Do I need to change any code?**  
A: No! Everything is configured in Vercel. Your code doesn't need any changes.

**Q: Will the old inner-fire.vercel.app domain still work?**  
A: Yes! It will continue to work as a fallback domain.

**Q: What if I don't configure DNS?**  
A: Production will still deploy, but only accessible via inner-fire.vercel.app, not innerfire.fit.

**Q: Does this affect staging or preview deployments?**  
A: No! Only production uses the custom domain. Staging and previews use Vercel preview URLs.

## 🆘 Need Help?

If you encounter issues:
1. Check **CUSTOM_DOMAIN_SETUP.md** troubleshooting section
2. Verify DNS records at https://dnschecker.org
3. Contact your domain registrar support
4. Check Vercel status: https://vercel-status.com

---

**Next Steps:**
1. ✅ Add DNS records (see Step 1 above)
2. ⏳ Wait for propagation
3. ✅ Update Supabase URLs
4. 🎉 Your site is live at innerfire.fit!
