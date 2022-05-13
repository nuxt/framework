type A = string
export default defineComponent({
async setup() {
  const { data } = await useAsyncData<A>(() => Promise.resolve({ foo: 'bar' }))

return () => <div>{'value:' + JSON.stringify(data.value)}</div>
}
})
