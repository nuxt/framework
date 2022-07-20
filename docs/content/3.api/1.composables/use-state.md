# `useState`

```ts
useState<T>(init?: () => T | Ref<T>): Ref<T>
useState<T>(key: string, init?: () => T | Ref<T>): Ref<T>
```

* **key**: A unique key ensuring that data fetching is properly de-duplicated across requests. If you do not provide a key, then a key that is unique to the file and line number of the instance of `useState` will be generated for you.
* **init**: A function that provides initial value for the state when not initiated. This function can also return a `Ref`.
* **T**: (typescript only) Specify the type of state

::alert{type=warning}
Because the ref `useState` will be persisted from server to client, it is important that it does not contain anything (on server side) that cannot be serialized to JSON, such as a class or function. Once loaded on the client, it behaves as a normal ref and does not have this limitation.
::

::ReadMore{link="/guide/features/state-management"}
::
