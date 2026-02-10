import { Injectable, Logger } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { EmailConfigDto } from './dto/email-config.dto';

const DEFAULT_EMAIL_CONFIG: EmailConfigDto = {
  recipients: [],
  frequency: 'daily',
  sendTime: '09:00',
  enabled: false,
  platforms: undefined,
  minScore: undefined,
  keyword: undefined,
};

const CONFIG_FILENAME = 'email-config';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(private readonly storage: StorageService) {}

  /**
   * Get email configuration
   */
  async getEmailConfig(): Promise<EmailConfigDto> {
    try {
      const config = await this.storage.read<EmailConfigDto>(
        CONFIG_FILENAME,
        DEFAULT_EMAIL_CONFIG,
      );
      return config;
    } catch (error) {
      this.logger.error(`Failed to read email config: ${error.message}`);
      return { ...DEFAULT_EMAIL_CONFIG };
    }
  }

  /**
   * Update email configuration (partial update)
   */
  async updateEmailConfig(updates: Partial<EmailConfigDto>): Promise<EmailConfigDto> {
    try {
      const updated = await this.storage.update(
        CONFIG_FILENAME,
        (current) => {
          return {
            ...current,
            ...updates,
          };
        },
        DEFAULT_EMAIL_CONFIG,
      );

      this.logger.log(`Email config updated: ${JSON.stringify(updates)}`);
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update email config: ${error.message}`);
      throw error;
    }
  }

  /**
   * Replace entire email configuration
   */
  async setEmailConfig(config: EmailConfigDto): Promise<EmailConfigDto> {
    try {
      await this.storage.write(CONFIG_FILENAME, config);
      this.logger.log(`Email config set: ${JSON.stringify(config)}`);
      return config;
    } catch (error) {
      this.logger.error(`Failed to set email config: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reset email configuration to defaults
   */
  async resetEmailConfig(): Promise<EmailConfigDto> {
    return this.setEmailConfig({ ...DEFAULT_EMAIL_CONFIG });
  }
}
