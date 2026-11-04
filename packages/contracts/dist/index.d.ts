import { z } from 'zod';
export declare const PingSchema: z.ZodObject<{
    status: z.ZodLiteral<"ok">;
    db: z.ZodOptional<z.ZodEnum<["up", "down"]>>;
    version: z.ZodString;
    uptime: z.ZodNumber;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "ok";
    version: string;
    uptime: number;
    timestamp: string;
    db?: "up" | "down" | undefined;
}, {
    status: "ok";
    version: string;
    uptime: number;
    timestamp: string;
    db?: "up" | "down" | undefined;
}>;
export type Ping = z.infer<typeof PingSchema>;
export declare const ApiResponseSchema: <T extends z.ZodTypeAny>(dataSchema: T) => z.ZodObject<{
    data: T;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    data: T;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    data: T;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
export declare const ApiErrorSchema: z.ZodObject<{
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        traceId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: Record<string, unknown> | undefined;
        traceId?: string | undefined;
    }, {
        code: string;
        message: string;
        details?: Record<string, unknown> | undefined;
        traceId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown> | undefined;
        traceId?: string | undefined;
    };
}, {
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown> | undefined;
        traceId?: string | undefined;
    };
}>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
//# sourceMappingURL=index.d.ts.map