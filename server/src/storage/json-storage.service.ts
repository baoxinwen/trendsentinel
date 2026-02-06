import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

export interface JsonStorageOptions {
  maxBackups?: number;
  encoding?: BufferEncoding;
}

interface LockFile {
  pid: number;
  timestamp: number;
}

@Injectable()
export class JsonStorageService implements OnModuleInit {
  private readonly logger = new Logger(JsonStorageService.name);
  private readonly dataDir: string;
  private readonly maxBackups: number = 5;
  private readonly locks = new Map<string, LockFile>();

  constructor(private configService: ConfigService) {
    this.dataDir = this.configService.get<string>('DATA_DIR', './data');
  }

  async onModuleInit() {
    // Ensure data directory exists
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      this.logger.log(`Data directory initialized: ${this.dataDir}`);
    } catch (error) {
      this.logger.error(`Failed to create data directory: ${error.message}`);
    }
  }

  /**
   * Read JSON data from a file
   */
  async read<T>(filename: string, defaultValue: T): Promise<T> {
    const filePath = this.getFilePath(filename);

    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return default value
        await this.write(filename, defaultValue);
        return defaultValue;
      }
      throw error;
    }
  }

  /**
   * Write JSON data to a file with backup
   */
  async write<T>(filename: string, data: T): Promise<void> {
    const filePath = this.getFilePath(filename);

    try {
      // Acquire lock
      await this.acquireLock(filename);

      // Create backup if file exists
      try {
        await fs.access(filePath);
        await this.createBackup(filename);
      } catch {
        // File doesn't exist, no backup needed
      }

      // Write new data
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

      this.logger.debug(`Data saved to ${filename}`);
    } finally {
      // Release lock
      await this.releaseLock(filename);
    }
  }

  /**
   * Update JSON data with a merge function
   */
  async update<T>(
    filename: string,
    updateFn: (current: T) => T | Promise<T>,
    defaultValue: T,
  ): Promise<T> {
    const current = await this.read(filename, defaultValue);
    const updated = await updateFn(current);
    await this.write(filename, updated);
    return updated;
  }

  /**
   * Delete a JSON file
   */
  async delete(filename: string): Promise<void> {
    const filePath = this.getFilePath(filename);

    try {
      // Create backup before deleting
      await this.createBackup(filename);
      await fs.unlink(filePath);
      this.logger.debug(`Deleted ${filename}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Check if a file exists
   */
  async exists(filename: string): Promise<boolean> {
    const filePath = this.getFilePath(filename);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List all backup files for a given filename
   */
  async listBackups(filename: string): Promise<string[]> {
    const basePath = this.getFilePath(filename);
    const dir = path.dirname(basePath);
    const baseName = path.basename(basePath);
    const backupPattern = new RegExp(`^${baseName}\\.(\\d{14})\\.bak$`);

    try {
      const files = await fs.readdir(dir);
      return files
        .filter((file) => backupPattern.test(file))
        .sort()
        .reverse();
    } catch {
      return [];
    }
  }

  /**
   * Restore from a backup file
   */
  async restoreBackup(filename: string, backupFilename: string): Promise<void> {
    const backupPath = path.join(path.dirname(this.getFilePath(filename)), backupFilename);
    const targetPath = this.getFilePath(filename);

    await fs.copyFile(backupPath, targetPath);
    this.logger.log(`Restored ${filename} from ${backupFilename}`);
  }

  /**
   * Clean up old backups (keep only maxBackups)
   */
  async cleanOldBackups(filename: string): Promise<void> {
    const backups = await this.listBackups(filename);

    if (backups.length > this.maxBackups) {
      const toDelete = backups.slice(this.maxBackups);
      for (const backup of toDelete) {
        const backupPath = path.join(path.dirname(this.getFilePath(filename)), backup);
        await fs.unlink(backupPath);
        this.logger.debug(`Deleted old backup: ${backup}`);
      }
    }
  }

  private getFilePath(filename: string): string {
    return path.join(this.dataDir, filename.endsWith('.json') ? filename : `${filename}.json`);
  }

  private async createBackup(filename: string): Promise<void> {
    const filePath = this.getFilePath(filename);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, -5);
    const backupPath = `${filePath}.${timestamp}.bak`;

    try {
      await fs.copyFile(filePath, backupPath);
      await this.cleanOldBackups(filename);
      this.logger.debug(`Backup created: ${backupPath}`);
    } catch (error) {
      this.logger.warn(`Failed to create backup: ${error.message}`);
    }
  }

  private async acquireLock(filename: string): Promise<void> {
    const lockPath = this.getFilePath(`${filename}.lock`);
    const maxWaitTime = 5000; // 5 seconds
    const checkInterval = 100;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        // Try to create lock file exclusively
        const lockData: LockFile = {
          pid: process.pid,
          timestamp: Date.now(),
        };
        await fs.writeFile(lockPath, JSON.stringify(lockData), { flag: 'wx' });
        this.locks.set(filename, lockData);
        return;
      } catch (error) {
        if (error.code === 'EEXIST') {
          // Check if lock is stale
          try {
            const lockData = JSON.parse(await fs.readFile(lockPath, 'utf-8')) as LockFile;
            const age = Date.now() - lockData.timestamp;
            if (age > 30000) {
              // Lock is older than 30 seconds, consider it stale
              await fs.unlink(lockPath);
              continue;
            }
          } catch {
            // Invalid lock file, delete and retry
            await fs.unlink(lockPath).catch(() => {});
            continue;
          }
          // Lock is held by another process, wait
          await new Promise((resolve) => setTimeout(resolve, checkInterval));
        } else {
          throw error;
        }
      }
    }

    throw new Error(`Could not acquire lock for ${filename} after ${maxWaitTime}ms`);
  }

  private async releaseLock(filename: string): Promise<void> {
    const lockPath = this.getFilePath(`${filename}.lock`);
    try {
      await fs.unlink(lockPath);
      this.locks.delete(filename);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.warn(`Failed to release lock for ${filename}: ${error.message}`);
      }
    }
  }
}
