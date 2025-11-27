

**Carrera**: Tecnicatura Universitaria en Programación

**Cátedra**: Programación IV

**Comisión**: Avellaneda

**Profesor/a**: Malfasi Federico

**Alumnos:** Aramburú-Lebus Santiago, Buseghin Agustín, Martinez Nestor, Tomadín Tobías, Vega Paula

**Fecha de entrega**: Martes 25 de Noviembre

**Año:** 2025


**💻 Documentación del API Backend**

El API se estructura en dos secciones principales: **Rutas de Usuario (autenticación)** y **Rutas de Productos** (protegidas por **JWT**). La implementación se basa en **Node.js/Express** y utiliza **Sequelize** como ORM. La seguridad de la contraseña se maneja con **Bcrypt**, y la autorización se gestiona mediante **JSON Web Tokens (JWT)**. El sistema incluye un **sistema de roles** (admin/cliente), **upload de imágenes** con **Multer**, **verificación externa de emails**, y un **sistema de auditoría** de cambios con tracking de modificaciones.

**Base URL:** http://localhost:3001

## **1\. Rutas de Usuario (Auth)**

Estos *endpoints* manejan el ciclo de vida del usuario (registro, inicio de sesión) y son cruciales para obtener el **JWT** necesario para acceder a los recursos protegidos. Rutas montadas en la raíz (/).

### **1.1. Registro de Usuario**

Crea un nuevo usuario en el sistema. Es obligatorio que la contraseña y su confirmación coincidan para evitar errores de tipeo y garantizar un *hash* correcto en la base de datos. El sistema incluye **verificación externa de emails** utilizando la API de emailvalidation.io para validar que el email sea legítimo, no sea temporal/desechable, y que el dominio tenga registros MX válidos.

* **URL:** /
* **Method:** POST

### **Body:**

* **Formato:** JSON

| Campo Requerido | Tipo | Descripción |
| :---- | :---- | :---- |
| fullName | string | Nombre completo del usuario. |
| **email** | string | Correo electrónico, debe ser **único** y será verificado externamente. |
| password | string | Contraseña que será *hasheada* con Bcrypt (10 rounds). |
| confirmPassword | string | Confirmación de la contraseña. |
| role | string | **Opcional**. Rol del usuario: 'cliente' (default) o 'admin'. |

### **Return (Respuesta Éxito \- 200 OK):**

* **Formato:** JSON

| Campo | Tipo | Descripción |
| :---- | :---- | :---- |
| error | boolean | false. |
| msg | string | Mensaje de confirmación: "Usuario creado correctamente". |

```json
{
  "error": false,
  "msg": "Usuario creado correctamente"
}
```

### **Ejemplo de Uso (cURL Request):**

```bash
curl --request POST \
  --url 'http://localhost:3001/' \
  --header 'Content-Type: application/json' \
  --data '{
    "fullName": "María González",
    "email": "maria.gonzalez@gmail.com",
    "password": "SecurePass2025!",
    "confirmPassword": "SecurePass2025!",
    "role": "cliente"
  }'
```

### **Respuestas de Error:**

**RESPONSE (Error \- 403 Forbidden \- Contraseñas no coinciden):**

```json
{
  "error": true,
  "msg": "Las contraseñas no coinciden"
}
```

**RESPONSE (Error \- 400 Bad Request \- Email inválido):**

```json
{
  "error": true,
  "msg": "El formato del email es inválido"
}
```

**RESPONSE (Error \- 400 Bad Request \- Email no existe):**

```json
{
  "error": true,
  "msg": "El email no existe o no es válido (verificación externa falló)"
}
```

**Nota de Error:** Si se intenta registrar un email ya existente, el servidor devolverá un código **400 Bad Request** con un mensaje de error de validación, ya que el campo **email** está marcado como único en el modelo.

**Nota sobre Verificación de Email:** El sistema valida emails contra la API de emailvalidation.io, verificando formato, existencia del dominio, registros MX, y que no sea un email temporal. Si la API externa falla, el sistema permite el registro de manera *graceful* (sin bloquear al usuario).

## **1.2. Iniciar Sesión**

Autentica al usuario y devuelve el **JSON Web Token (JWT)** necesario para las rutas protegidas. El JWT incluye información del usuario: **id**, **email** y **role**, los cuales son esenciales para el control de acceso y autorización en el frontend.

* **URL:** /login
* **Method:** POST

### **Body:**

* **Formato:** JSON

| Campo Requerido | Tipo | Descripción |
| :---- | :---- | :---- |
| email | string | Correo electrónico del usuario. |
| password | string | Contraseña (sin hashear). |

### **Return (Respuesta Éxito \- 200 OK):**

* **Formato:** JSON
* **Campos Clave:** El campo user.token contiene el **JWT** (prefijado con 'Bearer '). Usar en el *header* Authorization.

```json
{
  "error": false,
  "user": {
    "id": 12,
    "full_name": "María González",
    "email": "maria.gonzalez@gmail.com",
    "role": "cliente",
    "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoibWFyaWEuZ29uemFsZXpAZ21haWwuY29tIiwicm9sZSI6ImNsaWVudGUiLCJpYXQiOjE3MzI1MzQwMDAsImV4cCI6MTczMjYyMDQwMH0.XYZ..."
  }
}
```

### **Ejemplo de Uso (cURL Request):**

```bash
curl --request POST \
  --url 'http://localhost:3001/login' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "maria.gonzalez@gmail.com",
    "password": "SecurePass2025!"
  }'
```

### **Respuestas de Error Comunes:**

