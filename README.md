# Luis Vargas · Software y automatización

[Visitar el sitio](https://luisvvargas-swe.github.io/)

Portada mínima para ofrecer proyectos pequeños: apps web, chatbots de WhatsApp y soluciones QR/NFC. La experiencia profesional se presenta aparte, sin atribuir estos nuevos servicios a trabajos previos.

## Interacción y diseño

- Fondo blanco y contenido centrado, alineado a la izquierda; sin paneles, bordes ni vidrio.
- Una serif uniforme (Lora) para los nombres; Inter pequeño para contexto y contacto. Sin negritas parciales, cursivas ni subrayado decorativo.
- Lista grande en reposo. Al pasar el cursor, solo el nombre activo se acerca y crece, ajustando la escala al ancho disponible. Los otros nombres se desplazan hacia atrás con perspectiva y desenfoque inferior a 1 px.
- Las zonas que detectan el cursor permanecen inmóviles. Hover y foco no revelan información; clic o Enter abre los detalles.
- Desplegables nativos animados, con padding y altura coordinados para evitar saltos al cerrar. El teclado puede recorrer toda la lista finita y cerrar con Escape.
- En móvil táctil se conserva la lista legible y la apertura al tocar. Movimiento reducido e incremento de contraste desactivan los efectos que dificultarían la lectura.
- Rueda: rebote limitado hacia el centro cuando el contenido cabe; desplazamiento normal si es más alto. Los desplegables funcionan sin JavaScript.

Referencias de interacción, no dependencias de código:
- https://tympanus.net/Development/3DLettersMenuHover/ — perspectiva tipográfica.
- https://www.reactbits.dev/text-animations/true-focus — foco y desenfoque.
- https://web.dev/articles/animations-guide — uso de transformaciones y opacidad.

## Archivos

- `index.html`: contenido y desplegables nativos.
- `assets/minimal.css`: diseño tipográfico y adaptación a pantallas pequeñas.
- `assets/minimal.js`: expansión y resorte.
- `assets/monogram.svg`: icono del sitio.

Inter se carga desde Google Fonts, con alternativas del sistema. GitHub Pages publica desde la raíz de `main`; no requiere compilación, claves ni servicios de pago.

## Versiones anteriores

Los archivos de las demos y estilos anteriores se conservan para no interrumpir enlaces existentes. La plantilla anterior se archivó por separado el 11 de noviembre de 2026 a partir de la revisión `ece60d83a2d6a2650aa0a8750f6067a169ffceef`.

Contacto: luisvargas.swe@gmail.com
