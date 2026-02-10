import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from '../../email/email.service';
import { ConfigService } from '../../config/config.service';

/**
 * Weekly hot search report job
 * Runs every Monday at 9:00 AM
 */
@Injectable()
export class WeeklyJob {
  private readonly logger = new Logger(WeeklyJob.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.logger.log('WeeklyJob initialized');
  }

  @Cron(CronExpression.EVERY_WEEK, {
    name: 'weeklyHotSearchReport',
    timeZone: 'Asia/Shanghai',
  })
  async handleWeeklyJob() {
    try {
      const config = await this.configService.getEmailConfig();

      if (!config.enabled || config.frequency !== 'weekly') {
        return;
      }

      this.logger.log('Starting weekly hot search report...');

      const result = await this.emailService.sendHotSearchReport({
        subject: 'TrendMonitor - 周报',
      });

      if (result.success) {
        this.logger.log(`Weekly report sent: ${result.message}`);
      } else {
        this.logger.warn(`Weekly report failed: ${result.message}`);
      }
    } catch (error) {
      this.logger.error(`Error in weekly job: ${error.message}`, error.stack);
    }
  }
}
