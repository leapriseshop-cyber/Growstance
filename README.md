# Growstance — Premium Strategic Digital Growth Platform

Growstance is an elite, high-performance digital presence platform built for modern founders, premium brands, and luxury services. The platform combines a gorgeous, high-contrast dark aesthetic with interactive 3D geodesic constellations, dynamic vector mouse trails, and biophilic responsive animations to stimulate cognitive interest and visually reward user attention.

Live Demo local preview and repository code are fully optimized for **zero layout shifts (CLS)**, high-efficiency caching, and seamless cross-platform rendering.

---

## 🌟 Key Features & Design Systems

### 1. Elite Visual Layout
* **Asymmetrical Desktop Grid**: An elegant side-by-side design (`grid-template-columns: 1.15fr 0.85fr`) that handles text copy on the left and 3D product mockups on the right to match the F-pattern reading flow of top-tier websites.
* **Floating Holographic Graphic**: The flagship growth ecosystem visual showcases glowing emerald green analytical charts, upward-trending growth graphs, and bioluminescent edges. It is a **fully transparent PNG** styled with a radial-gradient boundary mask, ensuring no hard box borders.

### 2. High-Tech Creative Motion Graphics
* **Interactive 3D Constellation Backdrop**: A mathematically structured Fibonnaci geodesic constellation grid floating directly behind and beside the main headline. It shifts projection perspective in sync with mouse movements.
* **Biophilic Motion Excitation Loop**: Constellation spin velocity and geodesic breathing rates dynamically scale up in proportion to cursor velocity, decaying back to a luxurious, slow resting pace once the cursor stops.
* **Constellation Vector Mouse Trails**: Moves on the viewport draw floating particle nodes that drift organically. They dynamically knit thin networking lines connecting back to the pointer whenever they are close, providing a premium digital neural-network response.
* **Smooth HUD Tracking**: concentric indicator rings glide behind the cursor using heavy-fluid LERP damping, adding dynamic momentum and luxury physical weight.

### 3. Smart Dual-Mode Contact Form
* **Node.js Production Server Mode**: Saves client contact form details to a local structured NDJSON database and automatically pushes email notifications via Gmail SMTP with robust rate-limiting and HTML email templates.
* **Static Hosting Fallback Mode (GitHub Pages)**: If hosted as a static repository (e.g. on GitHub Pages where no server-side Node.js environment is available), the script detects the missing API route and smoothly redirects the inquiry to a pre-filled client-side `mailto:` client, ensuring **100% functional reliability in all hosting environments**.

---

## 📂 Project Directory Structure

```text
├── 
│   └── images/
│       ├── dashboard-graphic-transparent.png  # Transparent 16:9 growth dashboard (Flagship visual)
│       ├── growstance-favicon.png             # Site-wide high-res brand favicon
│       ├── logo-icon.jpg                      # Brand core identity element
│       └── logo-light.png                     # Elegant primary text header logo
├── 
│   ├── templates.html                         # Unified blog template
│   ├── posts.json                             # Structural metadata of blog postings
│   └── *.html                                 # Clean-design, seo-optimized blog posts
├── 
│   └── submissions-legacy.txt                 # Contact submission logging
├── 
│   └── growstance-seo-growth-strategy.md      # Strategic keyword maps and positioning details
├── 
│   └── *.html                                 # Specialized, search-intent optimized service landing pages
├── index.html                                 # High-contrast core page and structured SEO markup
├── script.js                                  # 3D fiber logic, dynamic particle system, and form handlers
├── style.css                                  # Curated dark-luxury typography, custom layout grid, and masks
├── server.js                                  # High-efficiency Express-style Node.js server
├── package.json                               # Standard Node dependency manifest
├── .gitignore                                 # Production-grade git exclusion rules
└── robots.txt / sitemap.xml                   # Web crawling and SEO index configurations
```

---

## 🚀 How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
The console will boot the server:
```text
Growstance running at http://localhost:3000
Email sending is disabled. Set EMAIL_USER, EMAIL_PASS, and EMAIL_TO to enable SMTP.
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the live site.

### 3. Configuring SMTP Mail Delivery (Optional)
To enable real-time email notifications for form submissions, set the following environment variables on your hosting platform or a local `.env` file:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=recipient-email@gmail.com
```

---

## ☁️ Deployment Guides

### 1. Static Deployments (GitHub Pages, Netlify, Vercel Static)
Because of the **Smart Dual-Mode Contact Form**, you can drag-and-drop or push this folder directly to static hosts.
* **GitHub Pages**: Go to your repository settings -> **Pages** -> Select the branch (e.g. `main`) and root folder `/` -> Save. The platform will serve the site at your custom URL. Form submissions will smoothly open mail clients automatically!

### 2. Backend Deployments (Render, Railway, Heroku, Vercel Serverless)
To activate the full backend server and automatic SMTP mailing:
* Connect your GitHub repo to a cloud provider like Render or Railway.
* Set the start command to: `npm start`
* Add your `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_TO` environment variables in the dashboard.
* The system will handle all server-side routing, NDJSON logging, rate-limiting, and SMTP notifications natively.
