import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wortschatz.mm',
  appName: 'Wortschatz MM',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
