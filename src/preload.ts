import { ipcRenderer } from 'electron';
import { IpcEvent, LocalStorageKey, UiMode } from './constants';

document.addEventListener('DOMContentLoaded', () => {
  const selectedTheme = getTheme();
  setTheme(selectedTheme);
  ipcRenderer.send(IpcEvent.UiModeSet, selectedTheme);
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
