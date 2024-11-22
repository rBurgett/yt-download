interface Window {
  electron: {
    downloadVideo: (url: string) => Promise<string>;
    isValidYouTubeUrl: (url: string) => boolean;
  };
}
