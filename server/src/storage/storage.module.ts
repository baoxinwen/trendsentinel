import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JsonStorageService } from './json-storage.service';
import { StorageService } from './storage.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [JsonStorageService, StorageService],
  exports: [JsonStorageService, StorageService],
})
export class StorageModule {}
