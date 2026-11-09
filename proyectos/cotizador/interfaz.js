"use strict";
(() => {
  const $ = (id) => document.getElementById(id);
  const dinero = (centavos) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(centavos / 100);
  const el = (tag, clase, texto) => {
    const node = document.createElement(tag);
    if (clase) node.className = clase;
    if (texto !== undefined) node.textContent = texto;
    return node;
  };
  const entrada = $("solicitud");
  const estado = $("estado");
  let partidas = [];
  let ultimaSolicitud = "";

  function actualizarResumen() {
    const pendientes = partidas.filter((p) => !Cotizador.listaPartida(p)).length;
    const cambio = entrada.value !== ultimaSolicitud;
    const cantidad = partidas.length;
    $("descargar").disabled = cambio || pendientes > 0 || cantidad === 0;
    $("total").textContent = dinero(partidas.reduce((suma, p) => suma + Cotizador.totalLinea(p), 0));
    estado.dataset.type = pendientes || cambio || !cantidad ? "warn" : "ok";
    let mensaje = cantidad === 1 ? "1 partida lista para exportar." : cantidad + " partidas listas para exportar.";
    if (!cantidad) mensaje = "Agrega un renglón con una pieza y su cantidad para preparar el borrador.";
    if (pendientes) mensaje = pendientes === 1 ? "1 partida necesita revisión para exportar." : pendientes + " partidas necesitan revisión para exportar.";
    if (cambio) mensaje = "La solicitud cambió. Procesa la lista para actualizar el borrador.";
    if (estado.textContent !== mensaje) estado.textContent = mensaje;
  }
  function campo(texto, control) {
    const label = el("label", "field-label", texto);
    label.append(control);
    return label;
  }
  function actualizarLinea(p, importe, aviso) {
    const lista = Cotizador.listaPartida(p);
    importe.textContent = lista ? dinero(Cotizador.totalLinea(p)) : "Pendiente";
    let mensaje = "";
    if (p.multiple || !p.sku) mensaje = p.aviso || "Elige un producto del catálogo.";
    else if (!lista) mensaje = "Confirma una cantidad entera de 1 a 9999.";
    aviso.textContent = mensaje;
    aviso.hidden = !mensaje;
  }
  function mostrar() {
    const lista = $("partidas");
    lista.replaceChildren();
    partidas.forEach((p, i) => {
      const fila = el("li");
      const cabecera = el("div", "line-head");
      const fuente = el("p", "source", p.origen);
      const quitar = el("button", "remove", "×");
      quitar.type = "button";
      quitar.title = "Quitar partida " + (i + 1);
      quitar.setAttribute("aria-label", quitar.title);
      quitar.addEventListener("click", () => {
        partidas.splice(i, 1);
        mostrar();
        (lista.children[Math.min(i, lista.children.length - 1)]?.querySelector(".remove") || $("procesar")).focus();
      });
      cabecera.append(fuente, quitar);
      const edicion = el("div", "line-edit");
      const seleccionar = el("select");
      seleccionar.append(new Option("Elegir producto…", ""));
      Cotizador.productos.forEach((producto) => seleccionar.append(new Option(producto.sku + " · " + producto.nombre, producto.sku)));
      seleccionar.value = p.sku;
      seleccionar.disabled = p.multiple;
      const cantidad = el("input");
      cantidad.type = "number";
      cantidad.min = "1";
      cantidad.max = "9999";
      cantidad.step = "1";
      cantidad.inputMode = "numeric";
      cantidad.value = p.cantidad;
      cantidad.disabled = p.multiple;
      const importe = el("output");
      const aviso = el("p", "issue");
      aviso.id = "nota-" + i;
      seleccionar.setAttribute("aria-describedby", aviso.id);
      cantidad.setAttribute("aria-describedby", aviso.id);
      seleccionar.addEventListener("change", () => {
        p.sku = seleccionar.value;
        actualizarLinea(p, importe, aviso);
        actualizarResumen();
      });
      cantidad.addEventListener("input", () => {
        p.cantidad = cantidad.value;
        actualizarLinea(p, importe, aviso);
        actualizarResumen();
      });
      edicion.append(campo("Producto", seleccionar), campo("Cantidad", cantidad), importe);
      fila.append(cabecera, edicion, aviso);
      lista.append(fila);
      actualizarLinea(p, importe, aviso);
    });
    actualizarResumen();
  }
  function procesar() {
    ultimaSolicitud = entrada.value;
    partidas = Cotizador.analizar(entrada.value);
    mostrar();
  }
  function ponerEjemplo() {
    entrada.value = Cotizador.ejemplo;
    procesar();
  }
  for (const p of Cotizador.productos) {
    const linea = el("li");
    linea.append(el("code", "", p.sku), el("span", "", p.nombre), el("small", "", dinero(p.precio) + " / pieza"));
    $("catalogo").append(linea);
  }
  entrada.addEventListener("input", actualizarResumen);
  $("procesar").addEventListener("click", procesar);
  $("ejemplo").addEventListener("click", ponerEjemplo);
  $("descargar").addEventListener("click", () => {
    const csv = Cotizador.aCSV(partidas);
    if (!csv || entrada.value !== ultimaSolicitud) return;
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const enlace = el("a");
    enlace.href = url;
    enlace.download = "borrador-cotizacion-mxn.csv";
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  ponerEjemplo();
})();
