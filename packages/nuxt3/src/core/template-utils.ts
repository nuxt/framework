import { Schema } from 'untyped'

export const deleteSchemaDefaults = (schema: Schema) => {
  if (schema.type === 'object') {
    for (const key of Object.keys(schema.properties)) {
      delete schema.properties[key].default
      deleteSchemaDefaults(schema.properties[key])
    }
  }

  return schema
}

export const withLastLevelDescription = (schema: Schema, description: string) => {
  if (schema.type === 'object') {
    for (const key of Object.keys(schema.properties)) {
      withLastLevelDescription(schema.properties[key], description)
    }
  } else {
    schema.description = description
  }

  return schema
}

export const normalizeUntypedOutput = (str: string) => {
  return '  ' + str.replace(/^export\s/, '').replace(/\n/g, '\n  ')
}
