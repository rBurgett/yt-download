import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import { DownloadEvent } from './constants';

export class Downloader extends EventEmitter {

  start(ytdlpFilePath: string, url: string, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cp = spawn(
        ytdlpFilePath,
        [
          '-S', 'res:1080,ext:mp4',
          '-o', filePath,
          url
        ]
      );

      cp.stdout.on('data', (data) => {
        this.emit(DownloadEvent.Info, data.toString());
      });

      cp.stderr.on('data', (data) => {
        this.emit(DownloadEvent.Error, data.toString());
      });

      cp.on('close', (code) => {
        this.emit(DownloadEvent.Done, code);
        if (code == 0) {
          resolve();
        } else {
          reject(new Error(`Failed with status code ${code}`));
        }
      });
    });
  }

}
