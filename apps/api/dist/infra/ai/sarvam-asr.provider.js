"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SarvamAsrProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SarvamAsrProvider = void 0;
const common_1 = require("@nestjs/common");
let SarvamAsrProvider = SarvamAsrProvider_1 = class SarvamAsrProvider {
    constructor() {
        this.engineName = 'sarvam-asr';
        this.logger = new common_1.Logger(SarvamAsrProvider_1.name);
    }
    async transcribe(_filePathOrBuffer, language) {
        this.logger.log(`Calling Sarvam ASR for Indic language: ${language}`);
        return {
            text: 'आवेदन शुरू होने पर तुरंत बंद हो जाता है।',
            engine: this.engineName,
            confidence: 0.96,
        };
    }
};
exports.SarvamAsrProvider = SarvamAsrProvider;
exports.SarvamAsrProvider = SarvamAsrProvider = SarvamAsrProvider_1 = __decorate([
    (0, common_1.Injectable)()
], SarvamAsrProvider);
//# sourceMappingURL=sarvam-asr.provider.js.map