| Código | Cuerpo de Respuesta | Descripción |
| :---- | :---- | :---- |
| **404 Not Found** | {"error": true, "msg": "El usuario no existe"} | Email no encontrado. |
| **403 Forbidden** | {"error": true, "msg": "Password incorrecto"} | Contraseña ingresada incorrecta. |

## **1.3. Verificar Token**

Comprueba la validez, integridad y expiración de un token JWT. Retorna los datos del usuario decodificados del token, incluyendo su **id**, **email** y **role**.

* **URL:** /verify-token
* **Method:** GET
* **Protección:** Requiere **Header Authorization**

### **Headers:**

| Campo | Valor | Descripción |
| :---- | :---- | :---- |
| Authorization | Bearer \<TU\_JWT\_TOKEN\> | **Requerido** para acceder a la ruta. |

### **Return (Respuesta Éxito \- 200 OK):**

```json
{
  "error": false,
  "id": 12,
  "email": "maria.gonzalez@gmail.com",
  "role": "cliente"
}
```

### **Ejemplo de Uso (cURL Request):**

```bash
curl --request GET \
  --url 'http://localhost:3001/verify-token' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoibWFyaWEuZ29uemFsZXpAZ21haWwuY29tIiwicm9sZSI6ImNsaWVudGUiLCJpYXQiOjE3MzI1MzQwMDAsImV4cCI6MTczMjYyMDQwMH0.XYZ...'
```

### **Respuestas de Error Comunes:**

| Código | Cuerpo de Respuesta | Descripción |
| :---- | :---- | :---- |
| **401 Unauthorized** | {"error": true, "msg": "Token no proporcionado o formato incorrecto (Debe ser Bearer token)"} | El header Authorization falta o no tiene el formato correcto. |
| **403 Forbidden** | {"error": true, "msg": "Token inválido o expirado"} | El JWT no es válido, ha expirado, o está mal formado. |

## **2\. Rutas de Productos**

Montadas bajo /products. Implementan el **CRUD** (Crear, Leer, Actualizar, Eliminar) de productos, además de operaciones de **compra** que descuentan stock automáticamente. Los productos ahora incluyen **imágenes** (upload con Multer) y un **sistema de auditoría** que registra quién creó y quién fue el último en modificar cada producto.

🔒 **Protección JWT:** Los *endpoints* de escritura (POST, PUT, DELETE) y el endpoint de compra **requieren** el *header* Authorization: Bearer \<TU\_JWT\_TOKEN\_VALIDO\>. Las rutas de lectura (GET /products) son **públicas**.

### **2.1. Obtener Todos los Productos**

Devuelve una lista completa de todos los productos en la base de datos, incluyendo información del usuario que los creó (**creator**) y del último usuario que los modificó (**updater**). Esta ruta es **pública** y no requiere autenticación.

* **URL:** /products
* **Method:** GET
* **Protección:** NO requiere JWT (pública)

### **Return (Respuesta Éxito \- 200 OK):**

* **Formato:** JSON

| Campo | Tipo | Descripción |
| :---- | :---- | :---- |
| data | Product\[\] | Arreglo de objetos producto con relaciones de usuario. |

```json
{
  "error": false,
  "data": [
    {
      "id": 1,
      "name": "Laptop Lenovo ThinkPad X1",
      "price": "1850.00",
      "stock": 15,
      "imageUrl": "1732534100-987abc-laptop.jpg",
      "userId": 3,
      "lastUpdatedBy": 12,
      "createdAt": "2025-10-15T14:30:00.000Z",
      "updatedAt": "2025-11-20T09:15:00.000Z",
      "creator": {
        "id": 3,
        "fullName": "Carlos Fernández",
        "email": "carlos.fernandez@empresa.com"
      },
      "updater": {
        "id": 12,
        "fullName": "María González",
        "email": "maria.gonzalez@gmail.com"
      }
    },
    {
      "id": 2,
      "name": "Mouse Logitech MX Master 3",
      "price": "125.50",
      "stock": 48,
      "imageUrl": null,
      "userId": 3,
      "lastUpdatedBy": null,
      "createdAt": "2025-10-22T11:00:00.000Z",
      "updatedAt": "2025-10-22T11:00:00.000Z",
      "creator": {
        "id": 3,
        "fullName": "Carlos Fernández",
        "email": "carlos.fernandez@empresa.com"
      },
      "updater": null
    }
  ]
}
```

### **Ejemplo de Uso (cURL Request):**

```bash
curl --request GET \
  --url 'http://localhost:3001/products'
```

### **2.2. Crear un Nuevo Producto**

Agrega un nuevo producto a la base de datos con soporte para **subida de imagen**. El endpoint acepta datos en formato **multipart/form-data** para permitir el envío de archivos. La propiedad del producto se asigna automáticamente al usuario autenticado (tomando el **userId** del token JWT).

* **URL:** /products
* **Method:** POST
* **Protección:** JWT Requerido
* **Content-Type:** multipart/form-data

### **Headers:**

| Campo | Valor | Descripción |
| :---- | :---- | :---- |
| Authorization | Bearer \<TU\_JWT\_TOKEN\> | **Requerido** para autenticar al usuario. |
| Content-Type | multipart/form-data | **Requerido** para envío de archivos. |

### **Body (Form Data):**

| Campo Requerido | Tipo | Descripción |
| :---- | :---- | :---- |
| name | string | Nombre del producto. Debe ser único. |
| price | number | Precio de venta. Mínimo: 0. |
| stock | integer | Cantidad inicial en inventario. Mínimo: 1. |
| image | File | **Opcional**. Archivo de imagen. Tipos permitidos: jpeg, jpg, png, gif, webp. Tamaño máximo: 5MB. |

### **Return (Respuesta Éxito \- 200 OK):**

