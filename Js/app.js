"use strict";

// Variables globales
var nombreJugador;
var tiempoJuego;
var temporizador;
var puntaje;
var tablero;
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

function iniciarJuego(event) {
  event.preventDefault();
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

  generarTablero();
  iniciarTemporizador();

  seccionInicio.classList.add("oculto");
  seccionJuego.classList.remove("oculto");
}

function generarTablero() {
  var letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var columnasTablero = document.querySelectorAll('.columna-tablero');

  columnasTablero.forEach(function(columna) {
    columna.innerHTML = ""; // Limpiamos el contenido previo de la columna

    for (var i = 0; i < 4; i++) {
      var letra = letras.charAt(Math.floor(Math.random() * letras.length));

      var letraDiv = document.createElement("div");
      letraDiv.className = "letra";
      letraDiv.textContent = letra;
      letraDiv.dataset.fila = i;
      letraDiv.dataset.columna = columna.dataset.columna; // Asignamos la columna a través del dataset
      letraDiv.addEventListener("click", seleccionarLetra);

      columna.appendChild(letraDiv);
    }
  });
}


function seleccionarLetra(event) {
  var letraDiv = event.target;
  var fila = parseInt(letraDiv.dataset.fila);
  var columna = parseInt(letraDiv.dataset.columna);

  // Verifica si la letra seleccionada puede ser añadida a la palabra actual
  if (!esLetraContigua(fila, columna)) {
    return;
  }

  // Verifica si la letra ya ha sido seleccionada
  if (letrasSeleccionadas.some(function(item) {
    return item.fila === fila && item.columna === columna;
  })) {
    return;
  }

  // Añade la letra seleccionada al array de letras seleccionadas
  letrasSeleccionadas.push({
    letra: letraDiv.textContent,
    fila: fila,
    columna: columna
  });

  // Actualiza el input de la palabra actual con todas las letras seleccionadas
  inputPalabraActual.value = letrasSeleccionadas.map(item => item.letra).join('');

  // Agrega una clase para marcar visualmente la letra como seleccionada
  letraDiv.classList.add("seleccionada");
}

function esLetraContigua(fila, columna) {
  var ultimaLetra = letrasSeleccionadas[letrasSeleccionadas.length - 1];

  if (!ultimaLetra) {
    return true;
  }

  var filaAnterior = ultimaLetra.fila;
  var columnaAnterior = ultimaLetra.columna;

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

  if (!esPalabraValida(palabra)) {
    mostrarModal("Error", "Esta palabra no es válida.");
    return;
  }

  palabrasEncontradas.push(palabra);
  puntaje += calcularPuntos(palabra.length);
  spanPuntaje.textContent = puntaje;

  var li = document.createElement("li");
  li.textContent = palabra;
  listaPalabras.appendChild(li);

  // Limpia el array de letras seleccionadas y el input de la palabra actual
  letrasSeleccionadas = [];
  inputPalabraActual.value = "";

  // Reinicia la visualización de letras seleccionadas en el tablero
  var letrasSeleccionadasDOM = document.querySelectorAll(".letra.seleccionada");
  letrasSeleccionadasDOM.forEach(function (letra) {
    letra.classList.remove("seleccionada");
  });
}

function esPalabraValida(palabra) {
  // Aquí deberías implementar la validación de la palabra contra un diccionario
  // En este ejemplo, simplemente se valida que tenga más de 3 letras
  return palabra.length >= 3;
}

function iniciarTemporizador() {
  var tiempoRestante = tiempoJuego;
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
  localStorage.setItem("resultadosBoggle", JSON.stringify(resultados));
}

function mostrarResultados() {
  seccionFinJuego.classList.add("oculto");
  seccionResultados.classList.remove("oculto");

  var listaResultados = document.getElementById("lista-resultados");
  listaResultados.innerHTML = "";

  var resultados = JSON.parse(localStorage.getItem("resultadosBoggle")) || [];
  resultados
    .sort((a, b) => b.puntaje - a.puntaje) // Ordenar por puntaje descendente
    .forEach(function (resultado) {
      var li = document.createElement("li");
      li.textContent = `${resultado.nombre} - ${
        resultado.puntaje
      } puntos (${new Date(resultado.fecha).toLocaleDateString("es-ES")})`;
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

// Función para calcular puntos según la longitud de la palabra
function calcularPuntos(longitud) {
  if (longitud === 3 || longitud === 4) {
    return 1;
  } else if (longitud === 5) {
    return 2;
  } else if (longitud === 6) {
    return 3;
  } else if (longitud === 7) {
    return 5;
  } else if (longitud >= 8) {
    return 11;
  } else {
    return 0;
  }
}