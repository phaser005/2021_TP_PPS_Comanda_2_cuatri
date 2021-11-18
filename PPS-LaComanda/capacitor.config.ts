import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'PPS-LaComanda',
  webDir: 'www',
  bundledWebRuntime: false,
  // cordova: {
  //   preferences: {
  //     ScrollEnabled: 'false',
  //     BackupWebStorage: 'none',
  //     SplashMaintainAspectRatio: 'true',
  //     FadeSplashScreenDuration: '0',
  //     SplashShowOnlyFirstTime: 'false',
  //     SplashScreen: 'screen',
  //     SplashScreenDelay: '8000',
  //     ShowSplashScreenSpinner: 'false'
  //   }
  // }
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#81579E",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
  },
};

export default config;
