// path: src/polyfills/networking.ts
import { NativeModules } from 'react-native';

// В разных версиях модуль может называться так или так:
const nm: any =
  (NativeModules as any).Networking ||
  (NativeModules as any).RCTNetworking;

if (nm && typeof nm.sendRequest === 'function') {
  const original = nm.sendRequest.bind(nm);

  nm.sendRequest = (...args: any[]) => {
    // Ожидаем сигнатуру (устойчиво между версиями RN/платформами):
    // [0] method: string
    // [1] url: string
    // [2] headers: ReadableArray
    // [3] data: ReadableMap
    // [4] responseType: string
    // [5] useIncrementalUpdates: boolean
    // [6] timeout: number   <-- в некоторых билд-конфигурациях тут ждут boolean
    // [7] withCredentials: boolean  <-- а тут число
    // (+ иногда [8] useNativeXHR: boolean)

    // Гарантируем [5] boolean
    if (typeof args[5] !== 'boolean') args[5] = false;

    const a6 = args[6];
    const a7 = args[7];

    const a6IsBool = typeof a6 === 'boolean';
    const a6IsNum  = typeof a6 === 'number' && !Number.isNaN(a6);
    const a7IsBool = typeof a7 === 'boolean';
    const a7IsNum  = typeof a7 === 'number' && !Number.isNaN(a7);

    // Кейс 1: порядок «bool, number» — всё ок
    if (a6IsBool && a7IsNum) {
      // ничего
    }
    // Кейс 2: порядок «number, bool» — ПЕРЕСТАВИМ местами
    else if (a6IsNum && a7IsBool) {
      args[6] = a7; // boolean
      args[7] = a6; // number
    }
    // Кейс 3: один/оба отсутстуют — подставим дефолты
    else {
      // Если на месте 6 не boolean — поставим false
      if (!a6IsBool) args[6] = false;
      // Если на месте 7 не number — поставим 0 (без таймаута)
      if (!a7IsNum) args[7] = 0;
    }

    // Гарантируем [8] — некоторые версии ждут boolean
    if (args.length >= 9 && typeof args[8] !== 'boolean') {
      args[8] = false;
    }

    return original(...args);
  };
}
