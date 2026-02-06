import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send hot search report email' })
  @ApiResponse({
    status: 200,
    description: 'Email sent successfully (or failed with details)',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  })
  async sendEmail(@Body() dto: SendEmailDto): Promise<any> {
    return this.emailService.sendHotSearchReport({
      recipients: dto.recipients,
      platforms: dto.platforms ? dto.platforms.split(',').map(p => p.trim() as any) : undefined,
      minScore: dto.minScore ? parseInt(dto.minScore, 10) : undefined,
      keyword: dto.keyword,
      subject: dto.subject,
    });
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test email' })
  @ApiQuery({
    name: 'to',
    description: 'Recipient email address',
    example: 'test@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Test email result',
  })
  async sendTestEmail(@Query('to') to: string): Promise<any> {
    return this.emailService.sendTestEmail(to);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify SMTP connection' })
  @ApiResponse({
    status: 200,
    description: 'SMTP connection status',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async verifyConnection(): Promise<{ success: boolean; message: string }> {
    const verified = await this.emailService.verifyConnection();
    return {
      success: verified,
      message: verified ? 'SMTP connection successful' : 'SMTP connection failed',
    };
  }
}
