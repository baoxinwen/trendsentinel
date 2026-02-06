import { Controller, Get, Post, Put, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { EmailConfigDto, UpdateEmailConfigDto } from './dto/email-config.dto';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('email')
  @ApiOperation({ summary: 'Get email configuration' })
  @ApiResponse({
    status: 200,
    description: 'Email configuration retrieved successfully',
    type: EmailConfigDto,
  })
  async getEmailConfig(): Promise<EmailConfigDto> {
    return this.configService.getEmailConfig();
  }

  @Post('email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update email configuration (partial)' })
  @ApiResponse({
    status: 200,
    description: 'Email configuration updated successfully',
    type: EmailConfigDto,
  })
  async updateEmailConfig(
    @Body() updateDto: UpdateEmailConfigDto,
  ): Promise<EmailConfigDto> {
    return this.configService.updateEmailConfig(updateDto);
  }

  @Put('email')
  @ApiOperation({ summary: 'Replace email configuration' })
  @ApiResponse({
    status: 200,
    description: 'Email configuration replaced successfully',
    type: EmailConfigDto,
  })
  async setEmailConfig(@Body() config: EmailConfigDto): Promise<EmailConfigDto> {
    return this.configService.setEmailConfig(config);
  }
}
