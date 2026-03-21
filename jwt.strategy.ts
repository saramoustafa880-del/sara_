// ============================================================
// Sara Go — JWT Strategy (Passport)
// RS256 Token Validation
// ============================================================

import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService, type JwtPayload } from '../auth.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      algorithms: ['HS256'],
    })
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateJwtPayload(payload)
    if (!user) {
      throw new UnauthorizedException('Token is invalid or expired')
    }
    return payload
  }
}
