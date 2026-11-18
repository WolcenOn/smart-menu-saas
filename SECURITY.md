# Política de seguridad

## Implementación actual (piloto)
- React/JSX escapa contenido de nombres, descripciones y eslóganes: **no** interpretar HTML libre.
- Prohibidos `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, `new Function` y `document.write` con contenido no confiable.
- Prisma con filtros parametrizados. Prohibido concatenar SQL y `$queryRawUnsafe` con datos de usuarios.
- Auth.js Credentials con JWT firmado, hash bcrypt y duración limitada; sin registro público ni credenciales demo predefinidas.
- Autorización en servidor por identidad actual, membresía y rol. Los identificadores del navegador nunca otorgan permisos.
- Mutaciones de carta restringidas al restaurante y entradas validadas estrictamente con Zod; alérgenos limitados a los 14 grupos.
- Borrador predeterminado si no se marca revisión explícita de alérgenos.
- La etiqueta SOLD_OUT sigue visible pero no representa inventario medido.
- Los datos demo destructivos para E2E se limitan a CI y PostgreSQL efímero.
- Valores del tema y diseños en whitelist. No se acepta HTML/CSS/JS de restaurantes.

## Barreras pendientes para uso público
- **CSP provisional:** `next.config.ts` aún permite `unsafe-inline` en scripts por compatibilidad. Implementar nonce/hashes antes de admitir usuarios externos.
- Añadir **rate limit por IP** o WAF externo a las credenciales; el bloqueo temporal por cuenta no basta ante ataques distribuidos.
- Crear proceso seguro de recuperar/modificar contraseñas y revocar sesiones. Al cambiar contraseña, invalidar las sesiones existentes.
- Incorporar lockfile validado y `npm ci`, copias de seguridad y restore probado.
- Auditar origen/CSRF en Server Actions detrás del proxy Railway.
- Proteger URLs, redirecciones y uploads mediante validación y destinos permitidos; no subir SVG arbitrario.
- Revisar cumplimiento de información alimentaria con personas responsables del restaurante.

## Reportes
No publicar secretos o detalles explotables en issues públicos. Usar un canal privado de contacto con el responsable.
