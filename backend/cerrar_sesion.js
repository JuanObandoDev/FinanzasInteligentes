function close_session() {
  localStorage.removeItem("startSessionUser");
  localStorage.removeItem("userId");
  window.location.href = "../pages/inicio_de_sesion.html";
}
document
  .getElementById("closeSession")
  .addEventListener("click", close_session);
