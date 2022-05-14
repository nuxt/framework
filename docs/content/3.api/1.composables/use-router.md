# `useRouter`

The `useRouter` composable returns the router instance and must be called in a `setup` function, plugin, or route middleware.

Within the template of a Vue component, you can access the router using `$router` and you can access router in setup() function using `useRouter()` composable.

`useRouter` provides collection of methods to help you manipulate Vue router dynamically.

```html [~/pages/*.vue]

<script setup>
 const router = useRouter();
 router.push({ path: "/home" });
</script>

````

 `useRouter` provides the following helper methods that we can roughly divide into four groups.

::ReadMore{link="https://router.vuejs.org/api/#currentroute"}
::

## Basic manipulation

- **addRoute:** Add a new route to the router instance. `parentName` can be provided to add new route as the child of an existing route.
- **removeRoute:** Remove an existing route by its name.
- **getRoutes:** Get a full list of all the route records.
- **hasRoute:** Checks if a route with a given name exists

## Based on history API

- **back:** Go back in history if possible, same as `router.go(-1)`.
- **forward:** Go forward in history if possible, same as `router.go(1)`.
- **go:** Move forward or backward through the history without the hierarchical restrictions enforced in `router.back()` and `router.forward()`.
- **push:** Programmatically navigate to a new URL by pushing an entry in the history stack.
- **replace:** Programmatically navigate to a new URL by replacing the current entry in the routes history stack.

> TIP: `router.addRoute()` adds route details into an array of routes and it is useful while building Nuxt plugins while `router.push()` on the other hand, triggers a new navigation immediately and it is useful in Nuxt Page components, Vue components and composable.

```js [js]
const router = useRouter();
router.back();
router.forward();
router.go();
router.push({ path: "/home" });
router.replace({ hash: "#bio" });
````

::ReadMore{link="https://developer.mozilla.org/en-US/docs/Web/API/History"}
::

## Navigation guards

`useRouter` composable provides `afterEach`, `beforeEach` and `beforeResolve` helper methods that acts as nagivation guards.

However, Nuxt has a concept of **Route middleware** that simplifies the implementation of navigation guards and provides much better developer experience.

::ReadMore{link="/guide/directory-structure/middleware"}
::

## Promise and error handling

- **isReady:** Returns a Promise that resolves when the router has completed the initial navigation.
- **onError:** Adds an error handler that is called every time a non caught error happens during navigation.
- **resolve:** Returns the normalized version of a route location. Also includes an `href` property that includes any existing base.

::ReadMore{link="https://router.vuejs.org/api/#router-methods"}
::

## Universal router instance

Nuxt also provides a universal router instance that is different from `useRouter()`. This router instance is independent of Vue router, and provides similar helper methods as `useRouter` composable.

You can use `useNuxtApp()` composable to access this router instance.

```js [js]
const NuxtApp = useNuxtApp();
const router = NuxtApp.$router;
// router.push()
// router.onError()
// router.getRoutes()
// ...and so on
```

::ReadMore{link="/guide/features/routing"}
::
