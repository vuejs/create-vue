/**
 *
 * @param obj object that needs to be validated
 * @param schema template for validation
 * @returns whether missed some keys
 */
export function isValid(obj: Object, schema: Object) {
  for (let key in schema) {
    if (!obj.hasOwnProperty(key)) {
      return false
    }
    if (schema[key] !== null) {
      if (typeof schema[key] === 'string') {
        if (typeof obj[key] !== schema[key]) {
          return false
        }
      } else if (typeof schema[key] === 'object') {
        if (!isValid(obj[key], schema[key])) {
          return false
        }
      }
    }
  }
  return true
}
