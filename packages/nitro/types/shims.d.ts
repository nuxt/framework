declare module '#storage' {
  import type { Storage } from 'unstorage'
  /**
   * @warning This is only available within server API routes or server middleware,
   * not within your Vue app.
   */
  export const storage: Storage
}

declare module '#assets' {
  /**
   * @warning This is only available within server API routes or server middleware,
   * not within your Vue app.
   */
  export interface AssetMeta { type?: string, etag?: string, mtime?: string }
  /**
   * @warning This is only available within server API routes or server middleware,
   * not within your Vue app.
   */
  export function readAsset<T=any>(id: string): Promise<T>
  /**
   * @warning This is only available within server API routes or server middleware,
   * not within your Vue app.
   */
  export function statAsset(id: string): Promise<AssetMeta>
  /**
   * @warning This is only available within server API routes or server middleware,
   * not within your Vue app.
   */
  export function getKeys() : Promise<string[]>
}
