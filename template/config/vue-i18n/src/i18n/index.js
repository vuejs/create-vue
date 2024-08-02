import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    // English Transtlations
  }
}

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages
})
