import { cookies } from 'next/headers';
import en from './dictionaries/en.json';
import bn from './dictionaries/bn.json';
import { Locale } from './client';

const dictionaries = { en, bn };

export async function getDictionary() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'en';
  return dictionaries[locale] || en;
}

export async function getLocale() {
  const cookieStore = await cookies();
  return (cookieStore.get('NEXT_LOCALE')?.value as Locale) || 'en';
}
