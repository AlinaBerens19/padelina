// src/services/places.ts
import axios from 'axios';

const KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY!; // сделай ключ публичным
export const places = axios.create({
  baseURL: 'https://maps.googleapis.com/maps/api/place',
  timeout: 0,                 // 👈 число, НЕ undefined
  withCredentials: false,     // 👈 boolean
});

export async function autocomplete(input: string) {
  const { data } = await places.get('/autocomplete/json', {
    params: { input, key: KEY, types: 'address', language: 'en' },
    responseType: 'json',     // 👈 строка, НЕ boolean
  });
  return data.predictions as Array<{ description: string; place_id: string }>;
}

export async function placeDetails(placeId: string) {
  const { data } = await places.get('/details/json', {
    params: { place_id: placeId, key: KEY, fields: 'geometry,formatted_address', language: 'en' },
    responseType: 'json',
  });
  const loc = data.result?.geometry?.location;
  return {
    label: data.result?.formatted_address ?? '',
    lat: loc?.lat ?? 0,
    lng: loc?.lng ?? 0,
  };
}
