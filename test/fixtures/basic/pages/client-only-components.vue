<template>
  <div>
    <ClientScript class="client-only-script" foo="bar" />
    <ClientSetupScript class="client-only-script-setup" foo="hello">
      <template #test>
        <div class="slot-test">Hello</div>
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
    <ClientStringChildStatefulScript class="string-stateful-script" />
    <!-- ensure directives are correctly passed -->
    <ClientStringChildStateful v-show="false" class="string-stateful-should-be-hidden" />
    <ClientSetupScript v-show="false" class="client-script-should-be-hidden" foo="bar" />
    <ClientStringChildStatefulScript
      v-show="false"
      class="string-stateful-script-should-be-hidden"
    />
    <ClientNoState class="no-state" />
  </div>
</template>

<script setup lang="ts">
const stringStatefulComp = ref(null);
</script>
