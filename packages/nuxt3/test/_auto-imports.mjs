import jiti from 'jiti';
import { resolve } from 'pathe';

export const context = jiti(null, { interopDefault: true })(resolve(process.cwd(), 'packages/nuxt3/src/auto-imports/context'));
export const transform = jiti(null, { interopDefault: true })(resolve(process.cwd(), 'packages/nuxt3/src/auto-imports/transform'));
