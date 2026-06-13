import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'BudgetApp',
        short_name: 'BudgetApp',
        description: 'Offline-first personal budgeting application',
        theme_color: '#121212',
        background_color: '#0d1117',
        display: 'standalone',
        icons: [
          {
            src: 'https://raw.githubusercontent.com/phosphor-icons/core/main/assets/regular/wallet.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'https://raw.githubusercontent.com/phosphor-icons/core/main/assets/regular/wallet.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ]
});
