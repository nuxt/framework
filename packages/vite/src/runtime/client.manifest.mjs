const url = process.env.NUXT_VITE_SERVER_FETCH

const manifest = await $fetch(url + '/manifest')

console.log({ manifest })

export default manifest
