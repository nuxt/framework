export const overrideEnv = (targetEnv: string) => {
  const currentEnv = process.env.NODE_ENV
  if (currentEnv && currentEnv !== targetEnv) {
    console.warn(`Defined \`NODE_ENV\` will be replaced from \`${currentEnv}\` to \`${targetEnv}\`, to avoid unintended behaviors from libraries.`)
  }

  process.env.NODE_ENV = targetEnv
}
