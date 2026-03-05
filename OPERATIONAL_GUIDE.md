# Notary Portal — Operational Guide (Working Notes)

## 1) Purpose (Why we built this)
- Goal:
- What problem it solves:

## 2) Project folder map (What lives where)notary-portal/ = the whole project folder (the “box” that holds everything)

- notary-portal/ = the whole project folder (the “box” that holds everything)
- app/ = your website pages + API routes (the parts you edit)
- app/page.tsx = Home page
- app/documents/page.tsx = Documents page (upload/list/download)
- app/api/upload/route.ts = Upload API
- app/api/documents/list/route.ts = List files API
- app/api/documents/download/route.ts = Download API
- .env.local = secret settings (keys, bucket name, region)
- .next/ = temporary Next.js files created while running (do not edit)
### How to tell a folder vs a file (easy)
- Folder = has a small arrow next to it in VS Code (you can expand it)
- File = no arrow, and usually ends with letters like:
  - .tsx (page files)
  - .ts (route files)
  - .css (style files)
  - .md (notes files like this guide)


## 3) Start/Stop checklist (Daily)
### Start the website
1) Open Terminal
2) Go to the project folder:
   - cd ~/Documents/notary-portal
3) Start the server:
   - npm run dev
4) Open the website:
   - http://localhost:3000

### Stop the website
- In the Terminal window running the server:
  - press Control + C

## 4) Verify it is working (Quick tests)
- Home page loads
- Documents page loads (/documents)
- Upload works (choose PDF → Upload → shows success)
- List shows uploaded files
- Download button opens the PDF

## 5) Common issues + fixes
### “I’m in the wrong folder”
- Run: pwd
- It should say: /Users/hudlinbe/Documents/notary-portal

-Remove duplicate header:
-Problem: Page showed two headers (plain header + styled header).
-Cause: app/layout.tsx had a header/nav AND app/page.tsx also had a header.
-Fix: Replace app/layout.tsx with a “plain wrapper” layout (no header), so only the page header shows.
### Duplicate header fix (Home page)
Symptom: The header/nav showed twice at the top of the Home page.
Cause: A header was being rendered in BOTH places:
- app/layout.tsx (global header)
- app/page.tsx (page header)
Fix: Keep the header only in app/layout.tsx.
Make sure app/page.tsx contains page content only (hero/cards/sections), not a second header.
Quick check:
- Open app/page.tsx
- Search for "<header"
- There should NOT be a second full header that matches the layout header.

### “Missing script: dev” or “Could not read package.json”
- You are not inside the notary-portal folder.
- Fix: cd ~/Documents/notary-portal

### “Download button does nothing”
- Check server logs in Terminal for /api/documents/download
- Verify the download route exists: app/api/documents/download/route.ts

## 6) Changes log (What we changed and why)
- Date:
- File changed:
- What we changed:
- Why:
- Result:

## 7) Cleanup
-“Created reusable header component: app/components/TopBar.tsx”
-"Documents page now uses <TopBar /> to avoid duplicate headers and keep pages consistent.”
-Added the Home-style sticky top bar to app/documents/page.tsx so Documents matches the site layout.