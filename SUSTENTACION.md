# Guía de Sustentación del Proyecto HelpDesk Tickets

Este documento contiene las respuestas a las preguntas teóricas fundamentales requeridas para la sustentación y defensa del proyecto frente al evaluador/docente.

---

## 1. ¿Por qué se utilizan dos tokens (Access Token y Refresh Token) en lugar de uno solo de larga duración?

- **Minimización de Riesgos por Exposición (Access Token de vida corta):**  
  El **Access Token** viaja en la cabecera HTTP `Authorization: Bearer <token>` en cada petición a la API. Si este token es interceptado o expuesto por un ataque (como man-in-the-middle o inspección de memoria), el impacto es limitado porque su tiempo de vida es deliberadamente corto (por ejemplo, 15 minutos). Al expirar, el atacante pierde acceso inmediatamente.
  
- **Revocación y Control Centralizado (Refresh Token de vida larga):**  
  El **Refresh Token** solo se envía al servidor cuando el Access Token ha expirado a través del endpoint dedicado `/auth/refresh`. Permite al servidor validar si la sesión sigue siendo válida, si el usuario ha sido bloqueado o si su rol ha cambiado. Esto permite revocar accesos en el backend sin forzar al usuario a iniciar sesión repetidamente mientras su sesión esté activa.

---

## 2. Diferencias entre los códigos de estado HTTP 401 Unauthorized y 403 Forbidden

- **HTTP 401 Unauthorized (No Autenticado / Identidad no verificada):**  
  Indica que el cliente no ha proporcionado credenciales válidas o que su token de acceso ha expirado o es inválido. La respuesta `401` le dice al cliente: *"No sé quién eres o tus credenciales expiraron, debes autenticarte o renovar tu token"*. En nuestra aplicación, el `JwtInterceptor` intercepta las respuestas `401` para activar la renovación automática del token mediante `POST /auth/refresh`.

- **HTTP 403 Forbidden (No Autorizado / Permisos insuficientes):**  
  Indica que el servidor reconoce la identidad del usuario (está autenticado), pero este no tiene los permisos ni el rol necesario para acceder al recurso solicitado. Por ejemplo, un usuario con rol `client` intentando acceder a una ruta de administración `/admin`. La respuesta `403` le dice al cliente: *"Sé quién eres, pero no tienes permiso para realizar esta acción"*. En nuestra aplicación, el `roleGuard` previene esta situación redirigiendo al usuario a su dashboard.

---

## 3. Estrategias de almacenamiento seguro y mitigación de vulnerabilidades (XSS vs CSRF)

- **Ataques Cross-Site Scripting (XSS):**  
  Ocurren cuando un atacante logra ejecutar código JavaScript malicioso en el navegador de la víctima. Si el token está guardado en `localStorage`, cualquier script ejecutado en el contexto del sitio puede leerlo mediante `localStorage.getItem()`.  
  *Mitigación:* Desinfectar todas las entradas de usuario, habilitar políticas CSP (*Content Security Policy*) y, preferiblemente, utilizar cookies con la propiedad `HttpOnly` (no accesibles desde JS).

- **Ataques Cross-Site Request Forgery (CSRF):**  
  Ocurren cuando un sitio malicioso hace que el navegador del usuario envíe una petición no deseada a un servidor donde el usuario está autenticado, enviando automáticamente las cookies asociadas.  
  *Mitigación:* Al usar cabeceras `Authorization: Bearer` almacenando el token fuera de cookies automáticas (o usando cookies con atributo `SameSite=Strict/Lax` y tokens Anti-CSRF), se evita que peticiones originadas en dominios externos puedan adjuntar automáticamente la autenticación.

---

## 4. Funcionamiento de los Route Guards (`CanActivateFn`) e Interceptores HTTP en Angular

- **Route Guards (`authGuard` y `roleGuard`):**  
  Implementados mediante la API funcional `CanActivateFn` de Angular. Se ejecutan en la fase de navegación del enrutador antes de cargar cualquier componente o módulo lazy-loaded.
  - `authGuard`: Verifica si existe una sesión activa (`authService.isAuthenticated()`). Si no la hay, cancela la navegación y redirige a `/auth/login`.
  - `roleGuard`: Revisa la propiedad `data.roles` declarada en la ruta y la compara con el rol del usuario autenticado (`authService.getUserRole()`). Si no coincide, redirige al `/dashboard`.

- **HTTP Interceptor (`JwtInterceptor`):**  
  Intercepta de forma transparente todas las peticiones HTTP salientes para:
  1. Adjuntar la cabecera `Authorization: Bearer <accessToken>`.
  2. Escuchar las respuestas con error `401 Unauthorized`.
  3. Pausar las peticiones salientes simultáneas usando un `BehaviorSubject<string|null>` como cola mientras invoca `authService.refreshToken()`.
  4. Reintentar automáticamente la petición original con el nuevo token sin interrumpir la experiencia del usuario.
