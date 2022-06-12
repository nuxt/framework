export const overrideEnv = (targetEnv: string) => {
  const currentEnv = process.env.NODE_ENV
  if (currentEnv && currentEnv !== targetEnv) {
    console.warn(`Changing \`NODE_ENV\` from \`${currentEnv}\` to \`${targetEnv}\`.`)
  }

  process.env.NODE_ENV = targetEnv
}
