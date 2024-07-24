document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.getElementById("formulario-contacto");

  formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre-contacto").value;
    const email = document.getElementById("email-contacto").value;
    const mensaje = document.getElementById("mensaje-contacto").value;

    const asunto = encodeURIComponent("Formulario de Contacto");
    const cuerpo = encodeURIComponent(`Nombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`);
    const destinatario = "lucas.quaroni@gmail.com";
    const mailtoLink = `mailto:${destinatario}?subject=${asunto}&body=${cuerpo}`;

    window.location.href = mailtoLink;
  });
});