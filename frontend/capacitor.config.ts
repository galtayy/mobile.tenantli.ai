import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.tenantli.mobile',
  appName: 'Tenantli',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    hostname: 'mobile.tenantli.ai',
    url: 'https://mobile.tenantli.ai'
  }
};

export default config;
