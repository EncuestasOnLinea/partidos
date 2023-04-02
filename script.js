// Acceder a los elementos del DOM
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const volumeSlider = document.getElementById('volumeSlider');

// Establecer las credenciales de acceso al servidor
const serverAddress = 'fluoz.zeno.fm';
const serverPort = 80;
const mountPoint = 'n932reythxhvv/source';
const username = 'source';
const password = 'eenWG5kW';
const encoding = 'MP3';

// Crear un objeto AudioContext
const audioContext = new AudioContext();

// Crear un nodo de ganancia y establecer el valor inicial
const gainNode = audioContext.createGain();
gainNode.gain.value = volumeSlider.value;

// Crear un nodo de destino para el flujo de audio
const destination = audioContext.createMediaStreamDestination();

// Crear un objeto Recorder y asignarle la fuente de audio
const recorder = new Recorder(gainNode, {
  encoderPath: 'https://cdn.jsdelivr.net/npm/@vocoder-js/mp3@1.1.1/dist/vocoder.min.js'
});
recorder.setDestination(destination);

// Habilitar/deshabilitar botones
toggleButtons(false, true);

// Agregar un controlador de eventos al botón de encendido
startButton.addEventListener('click', () => {
  // Habilitar/deshabilitar botones
  toggleButtons(true, false);

  // Acceder al micrófono del dispositivo
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      // Crear un nodo de origen para el flujo de audio
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(gainNode);
      gainNode.connect(destination);

      // Establecer los parámetros de configuración del objeto Recorder
      recorder.config.sampleRate = audioContext.sampleRate;
      recorder.config.channels = 1;
      recorder.config.format = encoding;
      
      // Conectar el nodo de ganancia al objeto Recorder
      recorder.record();

      // Transmitir el audio al servidor
      const audioElement = document.createElement('audio');
      audioElement.srcObject = destination.stream;
      audioElement.controls = true;
      audioElement.autoplay = true;
      document.body.appendChild(audioElement);
      audioElement.play();
      
      // Crear un objeto ICEcast y establecer las credenciales de acceso
      const icecast = new Icecast({
        server: serverAddress,
        port: serverPort,
        mount: mountPoint,
        username: username,
        password: password,
        format: encoding,
        name: 'My Stream',
        url: 'https://www.example.com/stream',
        genre: 'Misc',
        description: 'My awesome stream'
      });

      // Conectar el objeto Recorder al servidor
      icecast.on('ready', () => {
        recorder.stream().pipe(icecast);
      });
    })
    .catch(error => {
      console.error(error);
      // Habilitar/deshabilitar botones
      toggleButtons(false, true);
    });
});

// Agregar un controlador de eventos al botón de apagado
stopButton.addEventListener('click', () => {
  // Habilitar/deshabilitar botones
  toggleButtons(false, true);

  // Detener la grabación
  recorder.stop();
  
  // Detener la transmisión
  icecast.on('end', () => {
    icecast.disconnect();
  });
});

// Agregar un controlador de eventos al control deslizante de volumen
volumeSlider.addEventListener('input', function(e) {
// Establecer el volumen del objeto de audio en función del valor del control deslizante
audioElement.volume = e.target.value;
});

// Agregar un controlador de eventos al botón "Encender"
startButton.addEventListener('click', function() {
// Habilitar/deshabilitar botones
toggleButtons(false, true);

// Obtener la secuencia de audio del servidor
var streamUrl = 'http://' + serverAddress + ':' + serverPort + '/' + mountPoint;

// Configurar el objeto de audio con la secuencia de audio
audioElement.src = streamUrl;
audioElement.type = 'audio/' + encoding;

// Autenticar con el servidor
var authString = btoa(username + ':' + password);
audioElement.setRequestHeader('Authorization', 'Basic ' + authString);

// Comenzar a reproducir la secuencia de audio
audioElement.play();
});

// Agregar un controlador de eventos al botón "Apagar"
stopButton.addEventListener('click', function() {
// Habilitar/deshabilitar botones
toggleButtons(true, false);

// Detener la reproducción de la secuencia de audio
audioElement.pause();
});

// Función para habilitar/deshabilitar los botones de "Encender" y "Apagar"
function toggleButtons(start, stop) {
startButton.disabled = !start;
stopButton.disabled = !stop;
}
