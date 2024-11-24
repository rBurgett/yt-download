/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

console.log('👋 This message is being logged by "renderer.js", included via webpack');

const form = document.querySelector('#js-urlForm') as HTMLFormElement;
form.addEventListener('submit', async e => {
  e.preventDefault();
  const input = getInput();
  const submitButton = getSubmitButton();
  const url = input.value;
  try {
    if (!window.electron.isValidYouTubeUrl(url)) {
      throw new Error('Invalid URL');
    }
    input.readOnly = true;
    submitButton.disabled = true;
    const filename = await window.electron.downloadVideo(url);
    input.readOnly = false;
    submitButton.disabled = false;
    if (filename) {
      input.value = '';
      alert(`Successfully downloaded: ${filename}`);
    }
  } catch(err) {
    input.value = url;
    input.readOnly = false;
    submitButton.disabled = false;
    alert(`Oops! ${err}`);
  }
});

function getInput(): HTMLInputElement {
  return document.querySelector('#js-urlInput') as HTMLInputElement;
}

function getSubmitButton(): HTMLButtonElement {
  return document.querySelector('#js-submitButton') as HTMLButtonElement;
}
