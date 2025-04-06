<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { CSSProperties } from "vue";
import { ref, onMounted, computed } from "vue";

const props = defineProps<{
  text: string;
  visible: boolean;
  position: { x: number; y: number };
}>();

const emit = defineEmits<{
  close: [];
}>();

// 添加翻译结果状态
const translationResult = ref('');
const isPartial = ref(true);

// 监听翻译请求
onMounted(() => {
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'TRANSLATION_RESULT') {
      handleTranslationResult(message.data);
    }
  });
});

// 处理翻译结果
function handleTranslationResult(result: any) {
  if (result.success) {
    translationResult.value = result.data.translatedText;
    isPartial.value = result.data.isPartial;
  } else {
    translationResult.value = '翻译失败: ' + result.error.message;
  }
}

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
        <div class="min-h-[20px]">{{ translationResult || '正在翻译...' }}</div>
      </div>
      <div class="mb-2">
        <div class="font-medium mb-1 text-xs text-slate-500 dark:text-slate-400">原文</div>
        <div>{{ text }}</div>
      </div>

    </div>

    <div class="flex justify-end gap-2 mt-3 text-xs">
      <button :disabled="!isPartial" :class="[isPartial ? 'cursor-not-allowed' : 'cursor-pointer']"
        class="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded">
        加入生词本
      </button>
    </div>
  </div>
</template>