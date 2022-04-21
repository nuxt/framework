---
icon: LogoNetlify
---

# Netlify

How to deploy Nuxt to [Netlify](https://www.netlify.com/).

::list

- Support for serverless SSR build
- Auto-detected when deploying
- No configuration required

::

## Setup

Nuxt will auto-detect that you are in a [Netlify](https://www.netlify.com) environment and build the correct version of your Nuxt server. For new sites, Netlify will detect that you are using Nuxt 3 or bridge and set the publish directory to `dist` and build command to `npm run build`. If you are upgrading an existing site, you should check these and update them if needed.

Normally, the deployment to Netlify does not require any configuration.

However, if you want to add custom redirects, you can do so by adding a [`_redirects`](https://docs.netlify.com/routing/redirects/#syntax-for-the-redirects-file) file in the [`public`](/guide/directory-structure/public) directory.

## Setup

Just push to your git repository [as you would normally do for Netlify](https://docs.netlify.com/configure-builds/get-started/).

By default, Nuxt will server-render each page on server hit. You can customize the behavior using the `netlify-edge` or `netlify-builder` preset.

## Netlify Edge Functions

By setting `NITRO_PRESET` environement variable to `netlify-edge`, you can use [Netlify Edge Functions](https://docs.netlify.com/netlify-labs/experimental-features/edge-functions/) to render your Nuxt app!

Netlify Edge Functions use [Deno](https://deno.land) and the powerful V8 JavaScript runtime to let you run globally distributed functions for the fastest possible response times. Read more in the [Netlify Edge Functions announcement](https://www.netlify.com/blog/announcing-serverless-compute-with-edge-functions).

Nitro output can directly run the server at the edge - closer to your users.

## On-demand Builders

By setting `NITRO_PRESET` environment variable to `netlify-builder`, you can benefit from [Netlify On-demand Builders](https://docs.netlify.com/configure-builds/on-demand-builders/).

On-demand Builders are serverless functions used to generate web content as needed that’s automatically cached on Netlify’s Edge CDN. They enable you to build pages for your site when a user visits them for the first time and then cache them at the edge for subsequent visits (also known as Incremental Static Regeneration).

## Learn more

:ReadMore{link="https://nitro.unjs.io/deploy/providers/netlify.html" title="the Nitro documentation for Netlify deployment"}
