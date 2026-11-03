import { TaskAttachment } from '../tasks/types';

export type BugSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'TRIVIAL';
export type BugStatus = 'TRIAGED' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED';

export interface DeviceTelemetry {
  deviceModel: string;
  osVersion: string;
  appVersion: string;
  buildNumber: string;
  timestamp: string;
  screenResolution?: string;
  batteryLevel?: number;
  freeMemoryMb?: number;
}

export interface BugViewModel {
  id: string;
  humanId: string;
  title: string;
  description?: string;
  severity: BugSeverity;
  status: BugStatus;
  orderKey: string;
  projectId: string;
  reproductionSteps?: string[];
  telemetry?: DeviceTelemetry;
  hasAttachment?: boolean;
  attachments?: TaskAttachment[];
  createdAt: string;
  updatedAt: string;
}
