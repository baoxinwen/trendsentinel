import { Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from '../../email/email.service';
import { ConfigService } from '../../config/config.service';

/**
 * Hourly hot search report job
 * Runs every hour at the top of the hour
 */
export class HourlyJob {
  private readonly logger = new Logger(HourlyJob.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyJob() {
    try {
      const config = await this.configService.getEmailConfig();

      if (!config.enabled || config.frequency !== 'hourly') {
        return;
      }

      this.logger.log('Starting hourly hot search report...');

      const result = await this.emailService.sendHotSearchReport();

      if (result.success) {
        this.logger.log(`Hourly report sent: ${result.message}`);
      } else {
        this.logger.warn(`Hourly report failed: ${result.message}`);
      }
    } catch (error) {
      this.logger.error(`Error in hourly job: ${error.message}`, error.stack);
    }
  }
}
