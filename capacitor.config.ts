import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tu.app',
  appName: 'Traiviu',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      backgroundColor: '#2c2c2c',
    },
  },
};

export default config;
