# Luis Vargas · Software y automatización

[Visitar el sitio](https://luisvvargas-swe.github.io/)

Portada mínima para ofrecer proyectos pequeños: apps web, chatbots de WhatsApp y soluciones QR/NFC. La experiencia profesional se presenta aparte, sin atribuir estos nuevos servicios a trabajos previos.

## Interacción y diseño

- Fondo blanco, bloque centrado y alineado a la izquierda. Lora para contenido editorial; Inter para controles secundarios. Inspiración tipográfica en Claude, sin usar sus fuentes propietarias.
- Portada con nombres de servicios; descripciones ocultas hasta hacer clic. Hover pequeño, sin abrir ni revelar información.
- Desplegables nativos con transición de altura de 420 ms; las aperturas y cierres rápidos pueden interrumpir la animación.
- Un solo panel inspirado en Liquid Glass: mapa de desplazamiento de bordes en navegadores compatibles, brillo que sigue el cursor y respuesta al pulsar. Degradación a reflejos y desenfoque leve donde no se admite el filtro SVG. Es una aproximación web, no el material nativo de Apple. En blanco uniforme la refracción apenas es visible.
- Se evita superponer superficies de vidrio; el contenido mantiene su legibilidad.
- Tab, Enter, Escape y navegación con flechas entre elementos hermanos, sin repetición infinita. Se respetan movimiento y transparencia reducidos.
- Un rebote limitado al usar la rueda devuelve el panel al centro cuando cabe; el contenido largo puede desplazarse normalmente. Sin JavaScript los desplegables nativos siguen funcionando.

Referencia: https://developer.apple.com/videos/play/wwdc2025/219/

## Archivos

- `index.html`: contenido y desplegables nativos.
- `assets/minimal.css`: diseño tipográfico y adaptación a pantallas pequeñas.
- `assets/minimal.js`: expansión y resorte.
- `assets/monogram.svg`: icono del sitio.

Inter se carga desde Google Fonts, con alternativas del sistema. GitHub Pages publica desde la raíz de `main`; no requiere compilación, claves ni servicios de pago.

## Versiones anteriores

Los archivos de las demos y estilos anteriores se conservan para no interrumpir enlaces existentes. La plantilla anterior se archivó por separado el 11 de noviembre de 2026 a partir de la revisión `ece60d83a2d6a2650aa0a8750f6067a169ffceef`.

Contacto: luisvargas.swe@gmail.com
