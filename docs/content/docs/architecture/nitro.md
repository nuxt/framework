# Nitro Server

Nitro is the underlying server used by Nuxt 3 (or by Nuxt 2 with the `@nuxt/nitro/compat` module).

It automatically splits server code according to the page/route and only loads what is required, when needed, for optimized cold start timing.

It has a number of key features:

- Cross-platform (Node.js, Browser, Service worker and more)
- Out-of-the-box serverless support
- Automatic route-splitting and async-loaded chunks
- Hybrid mode for static + serverless sites
- Development mode with hot module reloading 
