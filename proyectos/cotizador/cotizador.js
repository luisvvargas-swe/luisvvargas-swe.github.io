"use strict";

const Cotizador = (() => {
  const productos = [
    { sku: "TOR-M8", nombre: "Tornillo hexagonal M8", precio: 1250, aliases: ["tornillo hexagonal m8", "tornillo m8", "tornillos m8"] },
    { sku: "TUE-M8", nombre: "Tuerca M8", precio: 450, aliases: ["tuerca m8", "tuercas m8"] },
    { sku: "ROD-6204", nombre: "Rodamiento 6204", precio: 12800, aliases: ["rodamiento 6204", "rodamientos 6204", "balero 6204"] },
    { sku: "ROD-6205", nombre: "Rodamiento 6205", precio: 17400, aliases: ["rodamiento 6205", "rodamientos 6205", "balero 6205"] },
    { sku: "SEL-22", nombre: "Sello de 22 mm", precio: 2800, aliases: ["sello de 22 mm", "sello 22 mm", "sellos de 22 mm"] },
  ];
  const ejemplo = "Hola, ¿me ayudan a cotizar?\n12 piezas de TOR-M8\nTUE-M8 x 12\n3 rodamientos 6204\nSEL-22 (cantidad por confirmar)";
  const normaliza = (texto) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const formatos = productos.map((producto) => {
    const terminos = [producto.sku.toLowerCase(), ...producto.aliases].sort((a, b) => b.length - a.length);
    return { sku: producto.sku, regex: new RegExp("(?<![a-z0-9-])(?:" + terminos.join("|") + ")(?![a-z0-9-])", "i") };
  });
  const numerico = /^\d{1,4}$/;
  function cantidadValida(cantidad) {
    return numerico.test(String(cantidad)) && Number(cantidad) > 0;
  }
  function detectarCantidad(texto) {
    const valor = "([+-]?\\d+(?:[.,]\\d+)?)";
    const patrones = [
      new RegExp("(?:^|\\s)(?:x|×|cant(?:idad)?[.:]?)\\s*" + valor + "(?=\\s|$|[),;])", "g"),
      new RegExp("(?:^|\\s)" + valor + "\\s*(?:piezas?|unidades?|pzas?\\.?|uds?\\.?|pcs|u\\.)(?=\\s|$|[,;])", "g"),
    ];
    const cantidades = patrones.flatMap((patron) => [...texto.matchAll(patron)].map((m) => m[1]));
    if (!cantidades.length && !/[a-z]+[-/]\d/i.test(texto)) {
      // Admite «3 tornillos M8» y «TOR-M8 3» después de retirar la referencia.
      const limpio = texto.replace(/^[\s,:;]+|[\s,:;]+$/g, "").trim();
      const sola = limpio.match(/^([+-]?\d+(?:[.,]\d+)?)(?:\s*(?:x|×|de)\s*)?$/);
      if (sola) cantidades.push(sola[1]);
    }
    return cantidades.length === 1 && cantidadValida(cantidades[0]) ? Number(cantidades[0]) : "";
  }
  function analizar(texto) {
    const saludos = /^(?:hola|buenos dias|buenas tardes|buenas noches|gracias|muchas gracias|saludos|atentamente|por favor cotizar|favor de cotizar|lista de piezas|solicitud de cotizacion)[\s!¿?.,:;-]*$/;
    const introduccion = /^(?:hola[, !]*|buenos dias[, !]*)?(?:¿?me (?:ayudan|pueden ayudar) a cotizar|quisiera cotizar|necesito cotizar|solicito cotizacion|cotizar lo siguiente)[\s!¿?.,:;-]*$/;
    return texto.split(/[\r\n;]+/).map((t) => t.trim()).filter(Boolean).flatMap((origen) => {
      const limpio = normaliza(origen).replace(/^[-*•]\s+/, "");
      if (saludos.test(limpio) || introduccion.test(limpio)) return [];
      const matches = formatos.filter((p) => p.regex.test(limpio));
      const sku = matches.length === 1 ? matches[0].sku : "";
      const fueraDeCatalogo = !matches.length;
      const resto = sku ? limpio.replace(matches[0].regex, " ").trim() : limpio;
      const cantidad = detectarCantidad(resto);
      let aviso = "";
      if (matches.length > 1) aviso = "Hay varias referencias en este renglón. Sepáralas en la solicitud y vuelve a procesar.";
      else if (fueraDeCatalogo) aviso = "Revisa el texto y elige el producto correspondiente del catálogo.";
      return [{ origen, sku, cantidad, aviso, multiple: matches.length > 1 }];
    });
  }
  function listaPartida(partida) {
    return !partida.multiple && productos.some((p) => p.sku === partida.sku) && cantidadValida(partida.cantidad);
  }
  function totalLinea(partida) {
    if (!listaPartida(partida)) return 0;
    return productos.find((p) => p.sku === partida.sku).precio * Number(partida.cantidad);
  }
  function aCSV(partidas) {
    if (!partidas.length || !partidas.every(listaPartida)) return "";
    const filas = partidas.map((partida) => {
      const p = productos.find((producto) => producto.sku === partida.sku);
      return [p.sku, p.nombre, partida.cantidad, (p.precio / 100).toFixed(2), (totalLinea(partida) / 100).toFixed(2)];
    });
    return [["SKU", "Descripción", "Cantidad", "Precio unitario MXN", "Importe MXN"], ...filas,
      ["", "Subtotal MXN", "", "", (partidas.reduce((suma, p) => suma + totalLinea(p), 0) / 100).toFixed(2)]]
      .map((fila) => fila.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(",")).join("\r\n");
  }
  return { productos, ejemplo, analizar, listaPartida, totalLinea, aCSV };
})();
if (typeof module !== "undefined" && module.exports) module.exports = Cotizador;
