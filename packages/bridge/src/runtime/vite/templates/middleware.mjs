<%
const _middleware = ((typeof middleware !== 'undefined' && middleware) || []).map(m => ({
  filePath: relativeToBuild(srcDir, dir.middleware, m.src),
  id: m.name || m.src.replace(/[\\/]/g, '/').replace(/\.(js|ts)$/, '')
 }))
%><%= _middleware.map(m => `import $${hash(m.id)} from '${m.filePath}'`).join('\n') %>

const middleware = {
<%= _middleware.map(m => `  ['${m.id}']: $${hash(m.id)}`).join(',\n') %>
}

export default middleware
