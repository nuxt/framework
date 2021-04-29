// TODO: auto import every file from i18n directory
import { Translation } from './i18n'
import enGB from './i18n/en-GB'
import frFR from './i18n/fr-FR'

interface Translations {
  [key: string]: Translation
}
const langs: Translations = {
  'en-GB': enGB,
  'fr-FR': frFR
}

const locale = process.env.LOCALE || Intl.DateTimeFormat().resolvedOptions().locale

export default langs[locale] || langs['en-GB']
