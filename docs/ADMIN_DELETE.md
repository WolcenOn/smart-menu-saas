# Generación de invitaciones y borrado de clientes

## Invitación
El panel /admin muestra y permite copiar la URL **completa** con dominio HTTPS, y tiene un enlace «Abrir invitación y comprobar». Antes solo mostraba una ruta relativa, por lo que copiar manualmente el campo podía producir un enlace no válido. Solo se puede consultar la URL al crearla; nunca se guarda en claro.

Si una invitación caducó, fue revocada o se utilizó, crea otra para un correo que aún no tiene cuenta. La ruta debe seguir el patrón /registro-restaurante/<token>.

## Gestión de clientes
El nuevo listado de clientes muestra nombre y estado (Activo / Sin acceso activo). Las cuentas se pueden pausar desde Usuarios registrados.

El botón **Eliminar cliente y datos de PostgreSQL** hace un borrado físico tras exigir la escritura exacta del nombre del restaurante:
- Elimina el restaurante y, por cascada, sus cartas, categorías, platos, alérgenos relacionados y registros de subidas.
- Elimina invitaciones asociadas al restaurante.
- Elimina usuarios que, tras borrar ese restaurante, no pertenecen a otro establecimiento.
- Preserva usuarios compartidos con otros restaurantes.
- Guarda únicamente un evento de auditoría técnica sin nombre ni correo del cliente.
- Cuando hay imágenes S3, exige almacenamiento configurado y borra los objetos antes de la base de datos. Si falla el almacenamiento, no se elimina la base de datos.

**Advertencia:** es irreversible. Necesita copia de seguridad de PostgreSQL antes de utilizarla con datos reales. Las cuentas con acceso revocado antiguamente y sin un restaurante asignado no se borran automáticamente.

Los detalles técnicos de borrado físico y sus implicaciones legales deben revisarse antes de una producción abierta.

## Railway
No hay variables nuevas. Mantener S3 configurado para eliminar clientes que tengan fotos. Mantener predeploy `npm run db:migrate`. Las comprobaciones CI incluyen el enlace completo y una prueba aislada de borrado real.

