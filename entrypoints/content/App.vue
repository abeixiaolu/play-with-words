<script setup lang="ts">
import { LanguageIcon } from "@heroicons/vue/24/outline";
import { onClickOutside, useDebounceFn, useEventListener } from "@vueuse/core";
import { CSSProperties } from "vue";

const isShown = ref(false);
const selection = ref<string>();
const btn = useTemplateRef<HTMLElement>('btn')
const btnStyle = shallowRef<CSSProperties>({
  left: 0,
  top: 0,
})
function handleMouseUp(evt: MouseEvent) {
  selection.value = window.getSelection()?.toString().trim()
  if (selection.value?.length) {
    isShown.value = true;
    btnStyle.value = {
      left: evt.clientX - 12 + 'px',
      top: evt.clientY - 12 + 'px',
    }
  }
}
useEventListener('mouseup', useDebounceFn(handleMouseUp, 200));

onClickOutside(btn, () => {
  isShown.value = false;
})

function handleClick(evt: MouseEvent) {
  console.log('selection.value: ', selection.value);
}
</script>

<template>
  <button @mouseup.stop="" @click="handleClick" v-if="isShown" ref="btn" :style="btnStyle" data-floating-btn="true"
    class="cursor-pointer hover:bg-zinc-400 fixed top-4 left-4 p-1 bg-zinc-300 rounded-full">
    <LanguageIcon class="size-5 text-zinc-800" />
  </button>
</template>
