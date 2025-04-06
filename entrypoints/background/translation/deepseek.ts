import OpenAI from "openai";
import {
  TranslationRequest,
  TranslationResponse,
  TranslationService,
} from "./types";

export class DeepSeekTranslationService implements TranslationService {
  private client!: OpenAI;
  private static STORAGE_KEY: StorageItemKey = "local:deepseek_api_key";

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    const apiKey = await storage.getItem(
      DeepSeekTranslationService.STORAGE_KEY,
      { fallback: "61357e41-33f3-4352-b634-18ef7dd1fc7a" }
    );
    if (!apiKey) {
      throw new Error("DeepSeek API key not found");
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: "https://ark.cn-beijing.volces.com/api/v3/",
    });
  }

  async *streamTranslate(
    request: TranslationRequest
  ): AsyncGenerator<Partial<TranslationResponse>> {
    if (!this.client) {
      await this.initializeClient();
    }

    const targetLang = request.to || "zh";
    const sourceLang = request.from || "auto";

    const prompt = `请将以下文本翻译成${targetLang}：\n${request.text}\n\n只需要返回翻译结果，不要包含任何解释或额外信息。`;

    try {
      const stream = await this.client.chat.completions.create({
        model: "deepseek-v3-250324",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
      });

      let translatedText = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          translatedText += content;
          yield {
            originalText: request.text,
            translatedText,
            from: sourceLang,
            to: targetLang,
            isPartial: true,
          };
        }
      }

      // 返回最终完整的翻译结果
      yield {
        originalText: request.text,
        translatedText,
        from: sourceLang,
        to: targetLang,
        isPartial: false,
      };
    } catch (error: any) {
      throw {
        code: "TRANSLATION_ERROR",
        message: error.message || "翻译服务出错",
        raw: error,
      };
    }
  }

  // 保持原有的非流式方法以兼容接口
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const generator = this.streamTranslate(request);
    let lastResponse: Partial<TranslationResponse> | undefined;

    for await (const response of generator) {
      lastResponse = response;
    }

    if (!lastResponse) {
      throw new Error("No translation result");
    }

    return lastResponse as TranslationResponse;
  }

  static async setApiKey(apiKey: string): Promise<void> {
    await storage.setItem(DeepSeekTranslationService.STORAGE_KEY, apiKey);
  }
}
