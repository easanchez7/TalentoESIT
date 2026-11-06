# Talento ESIT

Versión estática en HTML, CSS y JavaScript. Sin PHP, base de datos ni dependencias de compilación.

Abre `index.html` directamente o visita `http://localhost/TalentoESIT/` con Apache de XAMPP.

Cuenta de demostración: DUI `05308231-0`, contraseña `admin123`.

Flujo: inicio → iniciar sesión → perfil1. Incluye directorio de nueve profesionales ficticios con avatares genéricos locales, búsqueda, filtros, perfiles públicos, edición del perfil en la misma página con Guardar y Descartar y CV mediante la opción de imprimir/guardar como PDF del navegador.

La sesión de demostración dura en la pestaña (sessionStorage). La edición del perfil se conserva en ese navegador (localStorage). El acceso es una simulación de frontend; sus credenciales se encuentran en el código JavaScript.

La landing y el login se implementaron a partir del contexto de Figma. Perfil1 utiliza la estructura y los textos del archivo; su fidelidad visual completa no pudo verificarse debido al límite de consultas del plan de Figma. Museo Sans no estaba incluido en los recursos, por lo que se usa Segoe UI como alternativa local.

Las redes del pie abren las páginas generales de cada servicio; no se inventaron cuentas institucionales o personales.

El switch Privado / Visible controla la aparición del perfil en el directorio y el acceso público a su ruta en este navegador, independientemente de Guardar

Al ser una aplicación estática sin servidor ni base de datos, los cambios y la visibilidad no se sincronizan entre distintos dispositivos o navegadores

Regla editorial: los textos de la interfaz se muestran sin punto final

La página `#curriculum` está disponible junto a Talento y requiere iniciar sesión
Incluye tres plantillas, enfoques para ordenar la información real del perfil, vista previa editable, copia de texto e impresión para guardar como PDF
El generador es local y no llama a un modelo de IA externo
Las indicaciones libres se muestran como guía de edición y no se interpretan mediante IA
Cerrar sesión está dentro del perfil del propietario y la cabecera muestra su avatar junto al nombre
