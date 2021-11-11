export * from 'vue'

export const Vue2 = undefined
export const isVue2 = false
export const isVue3 = true

export const install = () => {}

export function set (target, key, val) {
  if (Array.isArray(target)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  target[key] = val
  return val
}

export function del (target, key) {
  if (Array.isArray(target)) {
    target.splice(key, 1)
    return
  }
  delete target[key]
}
