import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './current-uesr.decorator';
import type { CurrentUserPayload } from './current-uesr.decorator';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.validateUser(body.email, body.password);
    const access = this.auth.createAccessToken(user);
    const refresh = await this.auth.createRefreshToken(user.id);

    res.cookie('refresh_token', refresh, {
      httpOnly: true,
      secure: process.env.AUTH_COOKIE_SECURE === 'true',
      sameSite: 'lax',
      path: '/api/auth',
    });

    return { accessToken: access };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies['refresh_token'];
    const { access, refresh } = await this.auth.rotateRefreshToken(raw);

    res.cookie('refresh_token', refresh, {
      httpOnly: true,
      secure: process.env.AUTH_COOKIE_SECURE === 'true',
      sameSite: 'lax',
      path: '/api/auth',
    });

    return { accessToken: access };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies['refresh_token'];
    if (raw) await this.auth.logout(raw);

    res.clearCookie('refresh_token', { path: '/api/auth' });
    return { ok: true };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@CurrentUser() user: CurrentUserPayload) {
    return user; // {sub, email, roles[]}
  }
}