```json
{
  "error": false,
  "msg": "Producto cargado",
  "product": {
    "id": 15,
    "name": "Teclado Mecánico Keychron K2",
    "price": "180.00",
    "stock": 25,
    "imageUrl": "1732534200-456def-teclado.jpg",
    "userId": 12,
    "lastUpdatedBy": null,
    "createdAt": "2025-11-25T16:30:00.000Z",
    "updatedAt": "2025-11-25T16:30:00.000Z",
    "creator": {
      "id": 12,
      "fullName": "María González",
      "email": "maria.gonzalez@gmail.com"
    }
  }
}
```

### **Ejemplo de Uso (cURL Request):**

```bash
curl --request POST \
  --url 'http://localhost:3001/products' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoibWFyaWEuZ29uemFsZXpAZ21haWwuY29tIiwicm9sZSI6ImNsaWVudGUiLCJpYXQiOjE3MzI1MzQwMDAsImV4cCI6MTczMjYyMDQwMH0.XYZ...' \
  --form 'name="Teclado Mecánico Keychron K2"' \
  --form 'price="180.00"' \
  --form 'stock="25"' \
  --form 'image=@"/ruta/local/al/archivo/teclado.jpg"'
```

### **Respuestas de Error Comunes:**

| Código | Cuerpo de Respuesta | Descripción |
| :---- | :---- | :---- |
| **400 Bad Request** | {"error": true, "msg": "Nombre de producto ya existe"} | El nombre del producto debe ser único. |
| **400 Bad Request** | {"error": true, "msg": "Solo se permiten imagenes (jpeg, jpg, png, gif, webp)"} | Tipo de archivo no válido. |
| **400 Bad Request** | {"error": true, "msg": "La imagen no puede superar los 5MB"} | Archivo demasiado grande. |
| **401 Unauthorized** | {"error": true, "msg": "Token no proporcionado..."} | Falta el token de autenticación. |

### **2.3. Obtener Producto por ID**

Busca y devuelve los detalles completos de un producto específico, incluyendo información del creador y del último usuario que lo modificó. **Requiere autenticación** para acceder.

* **URL:** /products/product?id=...
* **Method:** GET
* **Parámetro:** id (Requerido) \- El ID del producto a buscar.
* **Protección:** JWT Requerido

### **Headers:**

| Campo | Valor | Descripción |
| :---- | :---- | :---- |
| Authorization | Bearer \<TU\_JWT\_TOKEN\> | **Requerido** para acceder a la ruta. |

### **Return (Respuesta Éxito \- 200 OK):**

```json
{
  "error": false,
  "product": {
    "id": 1,
    "name": "Laptop Lenovo ThinkPad X1",
    "price": "1850.00",
    "stock": 15,
    "imageUrl": "1732534100-987abc-laptop.jpg",
    "userId": 3,
    "lastUpdatedBy": 12,
    "createdAt": "2025-10-15T14:30:00.000Z",
    "updatedAt": "2025-11-20T09:15:00.000Z",
    "creator": {
      "id": 3,
      "fullName": "Carlos Fernández",
      "email": "carlos.fernandez@empresa.com"
    },
    "updater": {
      "id": 12,
      "fullName": "María González",
      "email": "maria.gonzalez@gmail.com"
    }
  }
}
```

### **Ejemplo de Uso (cURL Request):**

```bash
curl --request GET \
  --url 'http://localhost:3001/products/product?id=1' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoibWFyaWEuZ29uemFsZXpAZ21haWwuY29tIiwicm9sZSI6ImNsaWVudGUiLCJpYXQiOjE3MzI1MzQwMDAsImV4cCI6MTczMjYyMDQwMH0.XYZ...'
```

### **Respuesta de Error Común:**

| Código | Cuerpo de Respuesta | Descripción |
| :---- | :---- | :---- |
| **404 Not Found** | {"error": true, "msg": "Producto no encontrado"} | El ID de producto no existe. |
| **401 Unauthorized** | {"error": true, "msg": "Token no proporcionado..."} | Falta el token de autenticación. |

### **2.4. Actualizar Producto por ID**

Realiza una actualización completa del registro de un producto, con soporte para **actualizar o agregar una imagen**. El sistema automáticamente registra quién realizó la modificación actualizando el campo **lastUpdatedBy** con el ID del usuario autenticado.

* **URL:** /products?id=...
* **Method:** PUT
* **Parámetro:** id (Requerido) \- ID del producto a actualizar.
* **Protección:** JWT Requerido
* **Content-Type:** multipart/form-data

### **Headers:**

| Campo | Valor | Descripción |
| :---- | :---- | :---- |
| Authorization | Bearer \<TU\_JWT\_TOKEN\> | **Requerido** para autenticar al usuario. |
| Content-Type | multipart/form-data | **Requerido** para envío de archivos. |

### **Body (Form Data):**

| Campo Requerido | Tipo | Descripción |
| :---- | :---- | :---- |
| name | string | Nuevo nombre del producto. |
| price | number | Nuevo precio. |
| stock | integer | Nuevo stock. |
| image | File | **Opcional**. Nueva imagen o imagen a agregar. Mismas restricciones que en creación. |

### **Return (Respuesta Éxito \- 200 OK):**

```json
{
  "error": false,
  "msg": "Producto actualizado"
}
```

### **Ejemplo de Uso (cURL Request):**

```bash
curl --request PUT \
  --url 'http://localhost:3001/products?id=1' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoibWFyaWEuZ29uemFsZXpAZ21haWwuY29tIiwicm9sZSI6ImNsaWVudGUiLCJpYXQiOjE3MzI1MzQwMDAsImV4cCI6MTczMjYyMDQwMH0.XYZ...' \
  --form 'name="Laptop Lenovo ThinkPad X1 Carbon"' \
  --form 'price="1950.00"' \
  --form 'stock="12"' \
  --form 'image=@"/ruta/local/al/archivo/laptop-actualizada.jpg"'
```

