/**
 * you need to import the some interfaces
 */
import { DefineLocaleMessage } from 'vue-i18n'

declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage {
    hello: string
  }
}
