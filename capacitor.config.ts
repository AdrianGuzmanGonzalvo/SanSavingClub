import type { CapacitorConfig } from "@capacitor/cli";
import { NATIVE_APP_UA_MARKER } from "./src/lib/admob";

const config: CapacitorConfig = {
  appId: "com.sansavingclub.app",
  appName: "SanSavingClub",
  webDir: "www",
  appendUserAgent: NATIVE_APP_UA_MARKER,
  server: {
    url: "https://www.sansavingclub.com",
    cleartext: false,
  },
};

export default config;
