import { join } from 'path'
import fse from 'fs-extra'

export const wpfs = {
  ...fse,
  join
}
