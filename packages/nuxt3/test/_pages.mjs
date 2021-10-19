import jiti from 'jiti';
import { resolve } from 'pathe';

export const utils = jiti(null, { interopDefault: true })(resolve(process.cwd(), 'packages/nuxt3/src/pages/utils'));
