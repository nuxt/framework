type Props = Readonly<Record<string, any>>

type FetchPriority = "high" | "low" | "auto"
type CrossOrigin = "" | "anonymous" | "use-credentials"
type HTTPEquiv =
  | "content-security-policy"
  | "content-type"
  | "default-style"
  | "refresh"
  | "x-ua-compatible"
type ReferrerPolicy =
  | ""
  | "no-referrer"
  | "no-referrer-when-downgrade"
  | "same-origin"
  | "origin"
  | "strict-origin"
  | "origin-when-cross-origin"
  | "strict-origin-when-cross-origin"
  | "unsafe-url"
type LinkRelationship =
  | "alternate"
  | "author"
  | "canonical"
  | "dns-prefetch"
  | "help"
  | "icon"
  | "license"
  | "manifest"
  | "me"
  | "modulepreload"
  | "next"
  | "pingback"
  | "preconnect"
  | "prefetch"
  | "preload"
  | "prerender"
  | "prev"
  | "search"
  | "stylesheet"
  | String

type Target = "_blank" | "_self" | "_parent" | "_top" | String

export {
  Props,
  FetchPriority,
  CrossOrigin,
  HTTPEquiv,
  ReferrerPolicy,
  LinkRelationship,
  Target
}
