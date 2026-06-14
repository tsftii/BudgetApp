# Origami Wallet

Origami Wallet (formerly BudgetApp) is a fast, offline-first, Progressive Web Application (PWA) built for personal finance management. It features a unique, playful UI inspired by Paper Mario and modern design systems, offering a robust set of tools without relying on a cloud backend. 

All your data stays on your device!

## Features

- **Offline-First Architecture**: Built as a PWA, it works seamlessly without an internet connection. All data is securely stored locally on your device using IndexedDB.
- **Comprehensive Tracking**: Log incomes, expenses, and inter-account transfers easily.
- **Customization**: Create your own categories and accounts. Assign custom colors and icons (using Phosphor Icons) to make your finances visually identifiable.
- **Rich Analytics**: Interactive charts (powered by Chart.js) provide a visual breakdown of your spending habits and a 30-day cashflow timeline.
- **Investment Calculators**: Built-in tools tailored for the Argentine market (and adaptable to others), including:
  - Traditional Fixed-Term Deposits (Plazo Fijo)
  - Inflation-Adjusted Deposits (Plazo Fijo UVA)
  - Corporate Bonds / ONs (Obligaciones Negociables) yield calculator
- **Receipt Scanner**: Upload a photo of a receipt, and the app uses local OCR (Tesseract.js) to parse the date, total amount, description, and intelligently suggest a category. (No AI or external APIs are used).
- **Secure Backups**: Since data is local, the app provides an **AES-GCM Encrypted Backup** system. Export your entire database as a secure `.bgt` file.
- **Beautiful UI**: A highly polished, responsive interface with both Light and Dark modes, fluid animations, and a distinct aesthetic.

## Tech Stack

- **Core**: HTML5, Vanilla CSS, TypeScript
- **Build Tool**: [Vite](https://vitejs.dev/)
- **PWA Integration**: `vite-plugin-pwa`
- **Database**: IndexedDB (via `idb` wrapper)
- **Charts**: [Chart.js](https://www.chartjs.org/)
- **Icons**: [Phosphor Icons](https://phosphoricons.com/)
- **Native Wrap**: Capacitor JS configuration is included to compile this directly to an Android APK. (Note: iOS is not supported).

## Getting Started

To run this project locally, fork or clone the repository, and follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/origami-wallet.git
   cd origami-wallet
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Run the Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

4. **Build for Production**
   \`\`\`bash
   npm run build
   \`\`\`
   This will generate a `dist` folder containing the compiled app and the PWA Service Worker.

## Installing on your Phone

Since Origami Wallet is a PWA, you can host the `dist` folder on any static hosting provider (like GitHub Pages, Vercel, or Netlify). Once hosted:
1. Open the URL in Chrome (Android).
2. Tap the share/menu button and select **"Add to Home Screen"**.
3. The app will install and behave like a native app!

## Contributing

Contributions, issues, and feature requests are welcome! 
If you want to tweak the UI, check out `src/style.css` which heavily utilizes CSS variables for easy theming. To add new features, `src/main.ts` acts as the primary router and controller.
