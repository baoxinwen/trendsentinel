import { Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EmailService } from '../../email/email.service';
import { ConfigService } from '../../config/config.service';

/**
 * Daily hot search report job
 * Runs at configured time (default 9:00 AM)
 */
export class DailyJob {
  private readonly logger = new Logger(DailyJob.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Calculate cron expression from HH:mm time format
   */
  private getCronExpression(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    return `${minutes} ${hours} * * *`;
  }

  /**
   * Create dynamic cron job based on configured send time
   */
  async createDynamicJob() {
    const config = await this.configService.getEmailConfig();
    const cronExpression = this.getCronExpression(config.sendTime);

    this.logger.log(`Daily job scheduled for: ${config.sendTime} (${cronExpression})`);

    // Note: Dynamic cron scheduling requires additional setup
    // For now, we use a default 9:00 AM schedule
    return cronExpression;
  }

  @Cron('0 9 * * *', {
    name: 'dailyHotSearchReport',
    timeZone: 'Asia/Shanghai',
  })
  async handleDailyJob() {
    try {
      const config = await this.configService.getEmailConfig();

      if (!config.enabled || config.frequency !== 'daily') {
        return;
      }

      // Check if current time matches configured send time
      const [configuredHour] = config.sendTime.split(':').map(Number);
      const currentHour = new Date().getHours();

      if (currentHour !== configuredHour) {
        return;
      }

      this.logger.log('Starting daily hot search report...');

      const result = await this.emailService.sendHotSearchReport();

      if (result.success) {
        this.logger.log(`Daily report sent: ${result.message}`);
      } else {
        this.logger.warn(`Daily report failed: ${result.message}`);
      }
    } catch (error) {
      this.logger.error(`Error in daily job: ${error.message}`, error.stack);
    }
  }
}
