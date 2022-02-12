import { Schema } from 'untyped'

export const deleteSchemaDefaults = (schema: Schema) => {
  if (schema.type === 'object') {
    for (const key of Object.keys(schema.properties)) {
      delete schema.properties[key].default
    }

    if (schema.properties) {
      for (const key of Object.keys(schema.properties)) {
        deleteSchemaDefaults(schema.properties[key])
      }
    }
  }

  return schema
}

export const withDescription = (schema: Schema, description: string) => {
  if (schema.type === 'object') {
    for (const key of Object.keys(schema.properties)) {
      schema.properties[key].description = description
    }
  }

  return schema
}

export const normalizeUntypedOutput = (str: string) => {
  return '  ' + str.replace(/^export\s/, '').replace(/\n/g, '\n  ')
}
