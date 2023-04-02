const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const volumeSlider = document.getElementById('volumeSlider');

const serverAddress = 'fluoz.zeno.fm';
const port = '80';
const mountPoint = 'n932reythxhvv/source';
const username = 'source';
const password = 'eenWG5kW';
const encoding = 'mp3';

let mediaRecorder;
let recordedChunks = [];
let audioStream;

startButton.addEventListener('click', async () => {
  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(audioStream, { mimeType: `audio/${encoding}` });

    mediaRecorder.addEventListener('dataavailable', event => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    });

    mediaRecorder.addEventListener('stop', () => {
      const audioBlob = new Blob(recordedChunks, { type: `audio/${encoding}` });
      const audioUrl = URL.createObjectURL(audioBlob);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `http://${serverAddress}:${port}/${mountPoint}`);
      xhr.setRequestHeader('Authorization', `Basic ${btoa(`${username}:${password}`)}`);
      xhr.send(audioBlob);

      recordedChunks = [];
      URL.revokeObjectURL(audioUrl);
    });

    mediaRecorder.start();
    startButton.disabled = true;
    stopButton.disabled = false;
    volumeSlider.disabled = true;
  } catch (err) {
    console.error(err);
  }
});

stopButton.addEventListener('click', () => {
  mediaRecorder.stop();
  startButton.disabled = false;
  stopButton.disabled = true;
  volumeSlider.disabled = false;
  audioStream.getTracks().forEach(track => track.stop());
});
