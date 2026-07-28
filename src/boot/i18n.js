import enUS from 'quasar/lang/en-US.js'
import zhTW from 'quasar/lang/zh-TW.js'
import { Quasar } from 'quasar'
import { i18n } from '../i18n/index.js'

const quasarLocales = { 'en-US': enUS, 'zh-TW': zhTW }

export default ({ app }) => {
  app.use(i18n)

  const locale = i18n.global.locale.value
  Quasar.lang.set(quasarLocales[locale] ?? enUS)
  document.documentElement.lang = locale
}

export { i18n }
