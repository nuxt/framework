
import { NitroPreset } from '../context'

export const lambda: NitroPreset = {
  entry: '{{ _internal.runtimeDir }}/entries/lambda_v2',
  externals: true
}
