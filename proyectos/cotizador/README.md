# Cotizador de refacciones

Demo web para pasar una solicitud de piezas a un borrador de cotización en pesos mexicanos. El catálogo, sus cinco referencias y los precios son ficticios.

## Uso

1. Abre `index.html` con tu navegador o publica el contenido de esta carpeta en un alojamiento estático. Mantén los archivos HTML, CSS y JavaScript juntos. La demo funciona incluso sin conexión.
2. Pega una lista con una referencia por renglón y pulsa **Procesar lista**. Por ejemplo, escribe `TOR-M8 x 12` o `3 rodamientos 6204`. El catálogo desplegable muestra todas las referencias disponibles.
3. Revisa las coincidencias, selecciona un producto si hace falta y ajusta las cantidades. Divide en el texto original los renglones que mezclen varias referencias y vuelve a procesarlo. Al volver a procesar se reconstruye el borrador a partir del texto.
4. Cuando todas las partidas sean válidas, pulsa **Descargar CSV**. El archivo UTF-8 incluye SKU, descripción, cantidad, precio unitario, importe y subtotal en MXN. Los importes son previos a impuestos.

El reconocimiento usa códigos y nombres de ejemplo mediante reglas locales. Solo admite cantidades enteras de 1 a 9999 y fragmentos de texto. Los datos quedan en la pestaña y se descartan al recargar. El enlace de regreso apunta a la página principal del portafolio.
