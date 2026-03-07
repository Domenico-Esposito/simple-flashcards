import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import it from './locales/it.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';

const resources = {
  it: { translation: it },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
};

const supportedLanguages = Object.keys(resources);

// Detect the best matching language from device locales
function getDeviceLanguage(): string {
  const locales = getLocales();
  for (const locale of locales) {
    const lang = locale.languageCode;
    if (lang && supportedLanguages.includes(lang)) {
      return lang;
    }
  }
  return 'it';
}

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'it',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
