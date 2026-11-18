# Alta sencilla para restaurantes (piloto)

## Experiencia de usuario

- **/registro-restaurante**: un formulario independiente con nombre del restaurante, nombre del propietario, email, contraseña y código de invitación.
- **/acceso**: únicamente inicio de sesión para propietarios y personal existente.
- **/panel**: al entrar, el propietario ve su restaurante, su tema y el editor de cartas.
- La creación inicial de restaurante, carta publicada vacía, categoría inicial, usuario y membresía OWNER ocurre en **una sola transacción PostgreSQL**.
- La dirección pública se genera automáticamente con un slug y sufijo aleatorio. No hay que tocar SQL ni ejecutar bootstrap manual.
- Se reutiliza Auth.js Credentials; OAuth podrá activarse posteriormente sin cambiar el modelo de restaurante.

## Configuración Railway

El servicio web necesita las variables existentes: DATABASE_URL, AUTH_SECRET, AUTH_TRUST_HOST=true bajo proxy HTTPS confiable.

**Nueva variable obligatoria para abrir el registro del piloto:**
- `RESTAURANT_SIGNUP_CODE`: secreto aleatorio de **al menos 32 caracteres**. Generarlo con `openssl rand -hex 32` y guardarlo **solo** en Railway Variables. Compartir el código individualmente con los restaurantes invitados, no publicarlo en el frontend ni en GitHub.

Si no está configurada, el formulario muestra que las altas requieren invitación y **no crea cuentas**. No utilizar claves compartidas con poca entropía.

## Restricciones y futuro

Este código compartido es una solución temporal de **piloto cerrado**, no un sistema multiusuario de invitaciones. Antes de abrir el registro al público debemos añadir verificación de correo, límite por IP y cuenta, límites de creación de establecimientos y recuperación de contraseña. No hay validación comercial ni prueba automática de titularidad del restaurante.

Durante el piloto, las cuentas nuevas solo pueden administrar los restaurantes creados por ellas, no los existentes. Las autorizaciones se verifican en PostgreSQL desde cada operación del servidor.

Las variables de Railway se actualizan en Settings → Variables; después se aplica el despliegue correspondiente. No hace falta cambiar la rama de despliegue (`main`) ni registrar Google OAuth.
