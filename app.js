// Variables globales
var nombreJugador;
var tiempoJuego;
var temporizador;
var puntaje;
var palabraActual;
var palabrasEncontradas;
var letrasSeleccionadas;

// Elementos del DOM
var formInicio = document.getElementById("formulario-inicio");
var seccionInicio = document.getElementById("inicio-juego");
var seccionJuego = document.getElementById("juego");
var seccionFinJuego = document.getElementById("fin-juego");
var seccionResultados = document.getElementById("resultados-boggle");

var spanNombreJugador = document.getElementById("nombre-jugador-actual");
var spanTemporizador = document.getElementById("temporizador");
var spanPuntaje = document.getElementById("puntaje");
var divTablero = document.getElementById("tablero");
var inputPalabraActual = document.getElementById("palabra-actual");
var btnEnviarPalabra = document.getElementById("enviar-palabra");
var listaPalabras = document.getElementById("lista-palabras");
var spanPuntajeFinal = document.getElementById("puntaje-final");
var btnJugarNuevamente = document.getElementById("jugar-nuevamente");
var btnVerResultados = document.getElementById("ver-resultados");
var btnVolverInicio = document.getElementById("volver-inicio");

var modal = document.getElementById("modal");
var modalTitulo = document.getElementById("modal-titulo");
var modalMensaje = document.getElementById("modal-mensaje");
var btnCerrarModal = document.getElementById("modal-cerrar");

// Event Listeners
formInicio.addEventListener("submit", iniciarJuego);
btnEnviarPalabra.addEventListener("click", enviarPalabra);
btnJugarNuevamente.addEventListener("click", reiniciarJuego);
btnVerResultados.addEventListener("click", mostrarResultados);
btnVolverInicio.addEventListener("click", volverAlInicio);
btnCerrarModal.addEventListener("click", cerrarModal);

function iniciarJuego(e) {
  e.preventDefault();
  nombreJugador = document.getElementById("nombre-jugador").value;
  tiempoJuego = parseInt(document.getElementById("tiempo-juego").value);

  if (nombreJugador.length < 3) {
    mostrarModal(
      "Error",
      "El nombre del jugador debe tener al menos 3 letras."
    );
    return;
  }

  puntaje = 0;
  palabrasEncontradas = [];
  letrasSeleccionadas = [];

  spanNombreJugador.textContent = nombreJugador;
  spanPuntaje.textContent = puntaje;
  listaPalabras.innerHTML = "";

  generarTablero();
  iniciarTemporizador();

  seccionInicio.classList.add("oculto");
  seccionJuego.classList.remove("oculto");
}

function generarTablero() {
  var vocales = "AEIOU";
  var consonantes = "BCDFGHJKLMNPQRSTVWXYZ";
  var tablero = [[], [], [], []];
  var letras = [];

  var cantidadVocales = 6;
  var cantidadConsonantes = 10;

  for (var i = 0; i < cantidadVocales; i++) {
    letras.push(obtenerLetraAleatoria(vocales));
  }

  for (var i = 0; i < cantidadConsonantes; i++) {
    letras.push(obtenerLetraAleatoria(consonantes));
  }

  letras.sort(function () {
    return 0.5 - Math.random();
  });

  for (var i = 0; i < tablero.length; i++) {
    for (var j = 0; j < 4; j++) {
      tablero[i][j] = letras.pop();
    }
  }

  var columnasTablero = document.querySelectorAll(".columna-tablero");
  columnasTablero.forEach(function (columna, indice) {
    columna.innerHTML = "";
    columna.dataset.columna = indice;

    for (var i = 0; i < 4; i++) {
      var letra = tablero[i][indice];

      var letraDiv = document.createElement("div");
      letraDiv.className = "letra";
      letraDiv.textContent = letra;
      letraDiv.dataset.fila = i;
      letraDiv.dataset.columna = indice;
      letraDiv.addEventListener("click", seleccionarLetra);

      columna.appendChild(letraDiv);
    }
  });
}

function obtenerLetraAleatoria(letras) {
  return letras.charAt(Math.floor(Math.random() * letras.length));
}

function seleccionarLetra(event) {
  var letraDiv = event.target;

  var fila = parseInt(letraDiv.dataset.fila);
  var columna = parseInt(letraDiv.dataset.columna);

  var indiceLetra = letrasSeleccionadas.findIndex(function (item) {
    return item.fila === fila && item.columna === columna;
  });

  if (indiceLetra >= 0) {
    letrasSeleccionadas.splice(indiceLetra, 1);
    letraDiv.classList.remove("seleccionada");
    actualizarUltimaSeleccionada();
  } else {
    // Si la letra no está seleccionada, verifica si es contigua
    if (!esLetraContigua(fila, columna)) {
      return;
    }
    // Si la letra es contigua, la selecciona
    letrasSeleccionadas.push({
      letra: letraDiv.textContent,
      fila: fila,
      columna: columna,
    });

    letraDiv.classList.add("seleccionada");
    actualizarUltimaSeleccionada();
  }

  inputPalabraActual.value = letrasSeleccionadas
    .map(function (item) {
      return item.letra;
    })
    .join("");
}

function actualizarUltimaSeleccionada() {
  var ultimaSeleccionadaAnterior = document.querySelector(
    ".ultima-seleccionada"
  );
  if (ultimaSeleccionadaAnterior) {
    ultimaSeleccionadaAnterior.classList.remove("ultima-seleccionada");
  }

  if (letrasSeleccionadas.length > 0) {
    var ultimaSeleccionadaActual =
      letrasSeleccionadas[letrasSeleccionadas.length - 1];
    var selector = `.columna-tablero[data-columna="${ultimaSeleccionadaActual.columna}"] .letra[data-fila="${ultimaSeleccionadaActual.fila}"]`;
    var ultimaLetraDiv = document.querySelector(selector);
    if (ultimaLetraDiv) {
      ultimaLetraDiv.classList.add("ultima-seleccionada");
    }
  }
}

