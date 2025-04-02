const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.onload = async function (event) {
  event.preventDefault();

  const { data, error } = await SUPABASE.from("categorias_gastos").select(
    "nombre"
  );

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  const selectElement = document.getElementById("categoria");
  data.forEach((element) => {
    const option = document.createElement("option");
    option.value = element.nombre;
    option.textContent = element.nombre;
    selectElement.appendChild(option);
  });

  selectElement.addEventListener("change", function () {
    if (this.value === "Otra") {
      const newFuente = document.createElement("input");
      newFuente.setAttribute("type", "text");
      newFuente.setAttribute("id", "newFuente");
      newFuente.setAttribute("placeholder", "Escribe la nueva fuente");
      newFuente.setAttribute("required", "true");

      const newLabel = document.createElement("label");
      newLabel.setAttribute("for", "newFuente");
      newLabel.textContent = "Nueva fuente:";
      newLabel.setAttribute("id", "newFuenteLabel");

      this.parentNode.insertBefore(newFuente, this.nextSibling);
      this.parentNode.insertBefore(newLabel, this.nextSibling);

      const label = document.getElementById("descripcionLabel");
      label.textContent = "Descripción (obligatorio):";
      label.setAttribute("id", "descripcionLabelObligatorio");
      document.getElementById("descripcion").setAttribute("required", "true");
    } else {
      const newFuente = document.getElementById("newFuente");
      const newLabel = document.getElementById("newFuenteLabel");
      if (newFuente) {
        newFuente.remove();
        newLabel.remove();
      }
      const label = document.getElementById("descripcionLabelObligatorio");
      if (label) {
        label.textContent = "Descripción (opcional):";
        label.setAttribute("id", "descripcionLabel");
        document.getElementById("descripcion").removeAttribute("required");
      }
    }
  });
};

document
  .getElementById("gastosForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const monto = document.getElementById("monto").value;
    const categoria = document.getElementById("categoria").value;
    const descripcion = document.getElementById("descripcion").value;
    const id_usuario = localStorage.getItem("userId");

    if (monto <= 0) {
      alert("El monto debe ser un número positivo.");
      return;
    }

    const id_categoria_gasto = await SUPABASE.from("categorias_gastos")
      .select("id_categoria_gasto")
      .eq("nombre", categoria)
      .single();

    const data = {
      id_usuario: id_usuario,
      monto: monto,
      id_categoria_gasto: id_categoria_gasto.data.id_categoria_gasto,
      descripcion: descripcion,
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/gastos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al guardar los datos en el servidor"
        );
      }

      alert("su gasto ha sido registrado exitosamente");
      window.location.href = "../pages/gastos.html";
    } catch (error) {
      alert(error.message);
    }
  });
