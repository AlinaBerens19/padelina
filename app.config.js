// app.config.js
// Динамический конфиг Expo: Firebase files через EAS file env.
// iOS: GOOGLE_SERVICE_INFO_PLIST (type: file)
// Android: GOOGLE_SERVICES_JSON (type: file) — опционально
// Плагины: RNFirebase, expo-build-properties (iOS static frameworks), Google Sign-In, Apple Auth.

const base = require('./app.json');
const expoCfg = base.expo || base; // <= НЕ "expo", чтобы не ловить ReferenceError

function fixIosUrlSchemes(ios) {
  const reversedFromEnv = process.env.REVERSED_CLIENT_ID;
  const infoPlist = { ...(ios.infoPlist || {}) };

  const urlTypes = Array.isArray(infoPlist.CFBundleURLTypes)
    ? [...infoPlist.CFBundleURLTypes]
    : [];
  const schemes = urlTypes[0]?.CFBundleURLSchemes || [];

  const hasPlaceholder = schemes.some(
    (s) => typeof s === 'string' && s.includes('<REVERSED_CLIENT_ID>')
  );
  const alreadyHasReversed = schemes.some(
    (s) => typeof s === 'string' && s.startsWith('com.googleusercontent.apps.')
  );

  if (reversedFromEnv) {
    infoPlist.CFBundleURLTypes = [{ CFBundleURLSchemes: [reversedFromEnv] }];
  } else if (hasPlaceholder || !alreadyHasReversed) {
    // плагин @react-native-google-signin/google-signin подтянет схему из GoogleService-Info.plist
  }

  return { ...ios, infoPlist };
}

function withPlugins(existing = []) {
  const plugins = [...existing];
  const add = (p) => {
    const key = Array.isArray(p) ? p[0] : p;
    const exists = plugins.some((x) => (Array.isArray(x) ? x[0] : x) === key);
    if (!exists) plugins.push(p);
  };

  add('@react-native-firebase/app');
  add(['expo-build-properties', { ios: { useFrameworks: 'static' } }]);
  add('@react-native-google-signin/google-signin');
  add('expo-apple-authentication');

  return plugins;
}

module.exports = () => {
  const ios = {
    ...(expoCfg.ios || {}),
    googleServicesFile:
      process.env.GOOGLE_SERVICE_INFO_PLIST ||
      (expoCfg.ios ? expoCfg.ios.googleServicesFile : undefined),

    // bundle id можно задать через env
    bundleIdentifier:
      process.env.IOS_BUNDLE_ID ||
      (expoCfg.ios && expoCfg.ios.bundleIdentifier) ||
      'com.padelina.app',
  };
  const iosFixed = fixIosUrlSchemes(ios);

  const android = {
    ...(expoCfg.android || {}),
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ||
      (expoCfg.android ? expoCfg.android.googleServicesFile : undefined),

    // application id (Android package)
    package:
      process.env.ANDROID_APPLICATION_ID ||
      (expoCfg.android && expoCfg.android.package) ||
      'com.padelina.android',
  };

  return {
    // возвращаем базовые поля из app.json
    ...expoCfg,
    ios: { ...iosFixed, usesAppleSignIn: true },
    android,
    extra: {
      ...(expoCfg.extra || {}),
      GOOGLE_PLACES_KEY:
        process.env.GOOGLE_PLACES_KEY ??
        (expoCfg.extra && expoCfg.extra.GOOGLE_PLACES_KEY),

      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
        (expoCfg.extra && expoCfg.extra.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
    },
    plugins: withPlugins(expoCfg.plugins || []),
  };
};
