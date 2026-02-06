import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HotsearchController } from './hotsearch.controller';
import { HotsearchService } from './hotsearch.service';

@Module({
  imports: [ConfigModule],
  controllers: [HotsearchController],
  providers: [HotsearchService],
  exports: [HotsearchService],
})
export class HotsearchModule {}