### **Respuesta de Error Común:**

| Código | Cuerpo de Respuesta | Descripción |
| :---- | :---- | :---- |
| **404 Not Found** | {"error": true, "msg": "No se puede actualizar, porque no existe"} | El ID de producto no existe. |
| **403 Forbidden** | {"error": true, "msg": "No autorizado"} | El usuario autenticado no es el propietario del producto. |

### **2.5. Eliminar Producto por ID**

Elimina permanentemente un producto de la base de datos. Solo el propietario del producto (usuario que lo creó) puede eliminarlo.

* **URL:** /products?id=...
* **Method:** DELETE
* **Parámetro:** id (Requerido) \- ID del producto a eliminar.
* **Protección:** JWT Requerido

### **Headers:**

| Campo | Valor | Descripción |
| :---- | :---- | :---- |
| Authorization | Bearer \<TU\_JWT\_TOKEN\> | **Requerido** para autenticar al usuario. |

### **Return (Respuesta Éxito \- 200 OK):**

```json
{
  "error": false,
  "msg": "Producto eliminado"
}
```

### **Ejemplo de Uso (cURL Request):**

```bash
curl --request DELETE \
  --url 'http://localhost:3001/products?id=15' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoibWFyaWEuZ29uemFsZXpAZ21haWwuY29tIiwicm9sZSI6ImNsaWVudGUiLCJpYXQiOjE3MzI1MzQwMDAsImV4cCI6MTczMjYyMDQwMH0.XYZ...'
```

### **Respuestas de Error Comunes:**

| Código | Cuerpo de Respuesta | Descripción |
| :---- | :---- | :---- |
| **404 Not Found** | {"error": true, "msg": "Producto no encontrado"} | El ID de producto no existe. |
| **403 Forbidden** | {"error": true, "msg": "No autorizado"} | El usuario autenticado no es el propietario del producto. |

### **2.6. Comprar Productos (Procesar Carrito)**

Procesa una compra de uno o múltiples productos, validando el stock disponible y actualizando las cantidades automáticamente. Este endpoint es utilizado por el sistema de carrito de compras del frontend. Además de descontar stock, actualiza el campo **lastUpdatedBy** de cada producto afectado.

* **URL:** /products/buy
* **Method:** POST
* **Protección:** JWT Requerido

### **Headers:**

| Campo | Valor | Descripción |
| :---- | :---- | :---- |
| Authorization | Bearer \<TU\_JWT\_TOKEN\> | **Requerido** para autenticar al usuario. |
| Content-Type | application/json | Formato del body. |

### **Body:**

* **Formato:** JSON

| Campo Requerido | Tipo | Descripción |
| :---- | :---- | :---- |
| cart | Array\<{id: number, qty: number}\> | Arreglo de objetos con el ID del producto y la cantidad a comprar. |

### **Ejemplo de Body:**

```json
{
  "cart": [
    {
      "id": 1,
      "qty": 2
    },
    {
      "id": 15,
      "qty": 1
    }
  ]
}
```

### **Return (Respuesta Éxito \- 200 OK):**

```json
{
  "error": false,
  "msg": "Compra procesada (simulada) y stock actualizado"
}
```

### **Ejemplo de Uso (cURL Request):**

```bash
curl --request POST \
  --url 'http://localhost:3001/products/buy' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoibWFyaWEuZ29uemFsZXpAZ21haWwuY29tIiwicm9sZSI6ImNsaWVudGUiLCJpYXQiOjE3MzI1MzQwMDAsImV4cCI6MTczMjYyMDQwMH0.XYZ...' \
  --header 'Content-Type: application/json' \
  --data '{
    "cart": [
      {"id": 1, "qty": 2},
      {"id": 15, "qty": 1}
    ]
  }'
```

### **Respuestas de Error Comunes:**

| Código | Cuerpo de Respuesta | Descripción |
| :---- | :---- | :---- |
| **400 Bad Request** | {"error": true, "msg": "Carrito vacío"} | El arreglo cart está vacío o no fue enviado. |
| **400 Bad Request** | {"error": true, "msg": "Stock insuficiente para Producto X"} | No hay suficiente stock disponible para completar la compra. |
| **404 Not Found** | {"error": true, "msg": "Producto con ID X no encontrado"} | Uno de los productos del carrito no existe. |

**Nota:** Este endpoint NO procesa pagos reales. Es una simulación que solo actualiza el stock. La integración con pasarelas de pago (Mercado Pago, Uala, MODO) se maneja en el frontend de manera simulada.

## **2.7. Lógica de Seguridad y Autorización (Backend)**

Este apartado detalla la implementación de seguridad en las rutas del CRUD de productos, específicamente en el archivo product.mjs.

### **Rutas Públicas (Lectura sin Autenticación)**

* **Endpoint:** GET /products (obtener todos los productos).
* **Autenticación:** **NO** requiere autenticación (no utiliza el middleware verifyToken).
* **Práctica de Seguridad:** Las consultas a la base de datos que incluyen referencias al usuario (JOINs) utilizan explícitamente attributes: \['id', 'fullName', 'email'\] en la consulta include. Esto previene que datos sensibles del usuario (como *hash* de contraseña o *activateToken*) sean accidentalmente filtrados a través de *endpoints* públicos.

### **Rutas Privadas (Requieren Autenticación)**

