---
description: Guía paso a paso para desplegar la aplicación en Vercel y configurar Supabase para producción.
---

# Despliegue en Producción (Vercel)

Sigue estos pasos para que tu aplicación sea accesible desde internet.

## 1. Subir código a GitHub
Necesitas tener el código en un repositorio de GitHub.
1. Crea un **nuevo repositorio** en [GitHub](https://github.com/new) (puede ser privado).
2. En tu terminal, vincula tu proyecto local con el nuevo repo:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git add .
   git commit -m "Versión lista para producción"
   git branch -M main
   git push -u origin main
   ```

## 2. Desplegar en Vercel
1. Ve a [Vercel.com](https://vercel.com) e inicia sesión con GitHub.
2. Haz clic en **"Add New..."** -> **"Project"**.
3. Importa el repositorio que acabas de crear.
4. **IMPORTANTE: Variables de Entorno**.
   En la sección "Environment Variables", agrega las mismas que tienes en tu archivo `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: (Tus valor de supabase)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Tu clave anon)
5. Haz clic en **"Deploy"**.
6. Espera a que termine. Vercel te dará una URL (ej. `https://gastos-hormiga.vercel.app`).

## 3. Configurar Supabase para Producción
Supabase necesita saber que ahora tu app vive en esa nueva URL.
1. Ve a tu proyecto en [Supabase](https://supabase.com).
2. Ve a **Authentication** -> **URL Configuration**.
3. **Site URL**: Cambia `http://localhost:3000` por tu nueva URL de Vercel (ej. `https://gastos-hormiga.vercel.app`).
4. **Redirect URLs**:
   - Asegúrate de agregar `https://gastos-hormiga.vercel.app/auth/callback`.
   - Si tienes otras rutas, agrégalas también.
5. Guarda los cambios.

## 4. ¡Listo!
Tu aplicación está online.
