# Badge Asset Upload Instructions

## 📦 What You'll Upload
352 PNG badge files from the Inner Fire badge package to Supabase Storage.

## 🎯 Upload Steps

### Step 1: Access Supabase Storage Dashboard
1. Go to: https://supabase.com/dashboard/project/kgwmplptoctmoaefnpfg/storage/buckets
2. You should see the `achievement-badges` bucket (just created)

### Step 2: Upload Badge Files
1. Click on the `achievement-badges` bucket
2. Click the "Upload" button
3. **Option A - Drag & Drop:**
   - Drag all 352 PNG files directly into the browser window
   - Wait for all uploads to complete (may take 5-15 minutes depending on your internet speed)

4. **Option B - Select Files:**
   - Click "Upload file" button
   - Select all 352 PNG files from your folder
   - Click "Open" to begin upload

### Step 3: Verify Upload
After upload completes, you should see:
- 352 files listed in the bucket
- All files ending in `.png`
- File names matching the pattern: `badge_[category]_[name]_[rarity].png`

### Step 4: Test a Badge URL
Pick any badge file name (e.g., `badge_milestones_first_steps_common.png`) and test it in your browser:

```
https://kgwmplptoctmoaefnpfg.supabase.co/storage/v1/object/public/achievement-badges/badge_milestones_first_steps_common.png
```

If the image loads, your upload was successful!

## ⚠️ Important Notes

### File Organization
- Upload all files to the **root** of the `achievement-badges` bucket
- Do NOT create subfolders
- The flat structure makes file management and URLs simpler

### File Naming
- Keep the exact file names from the badge package
- File names are case-sensitive
- Do not rename any files

### If Upload Fails
- Try uploading in batches (e.g., 100 files at a time)
- Check your internet connection
- Ensure you're logged into Supabase
- Clear browser cache and retry

### After Upload
Once all files are uploaded, let me know and I'll run the verification script to:
- Confirm all 346 achievements have corresponding badge files
- Identify the 6 extra badge files (352 - 346 = 6)
- Check for any naming mismatches
- Generate a validation report

## 🚀 Next Steps After Upload

1. **Tell me:** "Badges uploaded successfully"
2. **I'll do:** Run the verification script
3. **You'll review:** Validation report in the Admin Debug Panel
4. **We'll decide:** What to do with the 6 extra badge files
5. **Then proceed:** To Phase 2 - building the "What's Next?" recommendation engine

## 📊 Expected Upload Time

| Internet Speed | Estimated Time |
|---------------|----------------|
| 10 Mbps | 15-20 minutes |
| 50 Mbps | 5-10 minutes |
| 100+ Mbps | 2-5 minutes |

## 🆘 Need Help?

If you encounter any issues during upload:
1. Take a screenshot of the error
2. Note how many files uploaded successfully (if any)
3. Let me know and we'll troubleshoot together

---

**Ready to upload?** Once you've uploaded all the badge files, just reply with "Badges uploaded" and I'll verify everything!
