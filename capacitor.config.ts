import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d04e44809f984a82b952fe3963c1011e',
  appName: 'qr-attend-lite',
  webDir: 'dist',
  server: {
    url: 'https://d04e4480-9f98-4a82-b952-fe3963c1011e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
