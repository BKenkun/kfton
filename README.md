# kfton Experience ☕️

Este es el repositorio oficial de **kfton**, una plataforma de e-commerce y gestión integral para cafeterías de especialidad.

## 🚀 Características Principales

- **Tienda Online**: Venta de café y merchandising con integración de Stripe.
- **Panel de Administración**: Gestión de productos, pedidos, carta, horarios y reseñas.
- **Gestión de Medios**: Subida de vídeos e imágenes para la sección Héroe y productos (almacenamiento local).
- **Dashboard de Analíticas**: Visualización de ventas y alertas de stock bajo.
- **Optimización**: SEO dinámico, Sitemap y Robots.txt.

## 🛠️ Tecnologías

- **Framework**: Next.js 15 (App Router)
- **UI**: React 18, Tailwind CSS, ShadCN UI
- **IA**: Genkit para funcionalidades inteligentes.
- **Pagos**: Stripe API.
- **Hosting**: Firebase App Hosting.

## 📦 Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/BKenkun/kfton.git
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Ejecuta en desarrollo:
   ```bash
   npm run dev
   ```

## ⚠️ Seguridad

Este proyecto permite gestionar la configuración de Stripe desde el panel de administración en `/admin/dashboard/settings`. 

**IMPORTANTE**: Los valores se guardan en `src/lib/settings-data.json`. Este archivo **está incluido en el `.gitignore`** para evitar que tus claves secretas se suban a GitHub. Al desplegar en un nuevo entorno, deberás introducir las claves manualmente a través del panel de administración.

---
© 2024 kfton - Todo empieza con kfton.