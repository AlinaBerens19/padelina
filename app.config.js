// app.config.js
// Динамический конфиг Expo: берём базу из app.json и подменяем пути к Firebase-файлам через EAS file env.
// iOS: GOOGLE_SERVICE_INFO_PLIST (type: file)
// Android (опционально): GOOGLE_SERVICES_JSON (type: file)
// Дополнительно: добавляем useFrameworks: 'static' для iOS (RNFirebase) и пробрасываем GOOGLE_PLACES_KEY.

const base = require('./app.json');
const expo = base.expo || base; // на случай, если структура изменится

function fixIosUrlSchemes(ios) {
  const reversedFromEnv = process.env.REVERSED_CLIENT_ID; // можно задать в EAS env, если нужно
  const infoPlist = { ...(ios.infoPlist || {}) };

  // Если в URL-схемах остался плейсхолдер — заменяем/добавляем реальное значение
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
    // Жёстко выставляем схему из env
    infoPlist.CFBundleURLTypes = [{ CFBundleURLSchemes: [reversedFromEnv] }];
  } else if (hasPlaceholder || !alreadyHasReversed) {
    // Если есть плейсхолдер или схемы нет вовсе — оставляем как есть (плагин google-signin подтянет из plist),
    // либо можно руками заменить тут — когда узнаешь реальный REVERSED_CLIENT_ID.
    // infoPlist.CFBundleURLTypes = [{ CFBundleURLSchemes: ['com.googleusercontent.apps.XYZ...'] }];
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

  add('@react-native-firebase/app'); // RNFirebase auto-config
  // при желании можно добавить и другие пакеты RNFirebase, но достаточно app
  add(['expo-build-properties', { ios: { useFrameworks: 'static' } }]); // нужно для RNFirebase на iOS

  return plugins;
}

module.exports = () => {
  // iOS: путь к plist берём из EAS file env, иначе используем локальный (если задан в app.json)
  const ios = {
    ...(expo.ios || {}),
    googleServicesFile:
      process.env.GOOGLE_SERVICE_INFO_PLIST ||
      (expo.ios ? expo.ios.googleServicesFile : undefined),
  };
  const iosFixed = fixIosUrlSchemes(ios);

  // Android: аналогично можно прокидывать google-services.json через EAS file env (опционально)
  const android = {
    ...(expo.android || {}),
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ||
      (expo.android ? expo.android.googleServicesFile : undefined),
  };

  return {
    // возвращаем “внутренность” expo-конфига (как в app.json внутри "expo")
    ...expo,
    ios: iosFixed,
    android,
    extra: {
      ...(expo.extra || {}),
      GOOGLE_PLACES_KEY:
        process.env.GOOGLE_PLACES_KEY ??
        (expo.extra && expo.extra.GOOGLE_PLACES_KEY),
      // при необходимости пробрасывай сюда и другие переменные
      // e.g. API_BASE_URL: process.env.API_BASE_URL,
    },
    plugins: withPlugins(expo.plugins || []),
  };
};
