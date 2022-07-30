type Props = Readonly<Record<string, any>>

type FetchPriority = 'high' | 'low' | 'auto'
type CrossOrigin = '' | 'anonymous' | 'use-credentials'
type HTTPEquiv = 'content-security-policy' | 'content-type' | 'default-style' | 'refresh'
type ReferrerPolicy = '' | 'no-referrer' | 'no-referrer-when-downgrade' | 'same-origin' | 'origin' | 'strict-origin' | 'origin-when-cross-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url'

export {
    Props,
    FetchPriority,
    CrossOrigin,
    HTTPEquiv,
    ReferrerPolicy
}