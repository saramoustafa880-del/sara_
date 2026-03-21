// ============================================================
// Sara Go — Auth Service
// Pi Network Login → JWT Issuance
// ============================================================

import {
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { PiAuthService } from './pi-auth.service'
import type { User } from '@prisma/client'

export interface JwtPayload {
  sub: string        // user.id (UUID)
  pi_id: string      // Pi Network UID
  username: string
  tier: string
  iat?: number
  exp?: number
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly piAuth: PiAuthService
  ) {}

  // ── Pi Login Flow ────────────────────────────────────────

  async loginWithPi(piAccessToken: string): Promise<{
    user: Omit<User, 'created_at' | 'updated_at'> & { pi_balance: number }
    tokens: AuthTokens
  }> {
    if (!piAccessToken) {
      throw new BadRequestException('Pi access token is required')
    }

    // Step 1: Verify token with Pi Network API
    const piUser = await this.piAuth.verifyPiToken(piAccessToken)

    this.logger.log(`Pi auth verified for: ${piUser.username} (${piUser.uid})`)

    // Step 2: Upsert user in database
    const user = await this.prisma.user.upsert({
      where: { pi_id: piUser.uid },
      update: {
        username: piUser.username,
        last_login: new Date(),
      },
      create: {
        pi_id: piUser.uid,
        username: piUser.username,
        pi_wallet_address: piUser.walletAddress || '',
        tier: 'Basic',
        preferences: {},
        total_bookings: 0,
        total_spent_pi: 0,
      },
    })

    // Step 3: Issue JWT tokens
    const tokens = await this.issueTokens(user)

    this.logger.log(`✅ Sara Go login: ${user.username} [${user.tier}]`)

    return {
      user: {
        id: user.id,
        pi_id: user.pi_id,
        username: user.username,
        pi_wallet_address: user.pi_wallet_address,
        tier: user.tier,
        preferences: user.preferences as Record<string, unknown>,
        total_bookings: user.total_bookings,
        total_spent_pi: Number(user.total_spent_pi),
        last_login: user.last_login,
        pi_balance: 0, // Fetched client-side from Pi SDK
      },
      tokens,
    }
  }

  // ── Token Issuance ───────────────────────────────────────

  async issueTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      pi_id: user.pi_id,
      username: user.username,
      tier: user.tier,
    }

    const expiresIn = 900 // 15 minutes

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_SECRET'),
        expiresIn,
      }),
      this.jwt.signAsync(
        { sub: user.id, type: 'refresh' },
        {
          secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        }
      ),
    ])

    // Store refresh token hash in DB
    await this.prisma.refreshToken.upsert({
      where: { user_id: user.id },
      update: {
        token: refresh_token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      create: {
        user_id: user.id,
        token: refresh_token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return { access_token, refresh_token, expires_in: expiresIn }
  }

  // ── Refresh Token ────────────────────────────────────────

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    let payload: { sub: string; type: string }

    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      })
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type')
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { user_id: payload.sub },
      include: { user: true },
    })

    if (
      !storedToken ||
      storedToken.token !== refreshToken ||
      storedToken.expires_at < new Date()
    ) {
      throw new UnauthorizedException('Refresh token expired or invalid')
    }

    return this.issueTokens(storedToken.user)
  }

  // ── Get Me ───────────────────────────────────────────────

  async getMe(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    return user
  }

  // ── Logout ───────────────────────────────────────────────

  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { user_id: userId },
    })
    this.logger.log(`User ${userId} logged out`)
  }

  // ── Validate JWT Payload ──────────────────────────────────

  async validateJwtPayload(payload: JwtPayload): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    })
    return user
  }
}
