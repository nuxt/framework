import { red, yellow } from 'colorette'

export const error = (...args) => console.error(red('[error]'), ...args)

export const warn = (...args) => console.warn(yellow('[warn]'), ...args)
