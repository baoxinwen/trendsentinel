import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ConflictException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * 简单的速率限制 Guard
 * 防止 API 滥用和暴力破解
 * 注意：生产环境建议使用 @nestjs/throttler 包
 */
@Injectable()
export class ThrottlerGuard {
  // 使用 Map 存储请求计数（生产环境应使用 Redis）
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly limit = 60; // 每分钟最多 60 次请求
  private readonly windowMs = 60000; // 1 分钟窗口

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;
    const now = Date.now();

    // 获取或初始化计数器
    let record = this.requestCounts.get(ip);

    if (!record || now > record.resetTime) {
      // 创建或重置计数器
      record = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.requestCounts.set(ip, record);
    } else {
      // 增加计数
      record.count++;
    }

    // 检查是否超过限制
    if (record.count > this.limit) {
      throw new ConflictException(
        `Rate limit exceeded. Maximum ${this.limit} requests per ${this.windowMs / 1000} seconds.`
      );
    }

    // 继续处理请求
    return next.handle();
  }

  /**
   * 清理过期的计数器记录
   * 应该定期调用以防止内存泄漏
   */
  cleanupExpiredRecords(): void {
    const now = Date.now();
    for (const [ip, record] of this.requestCounts.entries()) {
      if (now > record.resetTime) {
        this.requestCounts.delete(ip);
      }
    }
  }
}
