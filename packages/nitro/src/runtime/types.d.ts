declare global {
  namespace NodeJS {
    interface Global {
      __timing__: any
    }
  }
}

// export required to turn this into a module for TS augmentation purposes
export { }
