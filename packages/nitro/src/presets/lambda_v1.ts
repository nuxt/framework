
import { NitroPreset } from '../context'

// eslint-disable-next-line camelcase
export const lambda_v1: NitroPreset = {
  entry: '{{ _internal.runtimeDir }}/entries/lambda_v1',
  externals: true
}
