# Talento ESIT

Versión estática en HTML, CSS y JavaScript. Sin PHP, base de datos ni dependencias de compilación.

Abre `index.html` directamente o visita `http://localhost/TalentoESIT/` con Apache de XAMPP.

Accesos de demostración: DUI `05308231-0` o `06480338-9`, contraseña `admin123`
Ambos accesos usan el mismo perfil de demostración local

Flujo: inicio → iniciar sesión → perfil1. Incluye directorio de nueve profesionales ficticios con avatares genéricos locales, búsqueda, filtros, perfiles públicos, edición del perfil en la misma página con Guardar y Descartar y CV mediante la opción de imprimir/guardar como PDF del navegador.

La sesión de demostración dura en la pestaña (sessionStorage). La edición del perfil se conserva en ese navegador (localStorage). El acceso es una simulación de frontend; sus credenciales se encuentran en el código JavaScript.

La landing y el login se implementaron a partir del contexto de Figma. Perfil1 utiliza la estructura y los textos del archivo; su fidelidad visual completa no pudo verificarse debido al límite de consultas del plan de Figma. Museo Sans no estaba incluido en los recursos, por lo que se usa Segoe UI como alternativa local.

Las redes del pie abren las páginas generales de cada servicio; no se inventaron cuentas institucionales o personales.

El switch Privado / Visible controla la aparición del perfil en el directorio y el acceso público a su ruta en este navegador, independientemente de Guardar

Al ser una aplicación estática sin servidor ni base de datos, los cambios y la visibilidad no se sincronizan entre distintos dispositivos o navegadores

Regla editorial: los textos de la interfaz se muestran sin punto final

La página `#curriculum` está disponible junto a Talento y requiere iniciar sesión
Incluye tres plantillas, enfoques para ordenar la información real del perfil, vista previa editable e impresión para guardar como PDF
El generador es local y no llama a un modelo de IA externo
Las indicaciones libres se muestran como guía de edición y no se interpretan mediante IA
Cerrar sesión está en el menú desplegable del nombre del propietario y la cabecera muestra su avatar

El acceso Generar currículum solo aparece con sesión iniciada
La vista previa distribuye el contenido en hojas A4 de 210 × 297 mm, con márgenes de 16 mm y saltos de página para impresión

En el primer acceso se exige completar el perfil antes de habilitar Inicio, Talento y Generar currículum
Solo se precargan nombre, ubicación, avatar y formación académica de demostración
La formación académica es de solo lectura y no puede agregarse, eliminarse ni modificarse desde el editor
El nombre se edita directamente bajo la foto, sin sección Datos generales
Guardar permite cualquier número de habilidades, incluidas cero
Publicar requiere fotografía, descripción y al menos 3 habilidades distintas, de lo contrario el perfil se mantiene privado
Cursos, proyectos, experiencia y referencias son opcionales y admiten agregar o eliminar tarjetas
El switch Privado / Público está disponible desde el primer acceso
El primer guardado abre la vista del perfil y habilita la navegación
Si se solicita publicar desde el editor, la visibilidad se aplica al guardar
Al guardar con menos de 3 habilidades el perfil pasa a privado automáticamente
El estado de perfil completo y sus datos se guardan en localStorage, sin base de datos

La primera entrada al editor solicita una fotografía obligatoria en un modal antes de continuar
Foto: JPG, PNG o WebP, mínimo 400 × 400 px y máximo 10 MB
La fotografía y el banner se editan en modales con vista previa, Guardar y Cancelar
El banner admite subir imagen, elegir un color hexadecimal o restaurar el diseño ESIT
Publicar, ocultar y guardar el perfil requieren confirmación en un modal
Las redes sociales se agregan, editan, eliminan y reordenan en un modal independiente
Los cambios de foto, banner y redes se incorporan al borrador, se conservan al confirmar Guardar en el perfil y se descartan al cancelar

Modo temporal de pruebas: USE_DEMO_PROFILE_PHOTO permite usar el avatar original sin pedir una foto al entrar
Las fotos personalizadas existentes se conservan y los modales de edición siguen disponibles