* **Endpoints:** GET /products/product?id=... (por ID), POST /products (Creación), PUT /products?id=... (Actualización), DELETE /products?id=... (Eliminación), y POST /products/buy (Compra).
* **Autenticación:** Todas estas rutas están protegidas por el *middleware* de autenticación (verifyToken), el cual valida el JWT y adjunta la identidad del usuario en **req.user**.

#### **Middleware verifyToken:**

Valida que el header Authorization esté presente, tenga el formato correcto (Bearer token), y que el token JWT sea válido y no haya expirado. Si la validación es exitosa, decodifica el token y adjunta los datos del usuario (id, email, role) en `req.user`, haciéndolos disponibles para las rutas protegidas.

#### **Control de Propiedad (Autorización a Nivel de Objeto)**

1. **Creación (POST /products):**
   * La propiedad del producto se asigna de forma segura usando **userId: req.user.id**.
   * El ID del propietario se toma **siempre** del token de sesión verificado (req.user.id), **nunca** del cuerpo de la solicitud (req.body). Esto es fundamental para prevenir la suplantación de identidad al crear ítems.
2. **Actualización (PUT /products) y Eliminación (DELETE /products):**
   * Implementan un estricto control de acceso a nivel de objeto. **No basta con estar autenticado.**
   * **Verificación:** El sistema busca el producto por ID (Product.findByPk(req.params.id)) y verifica explícitamente la propiedad: if (product.userId \!== req.user.id).
   * **Resultado:** Si la comprobación falla (el usuario autenticado no es el dueño), se devuelve una respuesta **403 Forbidden (No autorizado)**. Si pasa, se ejecuta la acción (.save() o .destroy()).
3. **Auditoría (Campo lastUpdatedBy):**
   * Cada vez que un producto es actualizado (PUT) o cuando se procesa una compra (POST /products/buy), el campo **lastUpdatedBy** se actualiza con el ID del usuario autenticado (**req.user.id**).
   * Esto permite un tracking completo de quién realizó la última modificación al producto, útil para auditorías y el panel de historial en el frontend.

## **2.8. Sistema de Imágenes**

El sistema incluye funcionalidad completa para subir, almacenar y servir imágenes de productos.

### **Backend:**

* **Middleware:** Multer se utiliza para manejar uploads multipart/form-data.
* **Storage:** Las imágenes se almacenan en la carpeta `back/uploads/` con nombres únicos generados con timestamp y sufijo aleatorio (ej: `1732534200-456def-teclado.jpg`).
* **Validaciones:**
  * **Tipo de archivo:** Solo se permiten jpeg, jpg, png, gif, webp.
  * **Tamaño máximo:** 5MB por archivo.
* **Servicio de archivos estáticos:** La carpeta `uploads/` se sirve como ruta estática en `/uploads`, permitiendo acceso directo a las imágenes desde el frontend.
* **Campo en BD:** El modelo Product incluye el campo **imageUrl** (STRING, nullable) que almacena el nombre del archivo (no la ruta completa).

### **Frontend:**

* **Upload:**
  * El componente ProductForm incluye un input de tipo file con funcionalidad de drag & drop.
  * Muestra un preview de la imagen antes de enviar el formulario.
  * Valida tipo de archivo y tamaño en el lado del cliente antes de enviar.
* **Visualización:**
  * El componente ProductCard construye la URL completa concatenando `VITE_API_URL + '/uploads/' + imageUrl`.
  * Si un producto no tiene imagen, muestra un placeholder o imagen por defecto.
* **Edición:**
  * Al editar un producto existente, si no se selecciona una nueva imagen, se conserva la imagen actual.
  * Si se sube una nueva imagen, reemplaza la anterior.

### **URL de Acceso a Imágenes:**

```
http://localhost:3001/uploads/1732534200-456def-teclado.jpg
```

## **3\. Lógica de Autorización en el Frontend (UX)**

La aplicación de frontend implementa una **doble verificación** de seguridad para optimizar la experiencia de usuario (UX) al evitar mostrar acciones que no están permitidas. Además, el sistema diferencia entre dos tipos de usuarios: **admin** y **cliente**, cada uno con permisos y vistas distintas.

### **Sistema de Roles**

El sistema implementa dos roles de usuario:

* **admin:** Tiene permisos completos para gestionar el inventario (crear, editar, eliminar productos). Ve el panel de historial de modificaciones. **NO** tiene acceso al sistema de carrito de compras.
* **cliente:** Puede ver todos los productos y agregar items al carrito de compras para realizar compras. **NO** puede crear, editar o eliminar productos.

El rol del usuario se almacena en el JWT y se verifica tanto en el backend (middleware) como en el frontend (UI condicional).

### **Componente ProductRow.jsx**

* **Lógica de UI:** El componente determina si el usuario actual es el propietario del producto usando la lógica const isOwner \= user?.id \=== data.userId.
* **Renderizado Condicional:** Los botones de acción (**"Editar"** y **"Eliminar"**) solo se renderizan y muestran en la interfaz si isOwner es verdadero.

### **Componente ProductCard.jsx**

* **Lógica de UI:** Muestra un botón "Agregar al carrito" visible para todos los usuarios en la vista pública.
* **Vista:** Diseñado como tarjeta (*card*) con imagen, nombre, precio, stock y acciones.
* **Indicador de carrito:** Muestra un badge con la cantidad si el producto ya está en el carrito.

### **Componente Navbar.jsx**

* **Renderizado Condicional:** El botón "Carrito" con el contador de items solo se muestra si el usuario autenticado tiene rol **cliente**.
* **Usuarios admin:** NO ven el botón del carrito, ya que su función es gestionar el inventario, no realizar compras.

**Importante (Doble Verificación):**

