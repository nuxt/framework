# Nuxt + Supabase

This example showcases how to use [Supabase](https://supabase.com) with [Nuxt](https://v3.nuxtjs.orgs).

## Features

- `useSupabase()` composable
- User sessions with SSR support
- Handle auth changes (and removes the session)

## Preview

Preview the example live on [StackBlitz](http://stackblitz.com):

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/nuxt/framework/tree/main/examples/integrations/supabase)

## Setup

```bash
npx nuxi init nuxt3-app -t nuxt/framework/examples/integrations/supabase
```

Make sure to install the dependencies and setup the `.env`.

```bash
yarn install
cp .env.example .env
```

Create an account and a project on [Supabase](https://supabase.com) and add the `SUPABASE_URL` and `SUPABASE_KEY` in `.env`.

## Development

Start the development server on http://localhost:3000

```bash
yarn dev
```

## Production

Build the application for production:

```bash
yarn build
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/docs/deployment).
