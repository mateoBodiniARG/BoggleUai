"use strict";

// Variables globales
var nombreJugador;
var tiempoJuego;
var temporizador;
var puntaje;
var tablero;
var palabraActual;
var palabrasEncontradas;
var ultimaLetraSeleccionada;

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

function iniciarJuego(event) {
  event.preventDefault();
  nombreJugador = document.getElementById("nombre-jugador").value;
  tiempoJuego = parseInt(document.getElementById("tiempo-juego").value);

  if (nombreJugador.length < 3) {
    mostrarModal("Error", "El nombre del jugador debe tener al menos 3 letras.");
    return;
  }

  puntaje = 0;
  palabrasEncontradas = [];
  ultimaLetraSeleccionada = null;

  spanNombreJugador.textContent = nombreJugador;
  spanPuntaje.textContent = puntaje;

  generarTablero();
  iniciarTemporizador();

  seccionInicio.classList.add("oculto");
  seccionJuego.classList.remove("oculto");
}

function generarTablero() {
  tablero = [];
  divTablero.innerHTML = "";
  var letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < 4; i++) {
    tablero[i] = [];
    for (var j = 0; j < 4; j++) {
      var letra = letras.charAt(Math.floor(Math.random() * letras.length));
      tablero[i][j] = letra;

      var letraDiv = document.createElement("div");
      letraDiv.className = "letra";
      letraDiv.textContent = letra;
      letraDiv.dataset.fila = i;
      letraDiv.dataset.columna = j;
      letraDiv.addEventListener("click", seleccionarLetra);
      divTablero.appendChild(letraDiv);
    }
  }
}

function seleccionarLetra(event) {
  var letraDiv = event.target;
  var fila = parseInt(letraDiv.dataset.fila);
  var columna = parseInt(letraDiv.dataset.columna);

  if (!esLetraContigua(fila, columna)) {
    return;
  }

  // Verifica si la letra ya fue seleccionada
  if (letraDiv.classList.contains("seleccionada")) {
    return;
  }

  letraDiv.classList.add("seleccionada");
  ultimaLetraSeleccionada = { fila: fila, columna: columna };
  inputPalabraActual.value += letraDiv.textContent;
}

function esLetraContigua(fila, columna) {
  if (!ultimaLetraSeleccionada) {
    return true;
  }

  var filaAnterior = ultimaLetraSeleccionada.fila;
  var columnaAnterior = ultimaLetraSeleccionada.columna;

  return (
    Math.abs(fila - filaAnterior) <= 1 &&
    Math.abs(columna - columnaAnterior) <= 1
  );
}

function enviarPalabra() {
  var palabra = inputPalabraActual.value.toLowerCase();

  if (palabra.length < 3) {
    mostrarModal("Error", "La palabra debe tener al menos 3 letras.");
    return;
  }

  if (palabrasEncontradas.includes(palabra)) {
    mostrarModal("Error", "Esta palabra ya ha sido encontrada.");
    return;
  }

  palabrasEncontradas.push(palabra);
  puntaje += palabra.length;
  spanPuntaje.textContent = puntaje;

  var li = document.createElement("li");
  li.textContent = palabra;
  listaPalabras.appendChild(li);

  inputPalabraActual.value = "";
  ultimaLetraSeleccionada = null;
  var letrasSeleccionadas = document.querySelectorAll(".letra.seleccionada");
  letrasSeleccionadas.forEach(function (letra) {
    letra.classList.remove("seleccionada");
  });
}

function iniciarTemporizador() {
  var tiempoRestante = tiempoJuego;
  spanTemporizador.textContent = tiempoRestante; // Mostrar el tiempo inicial
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

function guardarResultado() {
  var resultados = JSON.parse(localStorage.getItem("resultadosBoggle")) || [];
  resultados.push({
    nombre: nombreJugador,
    puntaje: puntaje,
    fecha: new Date().toISOString(),
  });
  localStorage.setItem("resultadosBoggle", JSON.stringify(resultados)); // Corregido el nombre de la clave
}

function mostrarResultados() {
  seccionFinJuego.classList.add("oculto");
  seccionResultados.classList.remove("oculto");

  var listaResultados = document.getElementById("lista-resultados");
  listaResultados.innerHTML = "";

  var resultados = JSON.parse(localStorage.getItem("resultadosBoggle")) || [];
  resultados
    .sort(function (a, b) { return b.puntaje - a.puntaje; }) // Ordenar por puntaje descendente
    .forEach(function (resultado) {
      var li = document.createElement("li");
      li.textContent = resultado.nombre + " - " + resultado.puntaje + " puntos (" + new Date(resultado.fecha).toLocaleDateString("es-ES") + ")";
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
  modal.classList.remove("oculto");
}

function cerrarModal() {
  modal.classList.add("oculto");
}