const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const volumeSlider = document.getElementById('volumeSlider');
const audioContext = new AudioContext();
const icecastUrl = 'http://fluoz.zeno.fm:80/n932reythxhvv/source';

let mediaRecorder;
let audioChunks = [];
let sourceNode;
let gainNode;
let audioStream;

const constraints = { audio: true };

startButton.addEventListener('click', () => {
  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      audioStream = stream;
      startButton.disabled = true;
      stopButton.disabled = false;
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
      });
      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        sourceNode = audioContext.createMediaElementSource(audio);
        gainNode = audioContext.createGain();
        sourceNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        audio.play();
        audioChunks = [];
      });
      mediaRecorder.start();
    })
    .catch(console.error);
});

stopButton.addEventListener('click', () => {
  startButton.disabled = false;
  stopButton.disabled = true;
  mediaRecorder.stop();
  audioStream.getTracks().forEach(track => track.stop());
});

volumeSlider.addEventListener('input', () => {
  if (gainNode) {
    gainNode.gain.value = volumeSlider.value;
  }
});

function sendAudioToIcecast(audioBlob) {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.mp3');

  fetch(icecastUrl, {
    method: 'PUT',
    body: formData,
    headers: {
      'Authorization': 'Basic ' + btoa('source:eenWG5kW'),
    },
  })
    .then(response => {
      if (response.ok) {
        console.log('Audio sent to Icecast successfully!');
      } else {
        console.error('Error sending audio to Icecast.');
      }
    })
    .catch(error => {
      console.error('Error sending audio to Icecast:', error);
    });
}

mediaRecorder.addEventListener('dataavailable', event => {
  sendAudioToIcecast(event.data);
});