La seguridad **real** reside exclusivamente en el **Backend (API)**. El frontend solo oculta botones para el usuario honesto. Si un usuario intenta forzar una petición no autorizada (ej. modificando el DOM o usando una herramienta de terceros), el Backend la rechazará de manera segura con un **403 Forbidden**, independientemente de lo que muestre la interfaz de usuario.

# 📖 Documentación Frontend: Inventario APP

Este documento describe las principales rutas (vistas) y los *layouts* (contenedores) de la aplicación, su propósito y sus componentes visuales clave, según la estructura definida en `App.jsx`. El sistema incluye vistas públicas de productos, autenticación, gestión de inventario para admins, y un **sistema completo de carrito de compras** con checkout y generación de tickets para clientes.

## 1. Layouts (Contenedores de Ruta)

### 1.1. Layout Público (`<Public />`)

* **Archivo:** `Public.jsx`
* **Rutas que envuelve:** `/` (Vista pública de productos), `/login` (Login) y `/register` (Registro).
* **Descripción:** Es el contenedor para usuarios *no* autenticados y para la vista pública de productos. Provee el fondo (`deposito.jpg`) y una capa de opacidad oscura.


### 1.2. Layout Privado (`<Private />`)

* **Archivo:** `Private.jsx`
* **Rutas que envuelve:** `/private` (Listado con permisos de admin), `/private/product/new` (Crear), `/private/product/edit/:id` (Editar), `/cart` (Carrito), `/checkout` (Checkout), y `/ticket` (Ticket de compra).
* **Descripción:** Es el contenedor para usuarios *autenticados*. Muestra la barra de navegación superior persistente con el nombre del usuario y, dependiendo del rol, acceso al carrito o al dashboard de administración.
* **Vistas Clave:**
    * **Header Persistente:**
        ![Barra de navegación privada con 'Inventario APP', 'Bienvenido' y 'Cerrar Sesión']
  
    * **Toast de Cierre de Sesión:**
        ![Notificación (toast) azul de 'Sesión cerrada']

---



## 2. 🗺️ Documentación de Rutas

### 📍 Ruta: `/` (Vista Pública de Productos)

* **Componente:** `ProductList.jsx` (modo público)
* **Layout:** `<Public />`
* **Descripción:** Página principal que muestra todos los productos disponibles en formato de tarjetas (*cards*). Los usuarios pueden ver detalles de productos y agregar items al carrito. No requiere autenticación.
   ![Listado de Productos](imagenes/lista_productos.jpeg)
* **Características:**
    * Muestra productos con imágenes, nombre, precio y stock
    * Botón "Agregar al carrito" en cada producto
    * Si el usuario no está autenticado y hace clic en "Agregar al carrito", se redirige a `/login?fromCart=true`
    * Si el usuario está autenticado como **cliente**, puede agregar productos libremente
    * Header muestra contador de items en el carrito (si hay productos agregados)
 ![Detalle Contador Carrito](imagenes/inicio.jpeg)

### 📍 Ruta: `/login` (Iniciar Sesión)

* **Componente:** `Login.jsx`
* **Layout:** `<Public />`
* **Descripción:** Página de inicio de sesión.
* **Características:**
    * Si se accede con el parámetro `?fromCart=true`, después del login exitoso redirige a `/checkout` en lugar de `/private`
    * Muestra mensajes de error si las credenciales son incorrectas
* **Vistas Clave:**
    * **Estado Inicial:**
        ![Formulario de 'Iniciar Sesión' vacío sobre fondo de almacén]
       ![Formulario Login](imagenes/login.jpeg)
    * **Estado de Carga:**
        ![Botón de formulario en estado deshabilitado con texto 'Cargando...']
      
    * **Éxito (Toast):**
         ![Login Correcto](imagenes/exito_login.jpeg)

### 📍 Ruta: `/register` (Registro)

* **Componente:** `Register.jsx`
* **Layout:** `<Public />`
* **Descripción:** Página de registro de nuevos usuarios. Permite elegir el rol (cliente por defecto, o admin). El sistema valida el email contra una API externa para verificar su legitimidad.
* **Vistas Clave:**
    * **Estado Inicial:**
        ![Formulario de 'Registrarse' vacío sobre fondo de almacén]
      
    * **Error de Validación (Nativo):**
        ![Error de validación nativo del navegador en campo de email]
      
    * **Error (Toast):**
        ![Notificación (toast) roja de error 'Las contraseñas no coinciden']
      
    * **Éxito (Toast):**
        ![Notificación (toast) verde de 'Usuario creado']
      


### 📍 Ruta: `/private` (Dashboard de Administración)

* **Componente:** `ProductList.jsx` (modo privado/admin)
* **Layout:** `<Private />`
* **Descripción:** "Dashboard" principal para usuarios **admin**. Muestra el listado de todos los productos con opciones de edición y eliminación para los productos propios. Incluye un **Panel de Historial** lateral que muestra las últimas 5 modificaciones realizadas en el inventario.
* **Características:**
    * Solo usuarios con rol **admin** ven los botones de Editar y Eliminar en productos que les pertenecen
    * Panel de historial muestra productos nuevos y modificaciones recientes con detalles del usuario que realizó el cambio
    * Botón "Cargar Producto" para crear nuevos productos
* **Vistas Clave:**
    * **Listado de Productos y Panel de Historial:**
        ![Dashboard principal con lista de productos y panel de historial]
       
    * **Confirmación de Borrado:**
        ![Alerta nativa del navegador 'Desea eliminar el producto']
       ![Panel de Control](imagenes/panel.jpeg)
    * **Éxito de Borrado (Toast):**
        ![Notificación (toast) azul de 'Producto eliminado correctamente']
      

