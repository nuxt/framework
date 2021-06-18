declare module 'vue' {
  export interface GlobalComponents {
<%= components.map(c => {
  return `    ${c.pascalName.replace(/^Lazy/, '')}: typeof import('${c.filePath}')['${c.export}']`
}).join(',\n') %>
  }
}
