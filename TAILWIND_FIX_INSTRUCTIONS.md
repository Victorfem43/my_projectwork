# Fix Tailwind CSS Not Working

## Quick Fix Steps:

1. **Stop the server** (Press `Ctrl+C` in the terminal where the server is running)

2. **Clear Next.js cache:**
   ```powershell
   cd frontend
   Remove-Item -Recurse -Force .next
   ```

   Or use the batch file:
   ```powershell
   .\scripts\clear-cache.bat
   ```

3. **Restart the server:**
   ```powershell
   npm run dev
   ```

4. **Hard refresh your browser:**
   - Press `Ctrl+Shift+R` (Windows/Linux)
   - Or `Cmd+Shift+R` (Mac)
   - This clears browser cache and forces a reload

## If Still Not Working:

1. **Check if Tailwind is installed:**
   ```powershell
   cd frontend
   npm list tailwindcss
   ```

2. **Verify Tailwind config:**
   - Check `frontend/tailwind.config.js` exists
   - Check `frontend/postcss.config.js` exists
   - Check `frontend/app/globals.css` has `@tailwind` directives

3. **Check browser console:**
   - Open DevTools (F12)
   - Check for CSS loading errors
   - Verify `globals.css` is being loaded

4. **Force rebuild:**
   ```powershell
   cd frontend
   Remove-Item -Recurse -Force .next
   Remove-Item -Recurse -Force node_modules\.cache
   npm run dev
   ```

## Common Issues:

- **Server running**: Make sure to stop the server before clearing cache
- **Browser cache**: Hard refresh the browser
- **File locks**: Close IDE/terminal and try again
- **Missing dependencies**: Run `npm install` in the frontend directory
