export default eventHandler(() => {
  return new Array(10).fill(0).map(() => Math.round(Math.random() * 10000))
})
