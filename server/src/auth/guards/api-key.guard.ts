import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/api-public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);
  private readonly apiKey: string;
  private readonly headerName: string;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('API_KEY', '');
    this.headerName = this.configService.get<string>('API_KEY_HEADER', 'X-API-Key');

    if (!this.apiKey) {
      this.logger.warn('API_KEY is not configured in environment variables');
    }
  }

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKeyFromHeader(request);

    if (!apiKey) {
      throw new UnauthorizedException('API Key is missing');
    }

    if (!this.isValidApiKey(apiKey)) {
      // 不记录 IP 地址以保护用户隐私，只记录事件
      this.logger.warn('Invalid API Key attempt');
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }

  private extractApiKeyFromHeader(request: any): string | undefined {
    return request.headers[this.headerName.toLowerCase()];
  }

  private isValidApiKey(apiKey: string): boolean {
    if (!this.apiKey) {
      this.logger.error('API_KEY is not configured');
      return false;
    }
    return apiKey === this.apiKey;
  }
}
