// Obtener los resultados almacenados en el local storage, o crear un objeto vacío si no hay resultados previos
var resultados = JSON.parse(localStorage.getItem("resultados")) || {
  morena: { votos: 0, porcentaje: 0 },
  verde: { votos: 0, porcentaje: 0 },
  pri: { votos: 0, porcentaje: 0 },
  pan: { votos: 0, porcentaje: 0 },
  psi: { votos: 0, porcentaje: 0 }
};

// Función para actualizar los recuentos de votos y porcentajes
function actualizarResultados() {
  // Obtener el número total de votos
  var totalVotos = Object.values(resultados).reduce(function(total, partido) {
    return total + partido.votos;
  }, 0);

  // Actualizar los recuentos de votos y porcentajes para cada partido
  $.each(resultados, function(partido, datos) {
    var votos = datos.votos;
    var porcentaje = (votos / totalVotos * 100).toFixed(2) + "%";
    $("#" + partido + "-count").text(votos);
    $("#" + partido + "-percentage").text(porcentaje);
  });

  // Guardar los resultados actualizados en el local storage
  localStorage.setItem("resultados", JSON.stringify(resultados));
}

// Función para votar por un partido
function vote(partido) {
  // Incrementar el recuento de votos para el partido correspondiente
  resultados[partido].votos++;
  // Actualizar los recuentos de votos y porcentajes
  actualizarResultados();
}

// Esperar a que el documento esté listo
$(document).ready(function() {
  // Actualizar los recuentos de votos y porcentajes al cargar la página
  actualizarResultados();
});



