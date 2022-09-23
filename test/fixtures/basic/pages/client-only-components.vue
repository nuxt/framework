<template>
  <div>
    <ClientScript ref="clientScript" class="client-only-script" foo="bar" />
    <ClientSetupScript
      ref="clientSetupScript"
      class="client-only-script-setup"
      foo="hello"
    >
      <template #test>
        <div class="slot-test">
          Hello
        </div>
      </template>
    </ClientSetupScript>
    <ClientOnly>
      Should not be server rendered.
      <template #fallback>
        <div>Fallback</div>
      </template>
    </ClientOnly>
    <!-- ensure multi root node components are correctly rendered (Fragment) -->
    <ClientMultiRootNode class="multi-root-node" />
    <ClientMultiRootNodeScript class="multi-root-node-script" />

    <!-- ensure component with a single single child are correctly rendered -->
    <ClientStringChildStateful ref="stringStatefulComp" class="string-stateful" />
    <ClientStringChildStatefulScript
      ref="stringStatefulScriptComp"
      class="string-stateful-script"
    />
    <!-- ensure directives are correctly passed -->
    <ClientStringChildStateful v-show="false" class="string-stateful-should-be-hidden" />
    <ClientSetupScript v-show="false" class="client-script-should-be-hidden" foo="bar" />
    <ClientStringChildStatefulScript
      v-show="false"
      class="string-stateful-script-should-be-hidden"
    />
    <ClientNoState class="no-state" />

    <button class="test-ref" @click="stringStatefulComp.add">
      increment count
    </button>
    <button class="test-ref" @click="stringStatefulScriptComp.add">
      increment count
    </button>
    <button class="test-ref" @click="clientScript.add">
      increment count
    </button>
    <button class="test-ref" @click="clientSetupScript.add">
      increment count
    </button>
  </div>
</template>

<script setup lang="ts">
const stringStatefulComp = ref(null)
const stringStatefulScriptComp = ref(null)
const clientScript = ref(null)
const clientSetupScript = ref(null)
</script>