function enviarPalabra() {
  var palabra = inputPalabraActual.value.toLowerCase();

  if (palabra.length < 3) {
    mostrarModal("Error", "La palabra debe tener al menos 3 letras.");
    reiniciarTablero();
    return;
  }

  if (palabrasEncontradas.includes(palabra)) {
    mostrarModal("Error", "Esta palabra ya ha sido encontrada.");
    reiniciarTablero();
    return;
  }

  validarPalabraExistente(palabra)
    .then(function (esValida) {
      if (!esValida) {
        mostrarModal("Error", "Esta palabra no es válida.");
        reiniciarTablero();
        puntaje--;
        spanPuntaje.textContent = puntaje;
        return;
      }

      palabrasEncontradas.push(palabra);
      var puntos = calcularPuntos(palabra.length);
      puntaje += puntos;
      spanPuntaje.textContent = puntaje;

      var li = document.createElement("li");
      li.textContent = palabra + " (" + puntos + " puntos)";
      listaPalabras.appendChild(li);

      letrasSeleccionadas = [];
      inputPalabraActual.value = "";

      var letrasSeleccionadasDOM = document.querySelectorAll(
        ".letra.seleccionada"
      );
      letrasSeleccionadasDOM.forEach(function (letra) {
        letra.classList.remove("seleccionada");
        letra.classList.remove("ultima-seleccionada");
      });
    })
    .catch(function (error) {
      mostrarModal("Error", "Hubo un problema al validar la palabra.");
      console.error(error);
      reiniciarTablero();
    });
}

async function validarPalabraExistente(palabra) {
  var url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + palabra;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data && data.length > 0;
  } catch (error) {
    console.error("Error al validar la palabra:", error);
    return false;
  }
}

function esLetraContigua(fila, columna) {
  var ultimaLetra = letrasSeleccionadas[letrasSeleccionadas.length - 1];

  if (!ultimaLetra) {
    return true; //permite seleccionar la letra si no hay ninguna seleccionada
  }

  var filaAnterior = ultimaLetra.fila;
  var columnaAnterior = ultimaLetra.columna;

  return (
    Math.abs(fila - filaAnterior) <= 1 &&
    Math.abs(columna - columnaAnterior) <= 1
  );
}

function calcularPuntos(longitudPalabra) {
  if (longitudPalabra >= 8) return 11;
  if (longitudPalabra === 7) return 5;
  if (longitudPalabra === 6) return 3;
  if (longitudPalabra === 5) return 2;
  if (longitudPalabra === 3 || longitudPalabra === 4) return 1;
}

function iniciarTemporizador() {
  var tiempoRestante = tiempoJuego;
  spanTemporizador.textContent = tiempoRestante;
  temporizador = setInterval(function () {
    tiempoRestante--;
    spanTemporizador.textContent = tiempoRestante;

    if (tiempoRestante <= 10) {
      spanTemporizador.style.color = "red";
    }

    if (tiempoRestante <= 0) {
      clearInterval(temporizador);
      finalizarJuego();
    }
  }, 1000);
}

function finalizarJuego() {
  seccionJuego.classList.add("oculto");
  seccionFinJuego.classList.remove("oculto");
  spanPuntajeFinal.textContent = puntaje;
  guardarResultado();
}

function reiniciarJuego() {
  clearInterval(temporizador);
  iniciarJuego(new Event("submit"));

  seccionFinJuego.classList.add("oculto");
  seccionJuego.classList.remove("oculto");
}

function reiniciarTablero() {
  letrasSeleccionadas = [];
  inputPalabraActual.value = "";

  var letrasSeleccionadasDOM = document.querySelectorAll(".letra.seleccionada");
  letrasSeleccionadasDOM.forEach(function (letra) {
    letra.classList.remove("seleccionada");
    letra.classList.remove("ultima-seleccionada");
  });
}

function guardarResultado() {
  var resultados = JSON.parse(localStorage.getItem("resultadosBoggle")) || [];
  resultados.push({
    nombre: nombreJugador,
    puntaje: puntaje,
    fecha: new Date().toISOString(),
  });

  localStorage.setItem("resultadosBoggle", JSON.stringify(resultados));
}

function mostrarResultados() {
  seccionFinJuego.classList.add("oculto");
  seccionResultados.classList.remove("oculto");

  var listaResultados = document.getElementById("lista-resultados");
  listaResultados.innerHTML = "";

  var resultados = JSON.parse(localStorage.getItem("resultadosBoggle")) || [];
  resultados
    .sort(function (a, b) {
      return b.puntaje - a.puntaje;
    })
    .forEach(function (resultado) {
      var li = document.createElement("li");
      li.textContent =
        resultado.nombre +
        " - " +
        resultado.puntaje +
        " puntos - " +
        new Date(resultado.fecha).toLocaleDateString();
      listaResultados.appendChild(li);
    });
}

function volverAlInicio() {
  seccionResultados.classList.add("oculto");
  seccionInicio.classList.remove("oculto");
}

function mostrarModal(titulo, mensaje) {
  modalTitulo.textContent = titulo;
  modalMensaje.textContent = mensaje;
  modal.style.display = "block";
}

function cerrarModal() {
  modal.style.display = "none";
}
