import { createI18n } from 'vue-i18n'
import enUS from './locales/en-US.json'

type MessageSchema = typeof enUS

export const i18n = createI18n<[MessageSchema], 'en-US'>({
  locale: 'en-US',
  messages: {
    'en-US': enUS
  }
})

export type I18nInstance = typeof i18n
