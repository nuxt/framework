# `nuxi typecheck`

```{bash}
npx nuxi typecheck [rootDir]
```

The `typecheck` command runs [`vue-tsc`](https://github.com/johnsoncodehk/volar/tree/master/packages/vue-tsc) to check types throughout your app.

Option        | Default          | Description
-------------------------|-----------------|------------------
`rootDir` | `.` | The directory of the target application.

This command sets `process.env.NODE_ENV` to `production`. To override, define `NODE_ENV` in a `.env` file or as command-line argument.
