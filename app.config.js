// app.config.js
// Динамический конфиг Expo. Берём базу из app.json и ЖЁСТКО подставляем пути
// к Firebase-файлам из EAS file env. Для локальной интроспекции даём мягкий fallback.
// iOS: GOOGLE_SERVICE_INFO_PLIST (type: file)
// Android: GOOGLE_SERVICES_JSON (type: file)

const base = require('./app.json');
const expoCfg = base.expo || base;

// ⬇️ helper: если env — плейсхолдер @NAME или пусто, используем локальный fallback.
// На билдере EAS сюда придёт абсолютный путь, и fallback не понадобится.
function resolveFileEnv(envKey, localFallback) {
  const v = process.env[envKey];
  if (!v || v.startsWith('@')) return localFallback;
  return v;
}

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
    // google-signin подтянет схему из GoogleService-Info.plist
  }

  return { ...ios, infoPlist };
}

// Добавляем плагины без дублей
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

  // Image Picker: пропишем описания для Info.plist
  add([
    'expo-image-picker',
    {
      photosPermission: 'We need access to your photos to set your avatar',
      cameraPermission: 'We need camera access to take your avatar photo',
    },
  ]);

  return plugins;
}

module.exports = () => {
  const ios = {
    ...(expoCfg.ios || {}),
    // ⬇️ используем env, но если локально приходит "@NAME", берём локальный файл
    googleServicesFile: resolveFileEnv(
      'GOOGLE_SERVICE_INFO_PLIST',
      './GoogleService-Info.plist'
    ),
    bundleIdentifier:
      process.env.IOS_BUNDLE_ID ||
      (expoCfg.ios && expoCfg.ios.bundleIdentifier) ||
      'com.padelina.app',
  };
  const iosFixed = fixIosUrlSchemes(ios);

  const android = {
    ...(expoCfg.android || {}),
    googleServicesFile: resolveFileEnv(
      'GOOGLE_SERVICES_JSON',
      './google-services.json'
    ),
    package:
      process.env.ANDROID_APPLICATION_ID ||
      (expoCfg.android && expoCfg.android.package) ||
      'com.padelina.android',
  };

  return {
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
