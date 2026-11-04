"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OpenAIWhisperProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIWhisperProvider = void 0;
const common_1 = require("@nestjs/common");
let OpenAIWhisperProvider = OpenAIWhisperProvider_1 = class OpenAIWhisperProvider {
    constructor() {
        this.engineName = 'openai-whisper';
        this.logger = new common_1.Logger(OpenAIWhisperProvider_1.name);
    }
    async transcribe(_filePathOrBuffer, language) {
        this.logger.log(`Calling OpenAI Whisper for language: ${language}`);
        return {
            text: 'Login button is unresponsive when tapped repeatedly on 3G network.',
            engine: this.engineName,
            confidence: 0.98,
        };
    }
};
exports.OpenAIWhisperProvider = OpenAIWhisperProvider;
exports.OpenAIWhisperProvider = OpenAIWhisperProvider = OpenAIWhisperProvider_1 = __decorate([
    (0, common_1.Injectable)()
], OpenAIWhisperProvider);
//# sourceMappingURL=openai-whisper.provider.js.map