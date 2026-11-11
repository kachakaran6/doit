import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  RegisterSchema,
  LoginDto,
  LoginSchema,
  RefreshTokenDto,
  RefreshTokenSchema,
  ForgotPasswordDto,
  ForgotPasswordSchema,
  ResetPasswordDto,
  ResetPasswordSchema,
} from './auth.dto';
import { AppError } from '../../common/errors/app.error';
import { ErrorCode } from '../../common/errors/error-code.enum';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  async register(@Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with credentials and create device session' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate and exchange refresh token for a new pair' })
  @ApiResponse({ status: 200, description: 'Tokens rotated successfully' })
  async refresh(@Body(new ZodValidationPipe(RefreshTokenSchema)) dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Logout and revoke current device session' })
  async logout(@CurrentUser() user: AuthUserPayload) {
    await this.authService.logout(user.sid);
    return { success: true };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Revoke all device sessions for current user' })
  async logoutAll(@CurrentUser() user: AuthUserPayload) {
    await this.authService.logoutAll(user.sub);
    return { success: true };
  }

  @Get('sessions')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'List active device sessions' })
  async getSessions(@CurrentUser() user: AuthUserPayload) {
    return this.authService.getSessions(user.sub);
  }

  @Delete('sessions/:id')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Revoke a specific device session' })
  async revokeSession(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') sessionId: string,
  ) {
    await this.authService.revokeSession(user.sub, sessionId);
    return { success: true };
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(
    @Body(new ZodValidationPipe(ForgotPasswordSchema)) dto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with direct email and new password' })
  async resetPassword(
    @Body(new ZodValidationPipe(ResetPasswordSchema)) dto: ResetPasswordDto,
  ) {
    const email = dto.email;
    const newPassword = dto.newPassword || dto.password;
    if (!email || !newPassword) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, 'Email and new password are required.', 400);
    }
    return this.authService.resetPassword(email, newPassword);
  }

  @Get('me')
  @ApiBearerAuth('bearer-auth')
  @ApiOperation({ summary: 'Get current user profile and workspace memberships' })
  async getMe(@CurrentUser() user: AuthUserPayload) {
    return this.usersService.getMe(user.sub);
  }
}
