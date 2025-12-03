const editor = document.getElementById("editor");
const listaNotas = document.getElementById("listaNotas");
const tituloInput = document.getElementById("tituloNota");

// Guardar contenido y título en localStorage en tiempo real
editor.addEventListener("input", () => {
  localStorage.setItem("nota_actual_contenido", editor.innerHTML);
});
tituloInput.addEventListener("input", () => {
  localStorage.setItem("nota_actual_titulo", tituloInput.value);
});

// Limpiar editor
function limpiarEditor() {
  editor.innerHTML = '';
  tituloInput.value = '';
  localStorage.removeItem('nota_actual_contenido');
  localStorage.removeItem('nota_actual_titulo');
}

// Guardar nota
function guardarNota() {
  const contenido = editor.innerHTML.trim();
  const titulo = tituloInput.value.trim();

  if (!titulo) {
    alert("Por favor escribe un título para la nota.");
    return;
  }
  if (!contenido) {
    alert("La nota está vacía, escribe algo antes de guardar.");
    return;
  }

  const id = 'nota_' + Date.now();
  const nota = { titulo, contenido };

  localStorage.setItem(id, JSON.stringify(nota));
  agregarNotaALista(id, nota);
  limpiarEditor();
}

// Agregar nota a la lista
function agregarNotaALista(id, nota) {
  if (document.getElementById(id)) return;

  const li = document.createElement("li");
  li.id = id;

  const tituloBtn = document.createElement("button");
  tituloBtn.textContent = nota.titulo;
  tituloBtn.className = "tituloNotaLista";
  tituloBtn.onclick = () => {
    editor.innerHTML = nota.contenido;
    tituloInput.value = nota.titulo;
    localStorage.setItem("nota_actual_contenido", nota.contenido);
    localStorage.setItem("nota_actual_titulo", nota.titulo);
  };

  const borrarBtn = document.createElement("button");
  borrarBtn.textContent = "🗑️";
  borrarBtn.className = "borrarBtn";
  borrarBtn.onclick = () => {
    if (confirm(`¿Quieres borrar la nota "${nota.titulo}"?`)) {
      localStorage.removeItem(id);
      listaNotas.removeChild(li);
      if (tituloInput.value === nota.titulo && editor.innerHTML === nota.contenido) {
        limpiarEditor();
      }
    }
  };

  li.appendChild(tituloBtn);
  li.appendChild(borrarBtn);
  listaNotas.appendChild(li);
}

// Insertar <code>
function insertCode() {
  const selection = window.getSelection();
  const selectedText = selection.toString();
  if (selectedText.length === 0) return;

  const range = selection.getRangeAt(0);
  const codeNode = document.createElement("code");
  codeNode.textContent = selectedText;
  range.deleteContents();
  range.insertNode(codeNode);
}

// Cargar al abrir
window.addEventListener("DOMContentLoaded", () => {
  const contenidoGuardado = localStorage.getItem("nota_actual_contenido");
  const tituloGuardado = localStorage.getItem("nota_actual_titulo");

  if (contenidoGuardado) editor.innerHTML = contenidoGuardado;
  if (tituloGuardado) tituloInput.value = tituloGuardado;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("nota_")) {
      const nota = JSON.parse(localStorage.getItem(key));
      agregarNotaALista(key, nota);
    }
  }
});

// Modal
const modal = document.getElementById("modalOpciones");
function abrirOpciones() { modal.style.display = "block"; }
function cerrarOpciones() { modal.style.display = "none"; }

// Exportar notas
function exportarNotas() {
  let contenido = "";
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("nota_")) {
      const nota = JSON.parse(localStorage.getItem(key));
      contenido += `Título: ${nota.titulo}\nContenido:\n${nota.contenido}\n\n---\n\n`;
    }
  }

  const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "notas_exportadas.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Importar notas
function importarNotas(event) {
  const archivos = event.target.files;
  if (!archivos.length) return;

  Array.from(archivos).forEach((archivo) => {
    const lector = new FileReader();
    lector.onload = (e) => {
      const texto = e.target.result.trim();
      let titulo = prompt("Escribe el título para la nota importada:", archivo.name);
      if (!titulo) titulo = "Nota importada " + Date.now();

      const id = "nota_" + Date.now() + Math.floor(Math.random() * 1000);
      const nota = { titulo, contenido: texto };

      localStorage.setItem(id, JSON.stringify(nota));
      agregarNotaALista(id, nota);
    };
    lector.readAsText(archivo);
  });

  event.target.value = "";
}
