import { Injectable } from '@nestjs/common';
import { JsonStorageService } from './json-storage.service';

@Injectable()
export class StorageService {
  constructor(private readonly jsonStorage: JsonStorageService) {}

  /**
   * Read any data from JSON file
   */
  async read<T>(filename: string, defaultValue: T): Promise<T> {
    return this.jsonStorage.read(filename, defaultValue);
  }

  /**
   * Write any data to JSON file
   */
  async write<T>(filename: string, data: T): Promise<void> {
    return this.jsonStorage.write(filename, data);
  }

  /**
   * Update data with a merge function
   */
  async update<T>(
    filename: string,
    updateFn: (current: T) => T | Promise<T>,
    defaultValue: T,
  ): Promise<T> {
    return this.jsonStorage.update(filename, updateFn, defaultValue);
  }

  /**
   * Delete a JSON file
   */
  async delete(filename: string): Promise<void> {
    return this.jsonStorage.delete(filename);
  }

  /**
   * Check if a file exists
   */
  async exists(filename: string): Promise<boolean> {
    return this.jsonStorage.exists(filename);
  }

  /**
   * List backups for a file
   */
  async listBackups(filename: string): Promise<string[]> {
    return this.jsonStorage.listBackups(filename);
  }

  /**
   * Restore from backup
   */
  async restoreBackup(filename: string, backupFilename: string): Promise<void> {
    return this.jsonStorage.restoreBackup(filename, backupFilename);
  }
}
