import { DeepSeekTranslationService } from "./translation/deepseek";

const translationService = new DeepSeekTranslationService();

export default defineBackground(() => {
  // 监听来自 content script 的翻译请求
  browser.runtime.onMessage.addListener(async (message, sender) => {
    if (message.type === "TRANSLATE") {
      try {
        // 使用流式翻译
        const stream = translationService.streamTranslate({
          text: message.text,
          from: message.from,
          to: message.to,
        });

        // 逐步发送翻译结果
        for await (const result of stream) {
          if (sender.tab?.id) {
            await browser.tabs.sendMessage(sender.tab.id, {
              type: "TRANSLATION_RESULT",
              data: { success: true, data: result },
            });
          }
        }

        return { success: true };
      } catch (error: any) {
        const errorResponse = {
          success: false,
          error: {
            code: error.code || "UNKNOWN_ERROR",
            message: error.message || "翻译失败",
          },
        };

        // 向发送请求的content script返回错误信息
        if (sender.tab?.id) {
          await browser.tabs.sendMessage(sender.tab.id, {
            type: "TRANSLATION_RESULT",
            data: errorResponse,
          });
        }

        return errorResponse;
      }
    }
  });

  console.log("Translation service initialized!", { id: browser.runtime.id });
});
