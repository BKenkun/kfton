# kfton Experience ☕️

Este es el repositorio oficial de **kfton**, una plataforma de e-commerce y gestión integral para cafeterías de especialidad.

## 🚀 Guía de Lanzamiento (Producción)

Para poner la web en funcionamiento después de clonar o desplegar:

1. **Despliegue**: Conecta este repositorio a tu servicio de hosting preferido (recomendado Firebase App Hosting).
2. **Acceso Admin**: Ve a `https://tu-dominio.com/admin/login`.
   - *User*: `santicoffewinks`
   - *Pass*: `DXE$%&78iKNMl`
3. **Configuración de Stripe**:
   - Entra en la pestaña **Ajustes**.
   - Introduce tu `Secret Key` y `Publishable Key` de Stripe.
   - Esto habilitará la tienda y la sincronización de productos automáticamente.
4. **Gestión de Medios**: Sube tus imágenes y vídeos directamente desde el panel. Se almacenarán en el servidor para máxima velocidad.

## 🛠️ Tecnologías

- **Framework**: Next.js 15.5.7 (App Router)
- **UI**: React 18.3.1, Tailwind CSS, ShadCN UI
- **IA**: Genkit para funcionalidades inteligentes.
- **Pagos**: Stripe API (Gestión dinámica desde el panel).
- **Hosting**: Optimizado para Firebase App Hosting.

## ⚠️ Seguridad

Este proyecto utiliza un sistema de persistencia local para las claves de Stripe en `src/lib/settings-data.json`.
- **IMPORTANTE**: Este archivo está en el `.gitignore`. Nunca se subirá a GitHub.
- Deberás configurar las claves manualmente en cada nuevo entorno de despliegue a través del panel de administración.

---
© 2024 kfton - Todo empieza con kfton.