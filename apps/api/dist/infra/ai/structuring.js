"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadStructuringPrompt = loadStructuringPrompt;
exports.structureTranscript = structureTranscript;
const fs = require("node:fs");
const path = require("node:path");
const client_1 = require("@prisma/client");
function loadStructuringPrompt(transcript) {
    const promptPath = path.resolve(process.cwd(), 'prompts', 'structure-bug.v1.md');
    let template = '';
    if (fs.existsSync(promptPath)) {
        template = fs.readFileSync(promptPath, 'utf8');
    }
    else {
        template = 'Analyze transcript and propose bug title, severity and steps.\n{{TRANSCRIPT}}';
    }
    return template.replace('{{TRANSCRIPT}}', transcript);
}
async function structureTranscript(rawTranscript) {
    const cleanTranscript = rawTranscript.trim();
    let title = cleanTranscript.split(/[.?!;\n]/)[0].trim();
    if (title.length > 80) {
        title = title.substring(0, 77) + '...';
    }
    if (!title) {
        title = 'Voice Bug Report';
    }
    let severity = client_1.Severity.MAJOR;
    const lower = cleanTranscript.toLowerCase();
    if (lower.includes('crash') || lower.includes('बंद') || lower.includes('block') || lower.includes('freeze')) {
        severity = client_1.Severity.CRITICAL;
    }
    else if (lower.includes('slow') || lower.includes('unresponsive') || lower.includes('delay')) {
        severity = client_1.Severity.MAJOR;
    }
    else if (lower.includes('typo') || lower.includes('color') || lower.includes('text')) {
        severity = client_1.Severity.COSMETIC;
    }
    const steps = [];
    const clauses = cleanTranscript.split(/(?:jab|then|and then|after|fir|aur|when|\.)/i).map((s) => s.trim()).filter(Boolean);
    if (clauses.length >= 2) {
        for (let i = 0; i < Math.min(clauses.length, 4); i++) {
            steps.push(clauses[i]);
        }
    }
    else {
        steps.push('Open the application');
        steps.push(`Observe issue: ${cleanTranscript.substring(0, 60)}`);
    }
    const labels = [];
    if (lower.includes('login') || lower.includes('auth'))
        labels.push('auth');
    if (lower.includes('crash') || lower.includes('band'))
        labels.push('crash');
    if (lower.includes('ui') || lower.includes('screen') || lower.includes('button'))
        labels.push('ui');
    if (labels.length === 0)
        labels.push('bug');
    return {
        title,
        severity,
        steps: steps.slice(0, 6),
        labels,
        description: cleanTranscript,
    };
}
//# sourceMappingURL=structuring.js.map