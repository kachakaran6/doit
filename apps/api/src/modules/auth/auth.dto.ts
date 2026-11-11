import { z } from 'zod';

export const RegisterSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2).optional(),
    fullName: z.string().min(2).optional(),
  })
  .transform((val) => ({
    email: val.email,
    password: val.password,
    name: val.name || val.fullName || 'User',
  }));

export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceName: z.string().optional(),
  deviceId: z.string().optional(),
  platform: z.enum(['ios', 'android', 'web']).optional(),
  appVersion: z.string().optional(),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(16),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
