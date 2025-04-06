export interface TranslationRequest {
  text: string;
  from?: string;
  to?: string;
}

export interface TranslationResponse {
  originalText: string;
  translatedText: string;
  from: string;
  to: string;
  raw?: any;
  isPartial?: boolean;
}

export interface TranslationError {
  code: string;
  message: string;
  raw?: any;
}

export interface TranslationService {
  translate(request: TranslationRequest): Promise<TranslationResponse>;
}
