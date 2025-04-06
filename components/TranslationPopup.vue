<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { CSSProperties } from "vue";

const props = defineProps<{
  text: string;
  visible: boolean;
  position: { x: number; y: number };
}>();

const emit = defineEmits<{
  close: [];
}>();

const popupStyle = computed<CSSProperties>(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y + 30}px`, // 在按钮下方显示
}));
</script>

<template>
  <div v-if="visible" class="text-left font-sans fixed z-50 max-w-xl shadow-md bg-white dark:bg-slate-800  p-2"
    :style="popupStyle">
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-sm font-medium text-slate-700 dark:text-slate-200">翻译结果</h3>
      <button @click.stop="emit('close')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
        <XMarkIcon class="size-4" />
      </button>
    </div>

    <div class="text-sm text-slate-600 dark:text-slate-300">
      <div class="mb-2">
        <div class="font-medium mb-1 text-xs text-slate-500 dark:text-slate-400">翻译</div>
        <div><!-- 这里将来显示翻译结果 --></div>
      </div>
      <div class="mb-2">
        <div class="font-medium mb-1 text-xs text-slate-500 dark:text-slate-400">原文</div>
        <div>{{ text }}</div>
      </div>

    </div>

    <div class="flex justify-end gap-2 mt-3 text-xs">
      <button class="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded">
        加入生词本
      </button>
    </div>
  </div>
</template>