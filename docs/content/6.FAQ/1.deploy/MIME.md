# Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "". Strict MIME type checking is enforced for module scripts per HTML spec

## Nginx

Just add this to your `MIME` types in `Nginx` configuration:

```bash
application/javascript js mjs;
```

Inside mime.types

## Apache

Just add this to your `MIME` types in `Apache` configuration:

```bash
<IfModule mod_mime.c>
  AddType text/javascript js mjs
</IfModule>
```

Inside .htaccess
