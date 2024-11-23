import { contextBridge, ipcRenderer } from 'electron';
import { IpcEvent, LocalStorageKey, UiMode } from './constants';

document.addEventListener('DOMContentLoaded', () => {
  const selectedTheme = getTheme();
  setTheme(selectedTheme);

  const version = ipcRenderer.sendSync(IpcEvent.GetVersion) as string;
  document.title = `YT Download v${version}`;

  ipcRenderer.send(IpcEvent.UiModeSet, selectedTheme);
  getClipboardContents()
    .then(text => {
      if (isValidYouTubeUrl(text)) {
        const input = document.querySelector('#js-urlInput') as HTMLInputElement;
        input.value = text;
      }
    });
});

ipcRenderer.on(IpcEvent.SetUiMode, (_, arg: UiMode) => {
  setTheme(arg);
  saveTheme(arg);
});

function setTheme(theme: UiMode): void {
  const htmlElem = document.querySelector('html');
  if (htmlElem) {
    htmlElem.setAttribute('data-theme', theme);
  }
}

function getTheme(): UiMode {
  const theme = localStorage.getItem(LocalStorageKey.UiMode) || UiMode.Business;
  return theme as UiMode;
}

function saveTheme(theme: UiMode): void {
  localStorage.setItem(LocalStorageKey.UiMode, theme);
}

async function downloadVideo(url: string): Promise<void> {
  return await ipcRenderer.invoke(IpcEvent.StartDownload, url);
}

contextBridge.exposeInMainWorld('electron', {
  downloadVideo,
  isValidYouTubeUrl,
});

ipcRenderer.on(IpcEvent.DownloadProgress, (_, arg: string) => {
  const input = document.querySelector('#js-urlInput') as HTMLInputElement;
  input.value = arg;
});

async function getClipboardContents(): Promise<string> {
  return await ipcRenderer.invoke(IpcEvent.GetClipboardText);
}

function isValidYouTubeUrl(url: string): boolean {
  return /^https:\/\/.*?youtube\.com/.test(url);
}
