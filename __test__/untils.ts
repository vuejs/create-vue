export function isValid(obj: Object, schema: Object) {
  for (let key in schema) {
    if (!obj.hasOwnProperty(key)) {
      return false
    }
    if (typeof schema[key] === 'object' && schema[key] !== null) {
      if (!isValid(obj[key], schema[key])) {
        return false
      } else if (typeof obj[key] !== schema[key]) {
        return false
      }
    }
  }
  return true
}
