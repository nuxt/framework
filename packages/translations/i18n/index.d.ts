export interface Translation {
  cli: {
    loading: string
    reloading: string
    ready: (ms: number) => string
    loadError: string
  }
}
