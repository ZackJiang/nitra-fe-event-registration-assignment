import { createI18n } from 'vue-i18n'
import enUS from './locales/en-US.js'
import zhTW from './locales/zh-TW.js'

export const DEFAULT_LOCALE = 'en-US'
export const SUPPORTED_LOCALES = Object.freeze(['en-US', 'zh-TW'])

/** Resolve browser language preferences to a supported application locale. */
export function resolveLocale(languages = []) {
  const preferredLanguages = Array.isArray(languages) ? languages : []

  if (preferredLanguages.some((language) => /^zh(?:-|$)/i.test(language))) return 'zh-TW'
  if (preferredLanguages.some((language) => /^en(?:-|$)/i.test(language))) return 'en-US'
  return DEFAULT_LOCALE
}

export function getBrowserLocale() {
  return typeof navigator === 'undefined'
    ? DEFAULT_LOCALE
    : resolveLocale(navigator.languages)
}

export const i18n = createI18n({
  legacy: false,
  locale: getBrowserLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: { 'en-US': enUS, 'zh-TW': zhTW },
})
