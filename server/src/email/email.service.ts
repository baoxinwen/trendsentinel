import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import { HotsearchService } from '../hotsearch/hotsearch.service';
import { HotSearchItemDto } from '../hotsearch/dto/hotsearch-item.dto';
import { Platform } from '../hotsearch/interfaces/platform.enum';
import { ConfigService as AppConfigService } from '../config/config.service';
import { EmailConfigDto } from '../config/dto/email-config.dto';
import { PLATFORM_CONFIG } from '../hotsearch/utils/platform-mapper.util';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private templateCache: { template: string; css: string } | null = null;

  constructor(
    private configService: ConfigService,
    private hotsearchService: HotsearchService,
    private appConfig: AppConfigService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 465);
    const secure = this.configService.get<boolean>('SMTP_SECURE', true);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    if (!host || !user || !pass) {
      this.logger.warn('SMTP configuration is incomplete. Email sending will not work.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: user,
        pass: pass,
      },
      // Ensure UTF-8 encoding for all messages
      utf8: true,
    } as any);

    this.logger.log(`Email transporter initialized: ${host}:${port}`);
  }

  /**
   * Load email template and CSS
   */
  private async loadTemplate(): Promise<{ template: string; css: string }> {
    if (this.templateCache) {
      return this.templateCache;
    }

    // Use src directory in development, dist in production
    const isDev = process.env.NODE_ENV === 'development';
    const basePath = isDev
      ? path.join(process.cwd(), 'src', 'email')
      : __dirname;

    const templatePath = path.join(basePath, 'templates', 'hotsearch-report.hbs');
    const cssPath = path.join(basePath, 'templates', 'styles', 'email.css');

    try {
      const [template, css] = await Promise.all([
        fs.readFile(templatePath, 'utf-8'),
        fs.readFile(cssPath, 'utf-8'),
      ]);

      this.templateCache = { template, css };
      return this.templateCache;
    } catch (error) {
      this.logger.error(`Failed to load email template: ${error.message}`);
      this.logger.error(`Template path: ${templatePath}`);
      this.logger.error(`CSS path: ${cssPath}`);
      throw error;
    }
  }

  /**
   * Register Handlebars helpers
   */
  private registerHelpers() {
    Handlebars.registerHelper('toLowerCase', (str: string) => str.toLowerCase());

    Handlebars.registerHelper('platformConfig', (platform: Platform, key: string) => {
      const config = PLATFORM_CONFIG[platform];
      return config ? config[key] : '';
    });

    Handlebars.registerHelper('formatScore', (score: number) => {
      if (score >= 100000000) {
        return `${(score / 100000000).toFixed(1)}亿`;
      } else if (score >= 10000) {
        return `${(score / 10000).toFixed(1)}万`;
      }
      return score.toString();
    });

    Handlebars.registerHelper('isTopThree', (rank: number) => rank <= 3);

    Handlebars.registerHelper('sortRank', (items: HotSearchItemDto[]) => {
      return items.sort((a, b) => a.rank - b.rank);
    });

    Handlebars.registerHelper('greaterThan', (a: number, b: number) => a > b);

    Handlebars.registerHelper('subtract', (a: number, b: number) => a - b);
  }

  /**
   * Compile template with data
   */
  private async compileTemplate(data: any): Promise<string> {
    this.registerHelpers();
    const { template, css } = await this.loadTemplate();

    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate({ ...data, cssContent: css });
  }

  /**
   * Send hot search report email
   */
  async sendHotSearchReport(options: {
    recipients?: string[];
    platforms?: Platform[];
    minScore?: number;
    keyword?: string;
    subject?: string;
  } = {}): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      // Get recipients from options or config
      const config = await this.appConfig.getEmailConfig();
      const recipients = options.recipients || config.recipients;

      if (!recipients || recipients.length === 0) {
        return {
          success: false,
          message: 'No recipients configured',
        };
      }

      // Check if email is enabled
      if (!options.recipients && !config.enabled) {
        this.logger.log('Email sending is disabled in config');
        return {
          success: false,
          message: 'Email sending is disabled',
        };
      }

      // Parse platforms from config if not provided in options
      let platforms = options.platforms;
      if (!platforms && config.platforms) {
        const platformNames = config.platforms.split(',').map(p => p.trim());
        platforms = platformNames as Platform[];
      }

      // Use minScore from config if not provided in options
      const minScore = options.minScore !== undefined ? options.minScore : config.minScore;

      // Use keyword from config if not provided in options
      const keyword = options.keyword || config.keyword;

      // Fetch hot search data
      const forceRefresh = true;
      const allItems = platforms && platforms.length > 0
        ? await this.hotsearchService.fetchMultiplePlatforms(platforms, forceRefresh)
        : await this.hotsearchService.fetchAllPlatforms(forceRefresh);

      // Filter items
      const filteredItems = this.hotsearchService.filterItems(allItems, {
        minScore,
        keyword,
        platforms,
      });

      if (filteredItems.length === 0) {
        return {
          success: false,
          message: 'No hot search items found matching the criteria',
        };
      }

      // Group by platform
      const groupedItems = this.hotsearchService.groupByPlatform(filteredItems);

      // Calculate stats
      const totalItems = filteredItems.length;
      const totalPlatforms = Object.keys(groupedItems).length;
      const topScore = Math.max(...filteredItems.map(item => item.score));

      // Generate summary
      const topItems = filteredItems
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      const summary = `本期热点共 ${totalItems} 条，来自 ${totalPlatforms} 个平台。热度最高的: ${topItems.map(i => i.title).join('、')}。`;

      // Compile email template
      const html = await this.compileTemplate({
        title: options.subject || 'TrendMonitor 热搜监控 - 热点报告',
        reportTime: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        frequency: config.frequency === 'hourly' ? '每小时报告' :
                  config.frequency === 'daily' ? '每日报告' : '每周报告',
        summary,
        totalItems,
        totalPlatforms,
        topScore: topScore >= 10000 ? `${(topScore / 10000).toFixed(1)}万` : topScore,
        groupedItems,
      });

      // Send email
      const mailFrom = this.configService.get<string>('MAIL_FROM', 'TrendMonitor 热搜监控 <noreply@example.com>');

      const info = await this.transporter.sendMail({
        from: mailFrom,
        to: recipients.join(', '),
        subject: options.subject || 'TrendMonitor 热搜监控 - 热点报告',
        html,
        encoding: 'utf-8',
      });

      this.logger.log(`Email sent successfully: ${info.messageId}`);
      return {
        success: true,
        message: `Email sent to ${recipients.length} recipient(s)`,
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return {
        success: false,
        message: 'Failed to send email',
        error: error.message,
      };
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(recipient: string): Promise<{ success: boolean; message: string }> {
    try {
      const mailFrom = this.configService.get<string>('MAIL_FROM', 'TrendMonitor 热搜监控 <noreply@example.com>');

      const info = await this.transporter.sendMail({
        from: mailFrom,
        to: recipient,
        subject: 'TrendMonitor 热搜监控 - 测试邮件',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #667eea;">🔍 TrendMonitor 热搜监控</h1>
            <p>这是一封测试邮件。</p>
            <p>如果您收到此邮件，说明邮件服务配置正确。</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              发送时间: ${new Date().toLocaleString('zh-CN')}
            </p>
          </div>
        `,
      });

      this.logger.log(`Test email sent: ${info.messageId}`);
      return {
        success: true,
        message: 'Test email sent successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to send test email: ${error.message}`);
      return {
        success: false,
        message: `Failed to send test email: ${error.message}`,
      };
    }
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified');
      return true;
    } catch (error) {
      this.logger.error(`SMTP connection failed: ${error.message}`);
      return false;
    }
  }
}
