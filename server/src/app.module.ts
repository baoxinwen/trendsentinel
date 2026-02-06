import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { HotsearchModule } from './hotsearch/hotsearch.module';
import { EmailModule } from './email/email.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    // Global configuration module - load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Feature modules
    StorageModule,      // JSON file storage
    AuthModule,         // API Key authentication
    AppConfigModule,    // Email configuration management
    HotsearchModule,    // Hot search data fetching
    EmailModule,        // Email sending service
    SchedulerModule,    // Scheduled tasks
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
