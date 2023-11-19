/**
 *
 * @param obj object that needs to be validated
 * @param schema template for validation
 * @returns whether missed some keys
 */
export function includeAllKeys(obj: Object, schema: Object) {
  for (let key in schema) {
    if (!obj.hasOwnProperty(key)) {
      console.log(`key '${key}' lost`)
      return false
    }
    if (schema[key] !== null) {
      if (typeof schema[key] === 'string') {
        if (typeof obj[key] !== schema[key]) {
          console.error(`the type of ${key} is incorrect`)
          return false
        }
      } else if (typeof schema[key] === 'object') {
        if (!includeAllKeys(obj[key], schema[key])) {
          return false
        }
      }
    }
  }
  return true
}

/**
 *
 * @param obj object that needs to be validated
 * @param schema template for validation
 * @returns whether include extra keys
 */
export function excludeKeys(obj: Object, schema: Object) {
  for (let key in obj) {
    if (!schema.hasOwnProperty(key)) {
      console.error(`unexpected key: ${key}`)
      return false
    }
    if (schema[key] !== null && typeof schema[key] === 'object') {
      if (!excludeKeys(obj[key], schema[key])) {
        return false
      }
    }
  }
  return true
}
