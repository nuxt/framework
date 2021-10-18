// Based on https://github.com/sindresorhus/p-debounce/blob/1be433d4f1922d4e8496edb7eac5afa960625cb0/index.js (MIT)

const pDebounce = (fn, wait, options = {}) => {
  if (!Number.isFinite(wait)) {
    throw new TypeError('Expected `wait` to be a finite number')
  }

  let leadingValue
  let timeout
  let resolveList = []

  return function (...arguments_) {
    return new Promise((resolve) => {
      // @ts-ignore
      const shouldCallNow = options.before && !timeout

      clearTimeout(timeout)

      timeout = setTimeout(() => {
        timeout = null

        // @ts-ignore
        const result = options.before ? leadingValue : fn.apply(this, arguments_)

        for (resolve of resolveList) {
          resolve(result)
        }

        resolveList = []
      }, wait)

      if (shouldCallNow) {
        leadingValue = fn.apply(this, arguments_)
        resolve(leadingValue)
      } else {
        resolveList.push(resolve)
      }
    })
  }
}

pDebounce.promise = (function_) => {
  let currentPromise

  return async function (...arguments_) {
    if (currentPromise) {
      return currentPromise
    }

    try {
      currentPromise = function_.apply(this, arguments_)
      return await currentPromise
    } finally {
      currentPromise = undefined
    }
  }
}

export default pDebounce
