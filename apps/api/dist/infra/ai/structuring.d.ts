import { Severity } from '@prisma/client';
export interface StructuredBugSuggestion {
    title: string;
    severity: Severity;
    steps: string[];
    labels: string[];
    description: string;
}
export declare function loadStructuringPrompt(transcript: string): string;
export declare function structureTranscript(rawTranscript: string): Promise<StructuredBugSuggestion>;
