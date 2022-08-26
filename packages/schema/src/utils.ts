//-- From Untyped
export type JSValue = string | number | bigint | boolean | symbol | Function | Array<any> | undefined | object | null;
export type JSType = 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'function' | 'object' | 'any' | 'array';
export type ResolveFn = ((value: any, get: (key: string) => any) => JSValue);
export interface TypeDescriptor {
    /** Used internally to handle schema types */
    type?: JSType | JSType[];
    /** Fully resolved correct TypeScript type for generated TS declarations */
    tsType?: string;
    /** Human-readable type description for use in generated documentation */
    markdownType?: string;
    items?: TypeDescriptor | TypeDescriptor[];
}
export interface FunctionArg extends TypeDescriptor {
    name?: string;
    default?: JSValue;
    optional?: boolean;
}
export interface Schema extends TypeDescriptor {
    id?: string;
    default?: JSValue;
    resolve?: ResolveFn;
    properties?: {
        [key: string]: Schema;
    };
    title?: string;
    description?: string;
    $schema?: string;
    tags?: string[];
    args?: FunctionArg[];
    returns?: TypeDescriptor;
}
// --

export interface SchemaObject {
  [key: string]: SchemaObject | JSValue;
  $schema?: Schema;
  $resolve?: ResolveFn;
}

defineSchemaObject({
  test: '123',
  foo: {
    bar: '123',
    baz: {
      $resolve: (val, get) => val ?? get('test')
    }
  }
})

export function defineSchemaObject(input: SchemaObject): SchemaObject {
  return input
}
