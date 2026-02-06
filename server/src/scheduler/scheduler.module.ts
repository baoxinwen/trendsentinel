import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { HourlyJob } from './jobs/hourly.job';
import { DailyJob } from './jobs/daily.job';
import { WeeklyJob } from './jobs/weekly.job';
import { EmailModule } from '../email/email.module';
import { ConfigModule as AppConfigModule } from '../config/config.module';

@Module({
  imports: [ScheduleModule.forRoot(), EmailModule, AppConfigModule],
  providers: [SchedulerService, HourlyJob, DailyJob, WeeklyJob],
  exports: [SchedulerService],
})
export class SchedulerModule {}
