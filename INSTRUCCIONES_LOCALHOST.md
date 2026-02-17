# 🖥️ Ejecutar BrandGen AI en Localhost

## Para Personas sin Experiencia en Programación

Esta guía paso a paso te ayudará a ejecutar la aplicación en tu computadora local.

---

## 📋 Requisitos Previos

### 1. Instalar Node.js

**¿Qué es Node.js?**
Es un programa que permite ejecutar aplicaciones JavaScript en tu computadora.

**Descargar:**
1. Ve a: https://nodejs.org/
2. Descarga la versión **LTS** (Long Term Support - Recomendada)
3. Instala siguiendo el asistente (Next, Next, Finish)
4. Reinicia tu computadora

**Verificar instalación:**
1. Abre la **Terminal** (Mac/Linux) o **CMD/PowerShell** (Windows)
   - **Windows**: Busca "cmd" en el menú inicio
   - **Mac**: Busca "Terminal" en Spotlight (Cmd+Space)
2. Escribe este comando y presiona Enter:
   ```bash
   node --version
   ```
3. Deberías ver algo como: `v20.11.0`

---

## 📦 Paso 1: Descargar el Proyecto

### Opción A: Desde un ZIP
1. Descarga el archivo ZIP del proyecto
2. Extrae el contenido en una carpeta (ej: `Documentos/BrandGenAI`)

### Opción B: Desde GitHub (si usas Git)
1. Abre la terminal
2. Navega a donde quieres guardar el proyecto:
   ```bash
   cd Documentos
   ```
3. Clona el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   ```

---

## 📂 Paso 2: Abrir el Proyecto

### En Windows:
1. Abre el **Explorador de Archivos**
2. Navega a la carpeta del proyecto
3. En la barra de direcciones, escribe `cmd` y presiona Enter
4. Se abrirá una terminal en esa ubicación

### En Mac:
1. Abre **Terminal**
2. Navega a la carpeta del proyecto:
   ```bash
   cd ruta/a/BrandGenAI
   ```

**💡 Tip:** Puedes arrastrar la carpeta a la terminal para auto-completar la ruta.

---

## 🔧 Paso 3: Instalar Dependencias

En la terminal que abriste en la carpeta del proyecto, ejecuta:

```bash
npm install
```

**¿Qué hace esto?**
Descarga todas las librerías necesarias para que la aplicación funcione (React, Google AI, etc.)

**Tiempo estimado:** 1-3 minutos (dependiendo de tu internet)

**Verás algo como:**
```
added 95 packages in 45s
```

---

### 🚀 Paso 4: Iniciar la Aplicación

Debido a que el proyecto utiliza un **Backend** para la generación de imágenes con Imagen 4.0, necesitamos abrir **dos terminales**.

#### Terminal 1: Frontend (La interfaz visual)
1. En la carpeta raíz del proyecto, ejecuta:
   ```bash
   npm run dev
   ```
2. Esto iniciará la aplicación en `http://localhost:5173`.

#### Terminal 2: Backend (El motor de IA)
1. Abre una **nueva ventana de terminal** en la misma carpeta del proyecto.
2. Entra a la carpeta backend:
   ```bash
   cd backend
   ```
3. Instala las dependencias del backend (solo la primera vez):
   ```bash
   npm install
   ```
4. Inicia el servidor de IA:
   ```bash
   node server.js
   ```
5. Verás el mensaje: `🚀 Servidor de Branding corriendo en http://localhost:5000`.

---

## ☁️ Paso 5: Ejecutar directamente desde GitHub (Codespaces)

Si no quieres instalar nada en tu computadora, puedes usar **GitHub Codespaces**:

1. Ve a tu repositorio en GitHub.
2. Haz clic en el botón verde **"<> Code"**.
3. Selecciona la pestaña **"Codespaces"** y haz clic en **"Create codespace on main"**.
4. Se abrirá un editor en tu navegador.
5. Abre dos terminales abajo y sigue los mismos pasos del **Paso 4** (Terminal 1 y Terminal 2).
6. GitHub te dará enlaces públicos temporales para ver la app.

---

## 🌐 Paso 6: Abrir en el Navegador

1. Abre tu navegador (Chrome, Firefox, Edge, Safari)
2. Ve a la dirección: **http://localhost:5173/**
3. ¡Deberías ver la aplicación funcionando! 🎉

---

## 🔑 Paso 6: Configurar la API de Google

### Obtener la API Key

1. Ve a: https://aistudio.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Get API Key"** o **"Create API Key in new project"**
4. Copia la clave generada (empieza con `AIza...`)

### Tu API Key actual:
```
AIzaSyCUs0r_RGNUNqhOJLxK8K4dQTT6bh25Zr8
```

### Configurar en la App

