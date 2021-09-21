import { join } from 'path'
import fsExtra from 'fs-extra'

export const wpfs = {
  ...fsExtra,
  join
}
