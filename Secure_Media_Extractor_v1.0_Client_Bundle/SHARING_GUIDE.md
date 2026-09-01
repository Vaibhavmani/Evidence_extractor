# Sharing & Deployment Guide for Secure Excel Media Extractor

Because this application is built with a **100% Client-Side Local Architecture**, it requires **zero backend servers, zero database setups, and zero remote cloud APIs**. 

Here are the **3 best ways** to make this tool accessible to anyone on your team, clients, or external investigators:

---

## Method 1: Host as a Free Static Web App (Recommended — Zero Install for Anyone)

Since all Excel processing runs entirely in the user's browser, you can host the application on any static web host. **Anyone with the link can use it immediately on Windows, Mac, Linux, iPad, or mobile with zero installation.**

### Option A: Free Hosting on GitHub Pages
1. Push this repository to GitHub.
2. In your GitHub repo settings, go to **Pages** -> Select **GitHub Actions** or `main` branch `/dist` folder.
3. Your tool will be live at `https://<your-username>.github.io/<repo-name>/`.

### Option B: Free Hosting on Vercel / Netlify / Cloudflare Pages
1. Import this project directory into [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build` | Output Directory: `dist`.
4. Your tool will be live instantly with a shareable URL (e.g. `https://excel-media-extractor.vercel.app`).

### Option C: Internal Company Server / Intranet
- Copy the contents of the `dist/` folder to any internal NGINX, Apache, or IIS web server inside your organization's network.

> 🔒 **Security Guarantee**: Hosting the web app online does NOT compromise privacy. When users visit the link and drop their Excel files, 100% of file parsing and image extraction happens locally on their device. Zero bytes leave their machine.

---

## Method 2: Share the Portable Offline Zip File (`Secure_Media_Extractor_v1.0_Portable.zip`)

For teams operating in secure, classified, or air-gapped environments without internet access:

1. Share the pre-packaged zip file: [`Secure_Media_Extractor_v1.0_Portable.zip`](file:///d:/evidences_crime%20diary/Secure_Media_Extractor_v1.0_Portable.zip) (approx. 117 KB).
2. The user unzips the folder onto their computer.
3. They double-click `start.bat` (Windows) or `./start.sh` (Mac/Linux).
4. The application launches automatically in their web browser without requiring any installation or cloud access!

---

## Method 3: Share in Your Local Network / Office Wi-Fi

If you are on the same local network / office Wi-Fi as your team members, you can host it from your machine for your network:

```bash
npm run dev -- --host
```

Vite will output a local network URL, such as `http://192.168.1.50:3000`. Anyone connected to the same office Wi-Fi can open that URL in their browser and use the tool immediately!