1. En la aplicación (http://localhost:5173/), haz clic en el icono de **Ajustes** ⚙️ (arriba a la derecha)
2. Ve a la pestaña **"API"**
3. En el campo **"Google AI Studio (Gemini)"**, pega tu API Key
4. Haz clic en **"Guardar"**
5. Verás un badge verde que dice **"✓ Activo"**

---

## ✅ Paso 7: Probar la Aplicación

### Crear tu Primer Proyecto

1. Haz clic en **"+ Nuevo Proyecto"**
2. Completa el formulario:
   - **Nombre de la Marca:** Ej. "TechFlow"
   - **Industria:** Ej. "Tecnología"
   - **Descripción:** Ej. "Plataforma de gestión de proyectos para equipos remotos"
   - **Público Objetivo:** Ej. "Empresas tecnológicas de 10-50 empleados"
3. Haz clic en **"Crear Proyecto"**

### Generar el Branding

1. Haz clic en **"✨ Generar Branding"**
2. Espera 10-30 segundos (la IA está creando tus propuestas)
3. ¡Verás 5 propuestas de branding completas!

Cada propuesta incluye:
- Logo profesional en SVG
- 6 colores con códigos hex
- 2 tipografías (Google Fonts)
- 6 iconos coherentes con el diseño

---

## 🛑 Cómo Detener la Aplicación

Cuando quieras cerrar el servidor local:

1. Ve a la terminal donde ejecutaste `npm run dev`
2. Presiona **Ctrl + C** (Windows/Mac/Linux)
3. Confirma con **"Y"** si te pregunta

---

## 🔄 Cómo Volver a Iniciar

La próxima vez que quieras usar la aplicación:

1. Abre la terminal en la carpeta del proyecto
2. Ejecuta: `npm run dev`
3. Abre http://localhost:5173/ en tu navegador

**No necesitas volver a ejecutar `npm install`**, solo si actualizas el código.

---

## ❌ Solución de Problemas Comunes

### Error: "command not found: npm"
**Solución:** Node.js no está instalado correctamente. Reinstala desde nodejs.org

### Error: "Port 5173 is already in use"
**Solución:** Ya tienes la app abierta en otra terminal. Ciérrala primero (Ctrl+C).

### La página está en blanco
**Solución:** 
1. Presiona **Ctrl + Shift + R** para recargar sin caché
2. Verifica la consola del navegador (F12) para ver errores

### "API Key inválida" o "No se genera branding"
**Solución:**
1. Verifica que la API Key esté bien copiada
2. Ve a https://aistudio.google.com/ y verifica que la key esté activa
3. Asegúrate de tener conexión a internet

### Los proyectos desaparecen al cerrar la app
**Solución:** Esto es normal, se guardan en el almacenamiento local de tu navegador (localStorage).

### Error 500 al generar imágenes
**Solución:** Asegúrate de que la **Terminal 2 (Backend)** esté corriendo. Si el backend no está encendido, la app no podrá generar imágenes reales y verás un error.

---

## 📱 Acceder desde Otros Dispositivos (Misma Red WiFi)

Si quieres abrir la app en tu celular o tablet:

1. Ejecuta la app con:
   ```bash
   npm run dev -- --host
   ```
2. Verás algo como:
   ```
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.1.100:5173/
   ```
3. En tu celular/tablet, abre el navegador y ve a la dirección **Network** (ej. `http://192.168.1.100:5173/`)

---

## 💾 Guardar Cambios (Si Modificas Código)

Si haces cambios en el código:

1. Los cambios se reflejan automáticamente (Hot Reload)
2. Solo guarda el archivo (Ctrl+S)
3. El navegador se actualiza solo

---

## 📦 Compilar para Producción

Si quieres crear una versión final para subir a internet:

```bash
npm run build
```

Esto crea una carpeta `dist/` con todo el código optimizado y listo para deploy.

---

## 🎓 Comandos Útiles

| Comando | Qué Hace |
|---------|----------|
| `npm install` | Instala las dependencias |
| `npm run dev` | Inicia el servidor local |
| `npm run build` | Compila para producción |
| `npm run preview` | Vista previa de la build |

---

## 🆘 ¿Necesitas Ayuda?

1. **Revisa la consola** del navegador (F12)
2. **Busca el error** en Google con el mensaje exacto
3. **Verifica** que todos los pasos estén completos

---

## ✨ ¡Listo!

Ahora tienes BrandGen AI corriendo en tu computadora local. Puedes crear proyectos, generar branding con IA, y exportar tus guías de marca.

**Próximos pasos:**
- Experimenta creando diferentes marcas
- Prueba distintas industrias y estilos
- Exporta tus guías en PDF, Figma o CSS

---

**¡Disfruta creando branding profesional con IA! 🎨🚀**
