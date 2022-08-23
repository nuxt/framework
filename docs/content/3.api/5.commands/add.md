# `nuxi add`

Scaffold an entity into your Nuxt application.

```{bash}
npx nuxi add [--cwd] [--force] <TEMPLATE> <NAME>
```

Option        | Default          | Description
-------------------------|-----------------|------------------
`TEMPLATE` | - | Specify a template of the file to be generated.
`NAME` | - | Specify a name of the file that will be created.
`--cwd` | `.` | The directory of the target application.
`--force` | `false` | Force override file if it already exists.

Some templates support additional modifer flags to add a suffix (like `.client` or `.get`) to their name.

**Example:**

```{bash}
npx nuxi add component TheHeader
```

The `add` command generates new elements:

* **component**: `npx nuxi add component TheHeader`
  * Modifier flags: `--mode client|server` or `--client` or `--server`
* **composable**: `npx nuxi add composable foo`
* **layout**: `npx nuxi add layout custom`
* **plugin**: `npx nuxi add plugin analytics` or `npx nuxi add plugin sockets --client` (generates `/plugins/sockets.client.ts`)
  * Modifier flags: `--mode client|server` or `--client`or `--server`
* **page**: `npx nuxi add page about` or `npx nuxi add page "category/[id]"`
* **middleware**: `npx nuxi add middleware auth`
  * Modifier flags: `--global`
* **api**: `npx nuxi add api hello` (CLI will generate file under `/server/api`)
  * Modifier flags: `--method=connect|delete|get|head|options|patch|post|put|trace` or `--get`, `--post`, etc.
