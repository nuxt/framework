export default defineEventHandler(event => {
    const { slug } = event.context.params;
    
    return `Hello world (${ slug }) (Generated at ${new Date().toUTCString()}`
})
