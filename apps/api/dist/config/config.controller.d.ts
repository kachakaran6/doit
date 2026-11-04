export interface AppConfigResponse {
    minAppVersion: string;
    latestAppVersion: string;
    environment: string;
    storageDriver: string;
    features: {
        voice: boolean;
        attachments: boolean;
        search: boolean;
        floatingBubble: boolean;
    };
    downloadUrl?: string;
}
export declare class ConfigController {
    getConfig(): AppConfigResponse;
}
