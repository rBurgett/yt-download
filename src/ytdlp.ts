import { exec } from 'child_process';
import path from 'path';
import { IncomingMessage } from 'http';
import https from 'https';
import fs from 'fs';
import { EventEmitter } from 'events';

export enum YTDLPEvent {
  DownloadProgress = 'download-progress',
}

export class YTDLP extends EventEmitter {

  static getDownloadPath(): string {
    const { platform } = process;
    if (platform === 'win32') {
      return 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
    }
    return 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux';
  }

  static getFilename(): string {
    return 'yt-dlp';
  }

  static getExtname(): string {
    const { platform } = process;
    if (platform === 'win32') {
      return '.exe';
    }
    return '';
  }

  appDataDir: string;
  filePath: string|null = null;

  constructor(appDataDir: string) {
    super();
    this.appDataDir = appDataDir;
  }

  private async isInstalledByFilePath(filePath: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      exec(`"${filePath}" --version`, (error) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  private getLocalFilePath(): string {
    return path.join(this.appDataDir, `${YTDLP.getFilename()}${YTDLP.getExtname()}`);
  }

  async isInstalled(): Promise<boolean> {
    const globalFile = YTDLP.getFilename();
    const isInPath = await this.isInstalledByFilePath(globalFile);
    if (isInPath) {
      this.filePath = globalFile;
      return true;
    }
    const localFile = this.getLocalFilePath();
    this.filePath = localFile;
    return await this.isInstalledByFilePath(localFile);
  }

  getFilePath(): string {
    if (this.filePath === null) {
      throw new Error('You must first run isInstalled() before calling getFilePath()');
    }
    return this.filePath;
  }

  private async downloadInternal(filePath: string, downloadPath: string, maxRedirects = 3): Promise<void> {
    const response = await new Promise<IncomingMessage>((resolve, reject) => {
      https.get(downloadPath, async (res) => {
        resolve(res);
      });
    });
    if ([301, 302, 307, 308].includes(response.statusCode)) {
      if (maxRedirects === 0) {
        throw new Error('Too many redirects');
      }
      const redirectUrl = response.headers.location;
      return await this.downloadInternal(filePath, redirectUrl, maxRedirects - 1);
    }

    const totalSize = parseInt(response.headers['content-length'], 10);
    let downloadedSize = 0;

    await new Promise<void>((resolve, reject) => {
      const fileStream = fs.createWriteStream(filePath);
      response.on('data', chunk => {
        downloadedSize += chunk.length;
        const percentage = ((downloadedSize / totalSize) * 100).toFixed(2);
        this.emit(YTDLPEvent.DownloadProgress, `${percentage}%`);
      });

      fileStream.on('finish', () => {
        resolve();
      });

      response.on('error', err => {
        reject(err);
      });

      fileStream.on('error', err => {
        reject(err);
      });
      response.pipe(fileStream);
    });
  }

  private async fixFilePermissions(filePath: string) {
    return new Promise<void>((resolve, reject) => {
      if (process.platform !== 'linux') {
        return resolve();
      }
      exec(`chmod +x '${filePath}'`, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async download(): Promise<void> {
    const filePath = this.getLocalFilePath();
    await this.downloadInternal(filePath, YTDLP.getDownloadPath());
    await this.fixFilePermissions(filePath);
  }

}
