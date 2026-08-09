import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.sansavingclub.app",
  appName: "SanSavingClub",
  webDir: "www",
  server: {
    url: "https://www.sansavingclub.com",
    cleartext: false,
  },
};

export default config;
