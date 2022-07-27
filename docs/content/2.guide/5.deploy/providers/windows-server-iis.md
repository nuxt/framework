
# Windows Server - IIS

How to deploy to IIS using [azure/iisnode](https://github.com/Azure/iisnode)
- Supports SSR build
- Some configuration required

## Setup

1. Install the [IIS URL Rewrite Module](https://www.iis.net/downloads/microsoft/url-rewrite) 
2. Install the latest version of [node.js](https://nodejs.org/en/) 
2. Install the lates version of [iisnode x64](https://github.com/azure/iisnode/releases/download/v0.2.21/iisnode-full-v0.2.21-x64.msi) or [iisnode x86](https://github.com/azure/iisnode/releases/download/v0.2.21/iisnode-full-v0.2.21-x86.msi) 

3. Alter the nuxt.config.ts file, the nitro preset has to be set to `node-server`

``` JS
import { defineNuxtConfig } from "nuxt";

export default defineNuxtConfig({
  nitro: {
    preset: "node-server"
  }
});
```
4. Run `npm run build` or `yarn build` to generate the `.output` folder
5. Add a web.config file into the `.output` folder
``` XML
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <webSocket enabled="false" />
    <handlers>
      <add name="iisnode" path="index.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server\/debug[\/]?" />
        </rule>

        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>

        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="index.js"/>
        </rule>
      </rules>
    </rewrite>

    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
          <add segment="node_modules"/>
        </hiddenSegments>
      </requestFiltering>
    </security>

    <httpErrors existingResponse="PassThrough" />

    <iisnode watchedFiles="web.config;*.js" node_env="production" debuggingEnabled="true" />
  </system.webServer>
</configuration>
```
6. Add an `index.js` file into the root of the `.output` folder
``` JS
import('./server/index.mjs');
```
7. Deploy the contents of your `.output` folder to your website in IIS
```
+-- server
|   +-- chunks
|   +-- node_modules
|   +-- index.mjs
|   +-- index.mjs.map
|   +-- package.json
+-- public
|   +-- _nuxt
+-- index.js
+-- nitro.json
+-- web.config
```
9. In IIS add `.mjs` as a new mime type and set its content type to `application/javascript`
