import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infra/prisma/prisma.service';
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export declare class TokenService {
    private readonly jwtService;
    private readonly prisma;
    constructor(jwtService: JwtService, prisma: PrismaService);
    generateTokenPair(userId: string, sessionId: string, workspaceId?: string, role?: string): Promise<TokenPair>;
    rotateRefreshToken(tokenComposite: string): Promise<TokenPair>;
}
