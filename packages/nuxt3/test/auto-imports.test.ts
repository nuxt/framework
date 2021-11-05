import type { AutoImport } from '@nuxt/kit'
import { expect } from 'chai'
import * as VueFunctions from 'vue'
import { AutoImportContext, updateAutoImportContext } from '../src/auto-imports/context'
import { TransformPlugin } from '../src/auto-imports/transform'
import { Nuxt3AutoImports } from '../src/auto-imports/imports'

describe('auto-imports:transform', () => {
  const autoImports: AutoImport[] = [
    { name: 'ref', as: 'ref', from: 'vue' },
    { name: 'computed', as: 'computed', from: 'bar' }
  ]

  const ctx = { autoImports, map: new Map() } as AutoImportContext
  updateAutoImportContext(ctx)

  const transformPlugin = TransformPlugin.raw(ctx, { framework: 'rollup' })
  const transform = (code: string) => transformPlugin.transform.call({ error: null, warn: null }, code, '')

  it('should correct inject', async () => {
    expect(await transform('const a = ref(0)')).to.equal('import { ref } from \'vue\';const a = ref(0)')
    expect(await transform('import { computed as ref } from "foo"; const a = ref(0)')).to.include('import { computed } from \'bar\';')
  })

  it('should ignore existing imported', async () => {
    expect(await transform('import { ref } from "foo"; const a = ref(0)')).to.equal(null)
    expect(await transform('import ref from "foo"; const a = ref(0)')).to.equal(null)
    expect(await transform('import { z as ref } from "foo"; const a = ref(0)')).to.equal(null)
    expect(await transform('let ref = () => {}; const a = ref(0)')).to.equal(null)
    expect(await transform('let { ref } = Vue; const a = ref(0)')).to.equal(null)
    expect(await transform('let [\ncomputed,\nref\n] = Vue; const a = ref(0); const b = ref(0)')).to.equal(null)
  })

  it('should ignore comments', async () => {
    const result = await transform('// import { computed } from "foo"\n;const a = computed(0)')
    expect(result).to.equal('import { computed } from \'bar\';// import { computed } from "foo"\n;const a = computed(0)')
  })
})

const excludedVueHelpers = [
  'EffectScope',
  'ReactiveEffect',
  'stop',
  'camelize',
  'capitalize',
  'normalizeClass',
  'normalizeProps',
  'normalizeStyle',
  'toDisplayString',
  'toHandlerKey',
  'BaseTransition',
  'Comment',
  'Fragment',
  'KeepAlive',
  'Static',
  'Suspense',
  'Teleport',
  'Text',
  'callWithAsyncErrorHandling',
  'callWithErrorHandling',
  'cloneVNode',
  'compatUtils',
  'createBlock',
  'createCommentVNode',
  'createElementBlock',
  'createElementVNode',
  'createHydrationRenderer',
  'createPropsRestProxy',
  'createRenderer',
  'createSlots',
  'createStaticVNode',
  'createTextVNode',
  'createVNode',
  'getTransitionRawChildren',
  'guardReactiveProps',
  'handleError',
  'initCustomFormatter',
  'isMemoSame',
  'isRuntimeOnly',
  'isVNode',
  'mergeDefaults',
  'mergeProps',
  'openBlock',
  'popScopeId',
  'pushScopeId',
  'queuePostFlushCb',
  'registerRuntimeCompiler',
  'renderList',
  'renderSlot',
  'resolveComponent',
  'resolveDirective',
  'resolveDynamicComponent',
  'resolveFilter',
  'resolveTransitionHooks',
  'setBlockTracking',
  'setDevtoolsHook',
  'setTransitionHooks',
  'ssrContextKey',
  'ssrUtils',
  'toHandlers',
  'transformVNodeArgs',
  'useSSRContext',
  'version',
  'warn',
  'watchPostEffect',
  'watchSyncEffect',
  'withAsyncContext',
  'Transition',
  'TransitionGroup',
  'VueElement',
  'createApp',
  'createSSRApp',
  'defineCustomElement',
  'defineSSRCustomElement',
  'hydrate',
  'initDirectivesForSSR',
  'render',
  'useCssVars',
  'vModelCheckbox',
  'vModelDynamic',
  'vModelRadio',
  'vModelSelect',
  'vModelText',
  'vShow',
  'compile'
]

describe('auto-imports:vue', () => {
  for (const name of Object.keys(VueFunctions)) {
    if (excludedVueHelpers.includes(name)) {
      continue
    }
    it(`should register ${name} globally`, () => {
      expect(Nuxt3AutoImports.find(a => a.from === 'vue').names).to.include(name)
    })
  }
})
