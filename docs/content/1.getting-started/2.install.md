# Installation

Getting started with Nuxt 3 is straightforward.

> If you just want to explore Nuxt, you can play around online using https://template.nuxtjs.org before installing

## Set up your development environment

Before installing Nuxt, you'll need to have a Node development environment set up. There are lots of tutorials out there but make sure you have access to :

* **Node (latest LTS version)** - [download here](https://nodejs.org/en/download/)
* **Code editor** - such as [VS Code](https://code.visualstudio.com/) or [WebStorm](https://www.jetbrains.com/webstorm/)
* **Terminal** - such as your editor's integrated terminal


## Add Nuxt as a development dependency

Nuxt is only needed in development. Once you build your Nuxt 3 project you will be able to copy the build folder directly to your CDN or static file server (if it's a 'static' project) or deploy the build folder and dependencies to your managed server or serverless platform.

We will use the terminal to create the directories and files, but feel free to create them using your editor of choice.

```bash
# Create a new package.json file to manage your 
# dependencies (if you don't already have one)
echo '{}' > package.json

# Add Nuxt 3 as a development dependency
yarn add --dev nuxt3
```

## Create your first page

Now you'll be able to create `pages/index.vue`.

```bash
# You can also create `pages/index.vue` directly in your editor
mkdir -p pages
touch pages/index.vue
```