### 📍 Ruta: `/private/product/new` (Crear Producto)

* **Componente:** `ProductForm.jsx` (Modo "Crear")
* **Layout:** `<Private />`
* **Descripción:** Muestra un formulario para crear un nuevo producto. Incluye funcionalidad de upload de imagen con drag & drop y preview.
* **Características:**
    * Validación de campos requeridos (nombre, precio, stock)
    * Upload de imagen opcional con preview
    * Validación de tipo de archivo y tamaño máximo (5MB)
    * Solo accesible para usuarios **admin**
* **Vistas Clave:**
    * **Estado Inicial:**
        ![Formulario de 'Cargar Producto' con campos vacíos]
      ![Formulario Crear Nuevo](imagenes/crear.jpeg)
    * **Errores de Validación (App):**
        ![Formulario 'Cargar Producto' mostrando errores de validación en rojo]
      
    * **Errores de Validación (Nativo):**
        ![Error de validación nativo del navegador en campo 'Stock' por decimal]
      
    * **Éxito (Toast):**
        ![Notificación (toast) verde de 'Producto cargado']
      ![Producto Creado Exitosamente](imagenes/exito_crear.jpeg)


### 📍 Ruta: `/private/product/edit/:id` (Editar Producto)

* **Componente:** `ProductForm.jsx` (Modo "Editar")
* **Layout:** `<Private />`
* **Descripción:** Muestra un formulario para editar un producto existente. Solo el propietario del producto puede acceder a esta ruta.
* **Características:**
    * Carga automática de datos del producto existente
    * Permite actualizar imagen o mantener la actual
    * Registra automáticamente el último usuario que modificó el producto
* **Vistas Clave:**
    * **Estado Inicial (Datos Cargados):**
        ![Formulario de 'Editar Producto' con campos rellenados]
       ![Formulario Edición](imagenes/editar.jpeg)

### 📍 Ruta: `/cart` (Carrito de Compras)

* **Componente:** `CartPage.jsx`
* **Layout:** `<Private />`
* **Descripción:** Muestra todos los productos agregados al carrito con sus cantidades y subtotales. Permite eliminar items, ajustar cantidades, y proceder al checkout.
* **Características:**
    * Lista de productos en el carrito con imagen, nombre, precio unitario, cantidad y subtotal
    * Botón para eliminar items individuales del carrito
    * Cálculo automático del total de la compra
    * Botón "Comprar" que redirige a `/checkout`
    * Si el usuario no está autenticado, redirige a `/login?fromCart=true`
    * Validación de stock disponible (no permite agregar más cantidad que el stock actual)

     ![Vista del Carrito](imagenes/carrito.jpeg)

### 📍 Ruta: `/checkout` (Checkout y Selección de Pago)

* **Componente:** `Checkout.jsx`
* **Layout:** `<Private />`
* **Descripción:** Página de confirmación de compra donde el usuario selecciona el método de pago y finaliza la transacción. Genera un ticket en formato PDF descargable.
* **Características:**
    * Resumen completo de la compra (productos, cantidades, precios)
    * Tres métodos de pago simulados: **Mercado Pago**, **Uala**, y **MODO**
    * Al confirmar la compra:
      * Llama al endpoint `POST /products/buy` para actualizar el stock
      * Genera un ticket PDF usando jsPDF
      * Limpia el carrito automáticamente
      * Redirige a `/private` con mensaje de éxito
    * Opción de descargar el ticket de compra como PDF
    * Muestra total a pagar


### 📍 Ruta: `/ticket` (Ticket de Compra)

* **Componente:** `TicketPurchase.jsx`
* **Layout:** `<Private />`
* **Descripción:** Visualiza el ticket de compra completo con todos los detalles de la transacción. Permite descargar el ticket como imagen o PDF.
* **Características:**
    * Muestra detalles completos: fecha, hora, usuario, método de pago, productos comprados, cantidades, precios
    * Botón para descargar el ticket como PDF usando html2canvas y jsPDF
    * Recibe datos de la compra a través de `location.state` desde el componente Checkout
    * Diseño de ticket profesional con formato de recibo

 ![Descarga de PDF en Navegador](imagenes/descarga.jpeg)

### 📍 Ruta: `*` (Página 404)

* **Componente:** `<h1>404</h1>` (Inline)
* **Descripción:** Ruta "catch-all" si el usuario navega a una URL que no existe.

---

## 3. 🧩 Componentes Reutilizables (UI)

### **Componentes de Formularios:**
* **`Form.jsx`:** Contenedor blanco con sombra y título (Login/Registro).
* **`Input.jsx`:** Componente de input de formulario (etiqueta + campo).
* **`FormInputWithError.jsx`:** Input con validación y mensajes de error integrados.
* **`FormHeader.jsx`:** Encabezado consistente para formularios.
* **`Button.jsx`:** Botón estándar de la aplicación.

### **Componentes de Productos:**
* **`Container.jsx`:** Contenedor blanco para el listado de productos.
* **`ProductRow.jsx`:** Componente individual para mostrar cada producto en lista (vista admin).
* **`ProductCard.jsx`:** Tarjeta (*card*) de producto con imagen para vista pública y carrito.
* **`ProductsList.jsx`:** Componente contenedor de la lista de productos.
* **`EmptyProductsMessage.jsx`:** Mensaje cuando no hay productos en la lista.

### **Componentes de UI:**
* **`LoadingSpinner.jsx`:** Indicador de carga animado.
* **`HistoryPanel.jsx`:** Panel lateral que muestra las últimas 5 modificaciones del inventario con información de quién creó/modificó cada producto y cuándo.

