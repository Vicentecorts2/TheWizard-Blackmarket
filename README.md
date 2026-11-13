# 🧙 TheWizard Blackmarket

E-commerce full stack de armas, reliquias y conjuros de fantasía medieval. Los aventureros compran con **monedas de oro**, cada objeto exige un **nivel mínimo** para usarse, y el Maestro Herrero administra el arsenal y las órdenes desde su propio panel.

Proyecto de portafolio construido con **React**, **Node.js/Express**, **Prisma** y **SQLite**, con una API REST propia, autenticación JWT y reglas de negocio validadas en el servidor.

![Catálogo](docs/capturas/catalogo.png)

---

## ✨ Funcionalidades

### Para aventureros (clientes)
- Catálogo con búsqueda en vivo y filtros por categoría, rareza y elemento
- Objetos con rareza visual estilo videojuego: común, raro, épico y legendario
- Registro e inicio de sesión con sesión persistente
- Carrito guardado en el navegador y sincronizado con el stock real al abrirlo
- Compra con validación de **nivel**, **oro** y **stock**
- Perfil con nivel, oro disponible e historial de órdenes

### Para el Maestro Herrero (administrador)
- Crear, editar y eliminar productos, con subida de imagen y vista previa
- Gestión de órdenes: enviar, entregar o cancelar
- Al cancelar una orden, el oro vuelve al cliente y el stock a la tienda

---

## 🛠️ Tecnologías

| Capa | Tecnologías |
|---|---|
| Frontend | React, Vite, React Router, Axios, CSS puro |
| Backend | Node.js, Express, Prisma ORM |
| Base de datos | SQLite |
| Autenticación | JSON Web Tokens (JWT), bcryptjs |
| Archivos | Multer |

---

## 📸 Capturas

| Detalle de producto | Carrito |
|---|---|
| ![Detalle](docs/capturas/detalle.png) | ![Carrito](docs/capturas/carrito.png) |

| Panel de productos | Gestión de órdenes |
|---|---|
| ![Admin productos](docs/capturas/admin-productos.png) | ![Admin órdenes](docs/capturas/admin-ordenes.png) |

---

## 🧠 Decisiones técnicas

- **Compras dentro de una transacción.** Descontar stock, descontar oro y crear la orden ocurren en una sola transacción de Prisma. Si cualquier validación falla, no se modifica nada.
- **Protección contra compras simultáneas.** El stock se descuenta con una condición `stock >= cantidad`. Si dos clientes compran el último ejemplar al mismo tiempo, solo uno lo consigue.
- **Precio histórico.** Cada ítem de una orden guarda el precio al momento de la compra, así el historial no cambia si después se modifica el precio del producto.
- **Máquina de estados para órdenes.** Solo se permiten transiciones válidas: `pendiente → enviada → entregada`, o `pendiente → cancelada`.
- **El servidor es la autoridad.** El frontend avisa si falta nivel u oro, pero la API vuelve a validar todo, incluido el precio real de cada objeto.
- **Roles seguros.** El registro ignora cualquier campo `rol` enviado por el cliente, y las rutas de administración están protegidas en el backend con un middleware, no solo ocultas en la interfaz.
- **Mensajes de login neutros.** El login responde lo mismo si el email no existe o si la contraseña es incorrecta, para no revelar qué cuentas existen.
- **Productos con historial no se eliminan.** Un objeto que ya aparece en órdenes no puede borrarse; se deja con stock 0.
- **Imágenes sin archivos huérfanos.** Si la validación falla después de subir una imagen, o si se reemplaza por otra, el archivo anterior se elimina del disco.

> **Trade-off conocido:** el token JWT se guarda en `localStorage` por simplicidad. En producción sería más seguro usar una cookie `httpOnly`, que no puede ser leída por JavaScript ante un ataque XSS.

---

## 📁 Estructura

```
TheWizard-Blackmarket/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Modelos de la base de datos
│   │   ├── migrations/
│   │   └── seed.js              # Datos iniciales del arsenal
│   └── src/
│       ├── index.js             # Servidor Express
│       ├── lib/                 # Cliente Prisma y errores de negocio
│       ├── middlewares/         # Autenticación, roles y subida de imágenes
│       ├── controllers/         # Lógica de cada endpoint
│       └── routes/              # Definición de rutas
└── frontend/
    └── src/
        ├── api/                 # Cliente Axios con token automático
        ├── context/             # Sesión y carrito (Context API)
        ├── components/          # Navbar, tarjetas, filtros, rutas protegidas
        ├── pages/               # Catálogo, detalle, carrito, perfil, login
        │   └── admin/           # Panel del Maestro Herrero
        └── utils/
```

---

## 🚀 Instalación y uso

### Requisitos
- [Node.js](https://nodejs.org/) versión LTS
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/Vicentecorts2/TheWizard-Blackmarket.git
cd TheWizard-Blackmarket
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita `.env` y reemplaza `JWT_SECRET` por una clave propia. Puedes generar una con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Crea la base de datos, carga los datos de ejemplo y levanta el servidor:

```bash
npx prisma migrate dev
npx prisma db seed
npm run dev
```

La API queda disponible en `http://localhost:3000`.

### 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173` en el navegador.

### Usuarios de prueba

| Rol | Email | Contraseña | Nivel | Oro |
|---|---|---|---|---|
| Administrador | admin@forja.com | admin123 | 99 | 999.999 |
| Cliente | aventurero@forja.com | aventura123 | 5 | 1.000 |

> Estas credenciales existen solo en la base de datos local creada por el seed.

**Prueba rápida:** inicia sesión como el aventurero e intenta comprar el *Filo del Alba* (requiere nivel 20). La tienda no te dejará.

---

## 📡 API REST

### Autenticación
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Registrar un aventurero |
| POST | `/api/auth/login` | Público | Iniciar sesión y obtener token |
| GET | `/api/auth/perfil` | Usuario | Datos del usuario actual |

### Productos y categorías
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/productos` | Público | Listar, con filtros `q`, `categoria`, `rareza`, `elemento`, `nivelMax` |
| GET | `/api/productos/:id` | Público | Detalle de un producto |
| POST | `/api/productos` | Admin | Crear producto (multipart con imagen) |
| PUT | `/api/productos/:id` | Admin | Editar producto |
| DELETE | `/api/productos/:id` | Admin | Eliminar producto sin órdenes |
| GET | `/api/categorias` | Público | Listar categorías |

### Órdenes
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/ordenes` | Usuario | Comprar uno o varios objetos |
| GET | `/api/ordenes/mias` | Usuario | Historial propio |
| GET | `/api/ordenes` | Admin | Todas las órdenes, filtrables por `estado` |
| PATCH | `/api/ordenes/:id/estado` | Admin | Cambiar el estado de una orden |

Las rutas protegidas requieren el header:

```
Authorization: Bearer <token>
```

**Ejemplo de compra:**

```bash
curl -X POST http://localhost:3000/api/ordenes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productoId":11,"cantidad":2}]}'
```

**Códigos de respuesta usados:** `400` datos inválidos u oro insuficiente · `401` sin sesión · `403` sin permiso o nivel insuficiente · `404` no encontrado · `409` conflicto de stock o de estado.

---

## 🔮 Mejoras futuras

- Tests automatizados de la API (Jest + Supertest)
- Paginación del catálogo
- Subir de nivel al completar compras
- Token en cookie `httpOnly`
- Docker Compose para levantar todo con un comando

---

## 👤 Autor Vicentecorts2

**Tu Nombre** · [GitHub](https://github.com/Vicentecorts2) · [LinkedIn](https://www.linkedin.com/in/vicente-cortés-ramirez)
