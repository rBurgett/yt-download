export enum IpcEvent {
  SetUiMode = 'set-ui-mode',
  UiModeSet = 'ui-mode-set',
  StartDownload = 'start-download',
  DownloadProgress = 'download-progress',
  GetClipboardText = 'get-clipboard-text',
  GetVersion = 'get-version',
}

export enum LocalStorageKey {
  UiMode = 'ui-mode',
}

export enum UiMode {
  Corporate = 'corporate',
  Business = 'business',
  Synthwave = 'synthwave'
}

export enum DownloadEvent {
  Info = 'info',
  Error = 'error',
  Done = 'done',
}
