import type { InlineConfig, SSROptions } from 'vite'
import type { VueViteOptions } from 'vite-plugin-vue2'

export interface Nuxt {
  options: any;
  resolver: any;
  hook: Function;
  callHook: Function;
}

export interface ViteOptions extends InlineConfig {
  /**
   * Options for vite-plugin-vue2
   *
   * @see https://github.com/underfin/vite-plugin-vue2
   */
  vue?: VueViteOptions

  ssr?: SSROptions
}

export interface ViteBuildContext {
  nuxt: Nuxt;
  builder: {
    plugins: { name: string; mode?: 'client' | 'server'; src: string; }[];
  };
  config: ViteOptions;
}
