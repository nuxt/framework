# `nuxi dev`

```{bash}
npx nuxi dev [rootDir] [--clipboard] [--open, -o] [--no-clear] [--port, -p] [--host, -h] [--https] [--ssl-cert] [--ssl-key]
```

The `dev` command starts a development server with hot module replacement at [http://localhost:3000](https://localhost:3000)

Option        | Default          | Description
-------------------------|-----------------|------------------
`rootDir` | `.` | The root directory of the application to serve.
`--clipboard` | `false` | Copy URL to clipboard.
`--open, -o` | `false` | Open URL in browser.
`--no-clear` | `false` | Does not clear the console after startup.
`--port, -p` | `3000` | Port to listen.
`--host, -h` | `localhost` | Hostname of the server.
`--https` | `false` | Listen with `https` protocol with a self-signed certificate by default.
`--ssl-cert` |`null` | Specify a certificate for https.
`--ssl-key` |`null` | Specify the key for the https certificate.

The port and host can also be set via NUXT_PORT, PORT, NUXT_HOST or HOST environment variables.

This command sets `process.env.NODE_ENV` to `development`.

::alert{type="info"}
If you are using a self-signed certificate in development, you will need to set `NODE_TLS_REJECT_UNAUTHORIZED=0` in your environment.
::

::stabilityEdge{title="Improved HTTPS Support"}
With next releases, `NODE_TLS_REJECT_UNAUTHORIZED` is no longer required.
::
