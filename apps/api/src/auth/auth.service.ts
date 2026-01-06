import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes, createHash } from 'crypto';

type AccessTokenPayload = {
  sub: string;
  email: string;
  roles: string[];
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  /**
   * Validate user credentials
   *
   * @param email
   * @param password
   * @returns
   */
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });
    if (!user) throw new UnauthorizedException();

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException();

    return user;
  }

  /**
   * Create JWT access token
   *
   * @param user
   * @returns
   */
  createAccessToken(user: any) {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => String(r.role)),
    };

    const options: JwtSignOptions = {
      expiresIn: (process.env.JWT_ACCESS_TTL as StringValue) || '15m',
    };

    return this.jwt.sign(payload, options);
  }

  /**
   * Create refresh token
   *
   * @param userId
   * @returns
   */
  async createRefreshToken(userId: string) {
    const raw = randomBytes(64).toString('hex');
    const hash = createHash('sha256').update(raw).digest('hex');

    const days = Number(process.env.JWT_REFRESH_TTL_DAYS);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hash,
        expiresAt,
      },
    });

    return raw;
  }

  /**
   * Rotate refresh token
   *
   * @param rawToken
   * @returns
   */
  async rotateRefreshToken(rawToken: string) {
    const hash = createHash('sha256').update(rawToken).digest('hex');

    const token = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash: hash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: { include: { roles: true } } },
    });

    if (!token) throw new UnauthorizedException();

    await this.prisma.refreshToken.update({
      where: { id: token.id },
      data: { revokedAt: new Date() },
    });

    const newRefresh = await this.createRefreshToken(token.userId);
    const access = this.createAccessToken(token.user);

    return { access, refresh: newRefresh };
  }

  /**
   * Logout user by revoking refresh token
   *
   * @param rawToken
   */
  async logout(rawToken: string) {
    const hash = createHash('sha256').update(rawToken).digest('hex');
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hash },
      data: { revokedAt: new Date() },
    });
  }
}
