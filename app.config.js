// app.config.js
// Динамический конфиг Expo: берём базу из app.json и подменяем пути к Firebase-файлам через EAS file env.
// iOS: GOOGLE_SERVICE_INFO_PLIST (type: file)
// Android (опционально): GOOGLE_SERVICES_JSON (type: file)

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

  const hasPlaceholder = schemes.some(s => typeof s === 'string' && s.includes('<REVERSED_CLIENT_ID>'));
  const alreadyHasReversed = schemes.some(s => typeof s === 'string' && s.startsWith('com.googleusercontent.apps.'));

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

module.exports = () => {
  // iOS: путь к plist берём из EAS file env, иначе используем локальный
  const ios = {
    ...(expo.ios || {}),
    googleServicesFile:
      process.env.GOOGLE_SERVICE_INFO_PLIST || (expo.ios ? expo.ios.googleServicesFile : undefined),
  };

  // Подчистим CFBundleURLSchemes (убрать плейсхолдер или подставить из env)
  const iosFixed = fixIosUrlSchemes(ios);

  // Android: аналогично можно прокидывать google-services.json через EAS file env (опционально)
  const android = {
    ...(expo.android || {}),
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON || (expo.android ? expo.android.googleServicesFile : undefined),
  };

  return {
    // Возвращаем конфиг Expo (то, что обычно внутри "expo" в app.json)
    name: expo.name,
    slug: expo.slug,
    version: expo.version,
    orientation: expo.orientation,
    icon: expo.icon,
    userInterfaceStyle: expo.userInterfaceStyle,
    newArchEnabled: expo.newArchEnabled,
    jsEngine: expo.jsEngine,
    splash: expo.splash,
    ios: iosFixed,
    android,
    web: expo.web,
    extra: expo.extra,
    owner: expo.owner,
    plugins: expo.plugins,
  };
};
