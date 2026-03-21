// ============================================================
// Sara Go — Pi Auth Service
// Server-side Pi Network Token Verification
// ============================================================

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { type AxiosInstance } from 'axios'

export interface PiVerifiedUser {
  uid: string
  username: string
  walletAddress?: string
  roles?: string[]
}

export interface PiMeResponse {
  uid: string
  username: string
  roles: string[]
  credentials: {
    scopes: string[]
    valid_until: {
      timestamp: number
      iso8601: string
    }
  }
}

@Injectable()
export class PiAuthService {
  private readonly logger = new Logger(PiAuthService.name)
  private readonly piApiClient: AxiosInstance

  constructor(private readonly config: ConfigService) {
    const piApiKey = this.config.getOrThrow<string>('PI_API_KEY')

    this.piApiClient = axios.create({
      baseURL: 'https://api.minepi.com',
      headers: {
        Authorization: `Key ${piApiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })
  }

  /**
   * Verifies a Pi Network access token by calling Pi's /me endpoint.
   * This is the server-side validation step — never trust client-side claims.
   */
  async verifyPiToken(accessToken: string): Promise<PiVerifiedUser> {
    try {
      const response = await this.piApiClient.get<PiMeResponse>('/v2/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const piUser = response.data

      // Validate token expiry
      const validUntil = piUser.credentials?.valid_until?.timestamp
      if (validUntil && Date.now() > validUntil * 1000) {
        throw new UnauthorizedException('Pi access token has expired')
      }

      // Validate required scopes
      const scopes = piUser.credentials?.scopes || []
      if (!scopes.includes('username')) {
        throw new UnauthorizedException('Missing required Pi scope: username')
      }

      this.logger.log(`✅ Pi token verified for: ${piUser.username}`)

      return {
        uid: piUser.uid,
        username: piUser.username,
        roles: piUser.roles,
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new UnauthorizedException('Invalid Pi access token')
        }
        if (error.response?.status === 429) {
          throw new UnauthorizedException('Pi API rate limit exceeded')
        }
        this.logger.error(
          `Pi API error: ${error.response?.status} — ${JSON.stringify(error.response?.data)}`
        )
      }
      throw new UnauthorizedException('Pi Network authentication failed')
    }
  }

  /**
   * Approves a Pi payment on the server side.
   * Must be called before the user signs the transaction.
   */
  async approvePayment(paymentId: string): Promise<{
    identifier: string
    user_uid: string
    amount: number
    memo: string
    status: Record<string, boolean>
    transaction: null | { txid: string; verified: boolean }
  }> {
    try {
      const response = await this.piApiClient.post(
        `/v2/payments/${paymentId}/approve`
      )

      this.logger.log(`✅ Payment approved: ${paymentId}`)
      return response.data
    } catch (error) {
      this.logger.error(`❌ Payment approval failed: ${paymentId}`, error)
      throw new Error(`Payment approval failed: ${paymentId}`)
    }
  }

  /**
   * Completes a Pi payment after the blockchain confirms the transaction.
   * Must be called to release Pi to the app wallet.
   */
  async completePayment(paymentId: string, txid: string): Promise<{
    identifier: string
    status: Record<string, boolean>
    transaction: { txid: string; verified: boolean; _link: string }
  }> {
    try {
      const response = await this.piApiClient.post(
        `/v2/payments/${paymentId}/complete`,
        { txid }
      )

      this.logger.log(`✅ Payment completed: ${paymentId} | TxID: ${txid}`)
      return response.data
    } catch (error) {
      this.logger.error(`❌ Payment completion failed: ${paymentId}`, error)
      throw new Error(`Payment completion failed: ${paymentId}`)
    }
  }

  /**
   * Fetches payment details from Pi Network API for verification.
   */
  async getPayment(paymentId: string): Promise<{
    identifier: string
    user_uid: string
    amount: number
    memo: string
    from_address: string
    to_address: string
    direction: string
    status: {
      developer_approved: boolean
      transaction_verified: boolean
      developer_completed: boolean
      cancelled: boolean
      user_cancelled: boolean
    }
    transaction: null | {
      txid: string
      verified: boolean
      _link: string
    }
    created_at: string
    network: string
  }> {
    const response = await this.piApiClient.get(`/v2/payments/${paymentId}`)
    return response.data
  }
}
