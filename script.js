// Establecer variables de configuración
const server = 'fluoz.zeno.fm';
const port = 80;
const mountPoint = 'n932reythxhvv/source';
const username = 'source';
const password = 'eenWG5kW';
const encoding = 'MP3';

// Obtener elementos del DOM
const volumeSlider = document.getElementById('volumeSlider');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

// Establecer el contexto de audio
const audioCtx = new AudioContext();
const source = audioCtx.createBufferSource();
const gainNode = audioCtx.createGain();
const analyser = audioCtx.createAnalyser();

// Conectar el nodo de ganancia y el analizador al contexto de audio
source.connect(gainNode);
gainNode.connect(analyser);
analyser.connect(audioCtx.destination);

// Establecer la configuración de la solicitud de Icecast
const icecastURL = `http://${server}:${port}/${mountPoint}`;
const icecastRequest = new Request(icecastURL, {
  method: 'PUT',
  headers: {
    'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
    'Content-Type': `audio/${encoding}`,
  },
});

// Iniciar la transmisión de audio
startButton.addEventListener('click', () => {
  navigator.mediaDevices.getUserMedia({audio: true})
    .then((stream) => {
      const audioSource = audioCtx.createMediaStreamSource(stream);
      audioSource.connect(gainNode);
      startButton.disabled = true;
      stopButton.disabled = false;
      return audioCtx.resume();
    })
    .then(() => fetch(icecastRequest))
    .catch((err) => console.error('Error:', err));
});

// Detener la transmisión de audio
stopButton.addEventListener('click', () => {
  gainNode.gain.value = 0;
  startButton.disabled = false;
  stopButton.disabled = true;
  fetch(icecastURL, {method: 'DELETE'});
});
