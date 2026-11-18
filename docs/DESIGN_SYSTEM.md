# Diseño y personalización por restaurante

## Propósito
Una carta digital elegante y mobile-first, con estilos diferenciados pero sin bifurcar el código por restaurante ni aceptar HTML/CSS personalizados.

## Implementado
- Cuatro presets con paletas cerradas: OLIVE (Oliva), TERRACOTTA (Terracota), OCEAN (Atlántico) y NOIR (Noche).
- Dos formatos: CARDS y LIST.
- Nombre comercial y eslogan breve (texto JSX escapado) en la cabecera.
- Navegación de categorías con anclas internas.
- Platos agotados visibles y etiquetados.
- Diseño adaptativo de escritorio a móvil.
- Vista pública de demostración sin persistencia: /demo/temas.
- Preferencia de tema, formato y eslogan persistida en Restaurant (PostgreSQL).

## Seguridad
- Solo aceptar valores enum conocidos del lado servidor.
- No aceptar CSS, HTML, JavaScript, URL de imágenes ni fuentes de un cliente para construir estilos o scripts.
- La vista de demostración contiene únicamente swatches hardcoded de este repositorio.
- La selección persistente se permitirá SOLO a usuarios autorizados del restaurante, en el futuro panel privado.
- Para branding más complejo, servicio premium usando opciones aprobadas y recursos verificados, nunca HTML arbitrario.

## Próxima iteración
- Autenticación y permisos multitenant.
- Editor de apariencia con previsualización sin publicar y guardado autorizado.
- Logo/portada optimizados y validados en object storage.
- Un sistema de colores ampliable usando whitelist y contraste accesible.
