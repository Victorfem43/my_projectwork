# 🧹 Clear Cache Instructions

## ⚠️ IMPORTANT: Files are currently locked

The cache files are locked because your server or IDE is still running.

## ✅ Solution - Follow These Steps:

### Step 1: Stop Everything
1. **Stop your server**: Press `Ctrl+C` in the terminal where `npm run dev` is running
2. **Close your IDE/Editor** (VS Code, Cursor, etc.) completely
3. **Close any terminal windows** that might be running Node

### Step 2: Clear Cache Manually

**Option A - Using File Explorer:**
1. Navigate to: `c:\Vickyexchange\frontend`
2. Delete the `.next` folder (if it exists)
3. If it says "files are in use", restart your computer

**Option B - Using PowerShell (after closing everything):**
```powershell
cd c:\Vickyexchange\frontend
Remove-Item -Recurse -Force .next
cd ..
```

**Option C - Using the batch file:**
1. Make sure server and IDE are closed
2. Double-click `CLEAR_CACHE_NOW.bat` in the project root

### Step 3: Restart
1. Open your IDE again
2. Run: `npm run dev`
3. Hard refresh browser: `Ctrl+Shift+R`

## 🔍 Verify Cache is Cleared

After clearing, check if `.next` folder is gone:
```powershell
cd c:\Vickyexchange\frontend
Test-Path .next
```

Should return `False` if cleared successfully.

## 💡 Why This Happens

Next.js locks cache files while the server is running. You MUST stop the server before clearing cache.
