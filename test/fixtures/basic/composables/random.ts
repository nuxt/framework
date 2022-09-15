export function useRandomData (max: number = 100, name = 'default') {
  const data = useData('random:' + name)
  if (!data.value) {
    data.value = Math.floor(Math.random() * max)
  }
}
