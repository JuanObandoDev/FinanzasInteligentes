const SUPABASE_URL = "https://fghnnxllxilqupwtrezh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaG5ueGxseGlscXVwd3RyZXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzcyNjEsImV4cCI6MjA1ODc1MzI2MX0.6UiQbo7HZw_Ww1VNFbhRHVeSYz8C-parH1raEAy1_Uk";
const SUPABASE = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.onload = async () => {
  const loaderContainer = document.getElementById("loader-container");
  const container = document.getElementById("container");

  try {
    const { data: tipos, error } = await SUPABASE.from(
      "tipos_inversiones"
    ).select("nombre");
    if (error) throw new Error(`Error al obtener los tipos: ${error.message}`);

    populateSelectOptions(tipos);

    loaderContainer.style.display = "none";
    container.classList.remove("hidden");
  } catch (error) {
    console.error(error.message);
    alert("Hubo un problema al cargar los tipos de inversión.");
  }
};

function populateSelectOptions(tipos) {
  const selectElement = document.getElementById("tipo");

  tipos.forEach(({ nombre }) => {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    selectElement.appendChild(option);
  });

  selectElement.addEventListener("change", handleSelectChange);
}

function handleSelectChange(event) {
  const isOtra = event.target.value === "Otra";
  toggleNewTipoInputs(isOtra);
  toggleDescripcionRequired(isOtra);
}

function toggleNewTipoInputs(show) {
  const parent = document.getElementById("tipo").parentNode;

  if (show) {
    if (!document.getElementById("newTipo")) {
      const newTipo = document.createElement("input");
      newTipo.setAttribute("type", "text");
      newTipo.setAttribute("id", "newTipo");
      newTipo.setAttribute("placeholder", "Escribe el nuevo tipo");
      newTipo.setAttribute("required", "true");

      const newLabel = document.createElement("label");
      newLabel.setAttribute("for", "newTipo");
      newLabel.textContent = "Nuevo tipo:";
      newLabel.setAttribute("id", "newTipoLabel");

      parent.insertBefore(newLabel, parent.querySelector("#tipo").nextSibling);
      parent.insertBefore(newTipo, newLabel.nextSibling);
    }
  } else {
    const newTipo = document.getElementById("newTipo");
    const newLabel = document.getElementById("newTipoLabel");
    if (newTipo) newTipo.remove();
    if (newLabel) newLabel.remove();
  }
}

function toggleDescripcionRequired(required) {
  const descripcion = document.getElementById("descripcion");
  const label = document.getElementById(
    required ? "descripcionLabel" : "descripcionLabelObligatorio"
  );

  if (label) {
    label.textContent = required
      ? "Descripción (obligatorio):"
      : "Descripción (opcional):";
    label.setAttribute(
      "id",
      required ? "descripcionLabelObligatorio" : "descripcionLabel"
    );

    if (required) descripcion.setAttribute("required", "true");
    else descripcion.removeAttribute("required");
  }
}

document
  .getElementById("inversionesForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const monto = parseFloat(document.getElementById("monto").value);
      const tipo = document.getElementById("tipo").value;
      const descripcionInput = document.getElementById("descripcion").value;
      const id_usuario = localStorage.getItem("userId");

      if (monto <= 0) {
        alert("El monto debe ser mayor a 0");
        document.getElementById("monto").focus();
        return;
      }

      const descripcion = await getDescripcion(tipo, descripcionInput);
      const id_tipo_inversion = await getTipoId(tipo);

      const data = {
        id_usuario,
        monto,
        id_tipo_inversion,
        descripcion,
      };

      await saveInvestment(data);

      alert("La inversión fue guardada exitosamente");
      window.location.href = "../pages/inversiones.html";
    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  });

async function getDescripcion(tipo, descripcionInput) {
  if (descripcionInput.trim().length > 0) return descripcionInput;

  const { data, error } = await SUPABASE.from("tipos_inversiones")
    .select("descripcion")
    .eq("nombre", tipo)
    .single();

  if (error)
    throw new Error(`Error al obtener la descripción: ${error.message}`);
  return data.descripcion;
}

async function getTipoId(tipo) {
  const { data, error } = await SUPABASE.from("tipos_inversiones")
    .select("id_tipo_inversion")
    .eq("nombre", tipo)
    .single();

  if (error)
    throw new Error(`Error al obtener el ID del tipo: ${error.message}`);
  return data.id_tipo_inversion;
}

async function saveInvestment(data) {
  const { error } = await SUPABASE.from("inversiones").insert([data]);
  if (error) throw new Error("Error al guardar los datos en el servidor");
}
