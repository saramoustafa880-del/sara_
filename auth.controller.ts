// ============================================================
// Sara Go — Auth Controller
// Endpoints: Pi Login, Me, Refresh, Logout
// ============================================================

import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Version,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { JwtPayload } from './auth.service'

class PiLoginDto {
  piAccessToken!: string
}

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── Pi Login ─────────────────────────────────────────────

  @Post('pi-login')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Login with Pi Network',
    description:
      'Exchange a Pi Network access token for Sara Go JWT tokens. ' +
      'Token is verified server-side with the Pi API.',
  })
  @ApiBody({ type: PiLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful — returns user data and JWT tokens',
  })
  @ApiResponse({ status: 401, description: 'Invalid Pi access token' })
  async loginWithPi(
    @Body() body: PiLoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { user, tokens } = await this.authService.loginWithPi(
      body.piAccessToken
    )

    // Set refresh token as HttpOnly cookie
    res.cookie('sara_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth/refresh',
    })

    return {
      user,
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
    }
  }

  // ── Get Current User ─────────────────────────────────────

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() currentUser: JwtPayload) {
    const user = await this.authService.getMe(currentUser.sub)
    return user
  }

  // ── Refresh Token ─────────────────────────────────────────

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Refresh JWT access token using refresh token' })
  @ApiResponse({ status: 200, description: 'New access token issued' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies['sara_refresh_token']

    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: 401,
        message: 'No refresh token provided',
      })
    }

    const tokens = await this.authService.refreshTokens(refreshToken)

    // Rotate refresh token
    res.cookie('sara_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth/refresh',
    })

    return {
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
    }
  }

  // ── Logout ────────────────────────────────────────────────

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(
    @CurrentUser() currentUser: JwtPayload,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.authService.logout(currentUser.sub)

    res.clearCookie('sara_refresh_token', {
      path: '/api/v1/auth/refresh',
    })
  }
}
