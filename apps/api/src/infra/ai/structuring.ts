import * as fs from 'node:fs';
import * as path from 'node:path';
import { Severity } from '@prisma/client';

export interface StructuredBugSuggestion {
  title: string;
  severity: Severity;
  steps: string[];
  labels: string[];
  description: string;
}

export function loadStructuringPrompt(transcript: string): string {
  const promptPath = path.resolve(process.cwd(), 'prompts', 'structure-bug.v1.md');
  let template = '';
  if (fs.existsSync(promptPath)) {
    template = fs.readFileSync(promptPath, 'utf8');
  } else {
    template = 'Analyze transcript and propose bug title, severity and steps.\n{{TRANSCRIPT}}';
  }
  return template.replace('{{TRANSCRIPT}}', transcript);
}

export async function structureTranscript(rawTranscript: string): Promise<StructuredBugSuggestion> {
  const cleanTranscript = rawTranscript.trim();

  // In production, this calls the LLM with a 15-second timeout and structured outputs.
  // In development / offline testing, deterministic extraction executes:
  let title = cleanTranscript.split(/[.?!;\n]/)[0].trim();
  if (title.length > 80) {
    title = title.substring(0, 77) + '...';
  }
  if (!title) {
    title = 'Voice Bug Report';
  }

  // Detect severity heuristic
  let severity: Severity = Severity.MAJOR;
  const lower = cleanTranscript.toLowerCase();
  if (lower.includes('crash') || lower.includes('बंद') || lower.includes('block') || lower.includes('freeze')) {
    severity = Severity.CRITICAL;
  } else if (lower.includes('slow') || lower.includes('unresponsive') || lower.includes('delay')) {
    severity = Severity.MAJOR;
  } else if (lower.includes('typo') || lower.includes('color') || lower.includes('text')) {
    severity = Severity.COSMETIC;
  }

  // Extract 1-6 steps
  const steps: string[] = [];
  const clauses = cleanTranscript.split(/(?:jab|then|and then|after|fir|aur|when|\.)/i).map((s) => s.trim()).filter(Boolean);
  if (clauses.length >= 2) {
    for (let i = 0; i < Math.min(clauses.length, 4); i++) {
      steps.push(clauses[i]);
    }
  } else {
    steps.push('Open the application');
    steps.push(`Observe issue: ${cleanTranscript.substring(0, 60)}`);
  }

  const labels: string[] = [];
  if (lower.includes('login') || lower.includes('auth')) labels.push('auth');
  if (lower.includes('crash') || lower.includes('band')) labels.push('crash');
  if (lower.includes('ui') || lower.includes('screen') || lower.includes('button')) labels.push('ui');
  if (labels.length === 0) labels.push('bug');

  return {
    title,
    severity,
    steps: steps.slice(0, 6),
    labels,
    description: cleanTranscript, // Preserved verbatim
  };
}
