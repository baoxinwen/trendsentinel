import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { ConfigService } from '../config/config.service';
import { EmailService } from '../email/email.service';

/**
 * Scheduler service for managing dynamic cron jobs
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Update daily job schedule based on config
   */
  async updateDailySchedule(): Promise<void> {
    const config = await this.configService.getEmailConfig();
    const [hours, minutes] = config.sendTime.split(':').map(Number);
    const cronExpression = `${minutes} ${hours} * * *`;

    // Delete existing daily job if present
    if (this.schedulerRegistry.getCronJob('dailyHotSearchReport')) {
      this.deleteCronJob('dailyHotSearchReport');
    }

    // Create new cron job
    const job = new CronJob(cronExpression, async () => {
      try {
        if (!config.enabled || config.frequency !== 'daily') {
          return;
        }

        this.logger.log('Running daily hot search report...');
        const result = await this.emailService.sendHotSearchReport();

        if (result.success) {
          this.logger.log(`Daily report sent: ${result.message}`);
        } else {
          this.logger.warn(`Daily report failed: ${result.message}`);
        }
      } catch (error) {
        this.logger.error(`Error in daily job: ${error.message}`, error.stack);
      }
    });

    this.schedulerRegistry.addCronJob('dailyHotSearchReport', job);
    job.start();

    this.logger.log(`Daily job updated to run at: ${config.sendTime} (${cronExpression})`);
  }

  /**
   * Add a custom cron job
   */
  addCronJob(name: string, cronExpression: string, callback: () => void): void {
    const job = new CronJob(cronExpression, callback);

    try {
      this.schedulerRegistry.addCronJob(name, job);
      job.start();
      this.logger.log(`Cron job '${name}' added with expression: ${cronExpression}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        this.logger.warn(`Cron job '${name}' already exists, deleting and re-adding...`);
        this.deleteCronJob(name);
        this.schedulerRegistry.addCronJob(name, job);
        job.start();
      } else {
        throw error;
      }
    }
  }

  /**
   * Delete a cron job
   */
  deleteCronJob(name: string): void {
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      if (job) {
        job.stop();
        this.schedulerRegistry.deleteCronJob(name);
        this.logger.log(`Cron job '${name}' deleted`);
      }
    } catch (error) {
      this.logger.warn(`Failed to delete cron job '${name}': ${error.message}`);
    }
  }

  /**
   * List all cron jobs
   */
  listCronJobs(): string[] {
    const jobs = this.schedulerRegistry.getCronJobs();
    return Array.from(jobs.keys());
  }

  /**
   * Get status of all jobs
   */
  getJobsStatus(): Record<string, { running: boolean; nextDate?: string }> {
    const jobs = this.schedulerRegistry.getCronJobs();
    const status: Record<string, { running: boolean; nextDate?: string }> = {};

    jobs.forEach((job, name) => {
      const nextDate = job.nextDate();
      status[name] = {
        running: job.running,
        nextDate: nextDate ? nextDate.toString() : undefined,
      };
    });

    return status;
  }
}
