export const overrideEnv = (targetEnv: string) => {
  const currentEnv = process.env.NODE_ENV
  if (currentEnv && currentEnv !== targetEnv) {
    console.info(`Changing NODE_ENV from \`${currentEnv}\` to \`${targetEnv}\`.`)
  }

  process.env.NODE_ENV = targetEnv
}
