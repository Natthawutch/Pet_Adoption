import "dotenv/config";

export default {
  expo: {
    name: "pet-adoption-app",
    slug: "pet-adoption-app",
    version: "1.0.0",
    scheme: "petadoption",
    android: {
      usesCleartextTraffic: true, // จำเป็นสำหรับ Android
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "petadoption",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    ios: {
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true, // จำเป็นสำหรับ iOS
        },
      },
      bundleIdentifier: "com.cmru.petadoption",
      scheme: "petadoption",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    extra: {
      clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY,
      supabaseUrl: "https://stsordxxnzlxrpiwdbpx.supabase.co",
      supabaseAnonKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0c29yZHh4bnpseHJwaXdkYnB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MjQ2OTgsImV4cCI6MjA2MzQwMDY5OH0.hAeg7ilPoR_P6SifoL908YMRrfoqCFwPeKL6lWOA1NA",
    },
  },
};
