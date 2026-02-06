import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { HotsearchModule } from '../hotsearch/hotsearch.module';
import { ConfigModule as AppConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule, HotsearchModule, AppConfigModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
