<template>
  <div ref="embed">
    Loading example...
  </div>
</template>

<script>
const loadSdk = () => import('@stackblitz/sdk' /* webpackChunkName: "stackblitz" */).then(m => m.default || m)
export default {
  props: {
    id: {
      type: String,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  async mounted () {
    const sdk = await loadSdk()
    sdk.embedProjectId(this.$refs.embed, this.id, this.options)
  }
}
</script>
