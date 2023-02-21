import defaultConfig from './prettierrc-default.json' assert { type: 'json' }

import airbnb from './prettierrc-airbnb.json' assert { type: 'json' }
import standard from './prettierrc-standard.json' assert { type: 'json' }

export {
  defaultConfig as default,

  airbnb,
  standard,
}
