import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { config } from '@vue/test-utils'
import { i18n } from '../../src/i18n/index.js'

installQuasarPlugin()
config.global.plugins = [i18n]
