# Taller HTTP, Headers, CORS y Seguridad – Programación de Redes (CIAF)

## Integrantes (orden alfabético por apellido) – miércoles

| Apellidos y nombres | N° de lista |
|---|---|
| Cardona Molina Jeefry | 3 |
| Gonzalez Zuluaga Jhojanixon | 9 |
| Osorio Gil Yandel Mauricio | 18 |

- **N = 3** (número de lista del primer integrante: Cardona Molina).
- **Header requerido:** `X-Red-Equipo: CIAF-3`
- **Header de respuesta:** `X-Servidor-Procesado: Equipo-3`

## Escenario
Servicio web de **consulta y registro de envíos** de una empresa de mensajería.
- `GET /api/envios` → consulta la lista de envíos.
- `POST /api/envios` → registra un envío (JSON: `guia`, `destino`, `estado`).

**Cliente que lo consumiría:** una aplicación web (navegador) de la empresa servida en `http://localhost:5500`, que consulta el estado de los paquetes.

**Riesgos de usar HTTP sin cifrado:** al desplegar el servicio en una red, alguien con capacidad de observar ese tráfico (por ejemplo, en una WiFi pública) podría leer las guías y destinos, o capturar el valor del header `X-Red-Equipo`, que viaja en texto plano. También podría modificar la respuesta en tránsito (ataque man-in-the-middle) y mostrar estados falsos. Esta versión del taller escucha solo en loopback, así que no está expuesta a otros equipos de la red.

## Cómo ejecutar
```bash
npm install
npm start
```
El servidor queda disponible únicamente en esta máquina, en `http://127.0.0.1:3000`.

## CORS
Se configuró el middleware `cors` permitiendo únicamente el origen `http://localhost:5500`. Cuando la petición trae `Origin: http://localhost:5500`, el servidor responde:

```
Access-Control-Allow-Origin: http://localhost:5500
```

**Qué hace CORS:** los navegadores aplican la política del mismo origen. CORS permite que el servidor indique qué orígenes pueden leer sus respuestas desde JavaScript; aquí se permite `http://localhost:5500`. CORS no autentica al cliente ni impide que Postman, `curl` u otros programas envíen peticiones. Además, una petición que no requiere preflight todavía puede llegar al servidor aunque el navegador luego impida que la página lea la respuesta. Por eso CORS no reemplaza la autenticación ni la protección contra CSRF. Postman no aplica las restricciones CORS del navegador.

**Nota sobre `X-Red-Equipo`:** el valor `CIAF-3` es fijo y está visible en el código y en la colección de Postman. Se utiliza para cumplir el ejercicio de validar un header, pero no es una credencial ni un mecanismo de autenticación seguro.

## Mapeo de la petición en el modelo TCP/IP
Petición `GET /api/envios` desde Postman hacia Express:

| Capa | Qué ocurre |
|---|---|
| **Aplicación** | Postman construye la petición HTTP (método GET, ruta `/api/envios`, header `X-Red-Equipo`). Express la recibe, valida el header y responde con JSON. |
| **Transporte** | TCP establece la conexión (three-way handshake) con el puerto destino 3000 y garantiza entrega ordenada y confiable de los segmentos. |
| **Internet** | IP encapsula los segmentos en paquetes con direcciones IP de origen y destino. En esta ejecución local se usa la interfaz loopback (`127.0.0.1`). |
| **Acceso a red** | En esta ejecución, el tráfico usa la interfaz loopback y no sale a la red física. En una red real, se transportaría en tramas por Ethernet/WiFi. |

La respuesta hace el camino inverso, de Express a Postman.

## HTTPS (SSL/TLS)
TLS cifra la comunicación entre cliente y servidor y protege tres cosas: **confidencialidad** (terceros en el camino no pueden leer los datos ni los headers), **integridad** (las alteraciones en tránsito se detectan) y **autenticidad** (el certificado permite verificar la identidad del servidor). En una conexión HTTPS protegería el header `X-Red-Equipo` y los datos de los envíos mientras viajan, aunque no convertiría ese header fijo en autenticación segura. Como modelo conceptual, HTTP viaja sobre TLS y TLS sobre TCP.

## Colección de Postman
Archivo: `Taller_HTTP_CORS.postman_collection.json` (importar en Postman). Las solicitudes usan `http://127.0.0.1:3000`, de acuerdo con la dirección local en la que escucha el servidor.
1. GET válido → 200
2. POST válido → 201
3. GET sin header → 401
4. Verificación de headers de respuesta (`X-Servidor-Procesado` y `Access-Control-Allow-Origin`)
5. POST con datos incompletos → 400
6. Preflight CORS para POST → 204

### Cómo ejecutar las pruebas en Postman
1. Instala Node.js si aún no está instalado. Abre una terminal en la carpeta del proyecto y ejecuta `npm install` una sola vez.
2. En esa terminal ejecuta `npm start`. Déjala abierta mientras haces las pruebas; debe mostrar que el servidor está escuchando en `http://127.0.0.1:3000`.
3. Abre Postman y selecciona **Import**. Importa `Taller_HTTP_CORS.postman_collection.json`.
4. Abre la colección importada y pulsa **Run** (o abre **Runner**, selecciona la colección y pulsa **Run**). Ejecuta las solicitudes en orden. La guía del POST válido usa `{{$guid}}`, así que no debe repetirse al correr la colección varias veces.
5. Revisa que cada prueba aparezca como **PASS**. Los códigos esperados son 200, 201, 401, 200, 400 y 204, respectivamente. La prueba 4 valida los headers CORS y `X-Servidor-Procesado`; la prueba 6 envía un preflight `OPTIONS`.

También puedes probar cada solicitud por separado abriéndola y pulsando **Send**. En la solicitud 3, confirma que no esté configurado `X-Red-Equipo`; debe responder 401. Postman permite inspeccionar respuestas, pero no aplica las restricciones CORS del navegador.

## Capturas de pantalla
> **Pendiente para la entrega:** después de ejecutar las pruebas, guarda una captura de la respuesta exitosa con los headers visibles como `capturas/exito.png`, y una captura de la respuesta 401 al omitir el header como `capturas/401.png`. Crea la carpeta `capturas/` si aún no existe y luego agrega las imágenes a este documento.