### **Componentes de Navegación:**
* **`Navbar.jsx`:** Barra de navegación principal que muestra el nombre del usuario, contador de items en el carrito (solo para clientes), y botón de cerrar sesión.

### **Layouts:**
* **`Public.jsx`:** Layout para rutas públicas con fondo de almacén.
* **`Private.jsx`:** Layout para rutas privadas con navbar persistente.

---

## 4. 💾 Gestión de Estado (Zustand Store)

La aplicación utiliza **Zustand** para el manejo del estado global, específicamente para la gestión del carrito de compras. El estado se persiste en **localStorage** para mantener el carrito entre sesiones del navegador.

### **Store: useStore.js**

**Estados:**
* `user`: Información del usuario autenticado (id, fullName, email, role, token).
* `cart`: Arreglo de productos en el carrito con cantidades.

**Funciones del Carrito:**
* `addToCart(product)`: Agrega un producto al carrito o incrementa su cantidad si ya existe.
* `removeFromCart(id)`: Elimina un producto del carrito por ID.
* `updateQty(id, qty)`: Actualiza la cantidad de un producto específico (respeta límite de stock).
* `clearCart()`: Vacía completamente el carrito.
* `cartCount()`: Retorna el número total de items en el carrito (suma de cantidades).
* `cartTotal()`: Calcula el total en pesos de todos los productos en el carrito.

**Persistencia:**
* El carrito se guarda automáticamente en `localStorage` con la key `cart-storage`.
* Al cargar la aplicación, el estado del carrito se restaura desde localStorage.

---

## 5. 🛒 Flujo del Sistema de Carrito de Compras

### **Paso 1: Agregar Productos al Carrito**
* El usuario visita la ruta `/` (vista pública) o `/private` (si es admin)
* Ve productos mostrados como tarjetas (ProductCard)
* Hace clic en "Agregar al carrito" en un producto
* Si NO está autenticado, se redirige a `/login?fromCart=true`
* Si está autenticado, el producto se agrega al carrito (estado global Zustand)
* Se muestra un badge con la cantidad en la tarjeta del producto
* El contador del navbar se actualiza

### **Paso 2: Ver el Carrito**
* El usuario hace clic en el botón "Carrito" del navbar (visible solo para clientes)
* Se redirige a `/cart`
* Ve la lista completa de productos agregados con cantidades y subtotales
* Puede eliminar items o ajustar cantidades
* Ve el total de la compra
* Hace clic en "Comprar" para continuar

### **Paso 3: Checkout y Pago**
* Se redirige a `/checkout`
* Ve un resumen completo de la compra
* Selecciona un método de pago: Mercado Pago, Uala, o MODO
* Hace clic en "Pagar"
* El sistema:
  1. Valida que el usuario esté autenticado
  2. Llama al endpoint `POST /products/buy` con el contenido del carrito
  3. El backend valida stock y actualiza las cantidades
  4. Genera un ticket PDF con jsPDF
  5. Limpia el carrito en el store y en localStorage
  6. Muestra mensaje de éxito
  7. Ofrece descargar el ticket como PDF
  8. Redirige a `/private` tras 3 segundos

### **Paso 4: Ticket de Compra**
* El usuario es redirigido automáticamente a `/ticket` o puede acceder manualmente si guardó el link
* Ve un ticket detallado con:
  * Fecha y hora de la compra
  * Nombre del usuario comprador
  * Método de pago seleccionado
  * Lista de productos comprados con cantidades y precios
  * Total pagado
* Puede descargar el ticket como PDF usando el botón "Descargar Ticket"

---

## 6. 🎨 Tecnologías y Librerías del Frontend

### **Core:**
* **React 19** - Framework de UI
* **Vite** - Build tool y dev server
* **React Router DOM 7** - Enrutamiento

### **Estado:**
* **Zustand 5** - Gestión de estado global (carrito, usuario)

### **UI/UX:**
* **Tailwind CSS 4** - Framework de estilos utility-first
* **React Toastify** - Notificaciones toast

### **Generación de PDFs:**
* **jsPDF** - Generación de archivos PDF
* **html2canvas** - Captura de elementos HTML como imágenes para incluir en PDFs

### **Comunicación con API:**
* **Fetch API** - Llamadas HTTP al backend

---

## 7. 🔐 Variables de Entorno del Frontend

El frontend requiere la siguiente variable de entorno configurada en un archivo `.env`:

```
VITE_API_URL=http://localhost:3001
```

Esta variable se utiliza para construir las URLs de los endpoints del backend y para acceder a las imágenes de productos servidas como archivos estáticos.

---

## 8. 📋 Resumen de Diferencias entre Roles

### **Usuario Admin:**
* Ve la ruta `/private` con el dashboard y panel de historial
* Puede crear, editar y eliminar productos (solo los propios)
* NO ve el botón del carrito en el navbar
* NO puede realizar compras
* Ve todos los productos en formato de lista (ProductRow)
* Acceso a `/private/product/new` y `/private/product/edit/:id`

### **Usuario Cliente:**
* Ve la ruta `/` con productos en formato de tarjetas (ProductCard)
* NO puede crear, editar o eliminar productos
* Ve el botón del carrito con contador en el navbar
* Puede agregar productos al carrito y realizar compras
* Acceso completo a `/cart`, `/checkout`, y `/ticket`
* Ve la misma lista de productos que los admins en `/private`, pero sin permisos de edición

### **Usuario No Autenticado:**
* Puede ver la lista pública de productos en `/`
* Puede intentar agregar al carrito, pero será redirigido a `/login?fromCart=true`
* Puede registrarse en `/register`
* Después del login, si venía del carrito, es redirigido a `/checkout`

---

**Fin de la documentación**
