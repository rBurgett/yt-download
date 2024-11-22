interface Window {
  electron: {
    downloadVideo: (url: string) => Promise<string>;
    getClipboardContents: () => string;
  };
}
