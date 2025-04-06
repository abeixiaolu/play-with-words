<script setup lang="ts">
import { LanguageIcon } from "@heroicons/vue/24/outline";
import { onClickOutside, useDebounceFn, useEventListener } from "@vueuse/core";
import { CSSProperties } from "vue";
import TranslationPopup from "~/components/TranslationPopup.vue";

const isShown = ref(false);
const selection = ref<string>();
const btn = useTemplateRef<HTMLElement>('btn')
const btnStyle = shallowRef<CSSProperties>({
  left: 0,
  top: 0,
})

// 保存按钮相对于页面的坐标
const btnPos = reactive({
  x: 0,
  y: 0
})

// 弹窗状态
const isPopupVisible = ref(false);

function handleMouseUp(evt: MouseEvent) {
  selection.value = window.getSelection()?.toString().trim()
  if (selection.value?.length) {
    isShown.value = true;
    // 保存相对于页面的坐标（而非视口坐标）
    btnPos.x = evt.pageX - 12;
    btnPos.y = evt.pageY - 12;
    updateBtnPosition();
  }
}

// 更新按钮位置
function updateBtnPosition() {
  btnStyle.value = {
    left: btnPos.x - window.scrollX + 'px',
    top: btnPos.y - window.scrollY + 'px',
  }
}

useEventListener('mouseup', useDebounceFn(handleMouseUp, 200));
// 监听页面滚动事件，更新按钮位置
useEventListener('scroll', useDebounceFn(updateBtnPosition, 100), { passive: true });

onClickOutside(btn, () => {
  isShown.value = false;
  isPopupVisible.value = false;
})

function handleClick(evt: MouseEvent) {
  console.log('selection.value: ', selection.value);
  isPopupVisible.value = true;
}

function closePopup() {
  isPopupVisible.value = false;
  isShown.value = false;
}
</script>

<template>
  <button @mouseup.stop="" @click="handleClick" v-if="isShown" ref="btn" :style="btnStyle" data-floating-btn="true"
    class="cursor-pointer shadow hover:bg-cyan-200 fixed top-4 left-4 border border-cyan-500 border-solid p-1 bg-cyan-100 rounded-full">
    <LanguageIcon class="size-4 text-cyan-800" />
    <TranslationPopup :visible="isPopupVisible" :text="selection || ''" :position="btnPos" @mouseup.stop
      @close="closePopup" />
  </button>
</template>
