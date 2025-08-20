// src/polyfills/xhr-sanitize.ts
// Очень аккуратный патч: НИЧЕГО не переставляем, просто приводим типы.
// Ставь импорт самым ранним в App.tsx (после gesture-handler).

(() => {
  try {
    const send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (...args: any[]) {
      // Hermes / RN 0.79: строго ожидают типы
      // timeout (number)
      if (typeof (this as any).timeout !== 'number' || Number.isNaN((this as any).timeout)) {
        (this as any).timeout = 0;
      }
      // withCredentials (boolean)
      if (typeof (this as any).withCredentials !== 'boolean') {
        (this as any).withCredentials = false;
      }
      // responseType (string)
      if (typeof (this as any).responseType !== 'string') {
        (this as any).responseType = '';
      }
      return send.apply(this, args as any);
    };
  } catch {}
})();
