const modal = document.getElementById("modal");
const formularioContacto = document.getElementById("formulario-contacto");
const cerrarModal = document.getElementById("modal-cerrar");
const expReg = /^[a-zA-Z0-9\s]+$/;
formularioContacto.addEventListener("submit", function (e) {
  e.preventDefault();

  var nombre = document.getElementById("nombre-contacto").value;
  var email = document.getElementById("email-contacto").value;
  var mensaje = document.getElementById("mensaje-contacto").value;

  if (expReg.test(nombre) == false) {
    mostrarModal("Error", "Por favor, introduce un nombre válido.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    mostrarModal("Error", "Por favor, introduce un email válido.");
    return;
  }

  if (mensaje.length <= 5) {
    mostrarModal("Error", "El mensaje debe tener más de 5 caracteres.");
    return;
  }

  // Si todas las validaciones pasan, abre el cliente de correo predeterminado -- no funciona
  var mailtoLink =
    "mailto:" +
    encodeURIComponent(email) +
    "?subject=" +
    encodeURIComponent("Contacto desde Boggle") +
    "&body=" +
    encodeURIComponent("Nombre: " + nombre + "\n\nMensaje: " + mensaje);
  window.location.href = mailtoLink;
});

function mostrarModal(titulo, mensaje) {
  document.getElementById("modal-titulo").textContent = titulo;
  document.getElementById("modal-mensaje").textContent = mensaje;
  modal.classList.remove("oculto");
}

cerrarModal.addEventListener("click", function () {
  modal.classList.add("oculto");
});

modal.classList.add("oculto");
