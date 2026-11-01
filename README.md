# 🎮 EduLaberinto - Escape Educativo 3D

![Estado del Proyecto](https://img.shields.io/badge/Estado-Terminado%20y%20Funcional-success)
![Tecnología](https://img.shields.io/badge/Three.js-3D-blue)
![Base de Datos](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## 📖 Descripción General del Proyecto
**EduLaberinto** (anteriormente conocido como Escape Educativo 3D) es un videojuego de aventura y escape en primera persona (FPS) desarrollado como proyecto escolar. El juego combina la exploración de un entorno 3D (una escuela abandonada) con la resolución de desafíos académicos. 

El objetivo principal es que el estudiante explore un laberinto, responda preguntas de diferentes materias para obtener llaves y escape del colegio. El sistema cuenta con un ecosistema completo de usuarios (Estudiantes, Profesores y Tutores) respaldado por una base de datos en la nube.

## 🛠️ Tecnologías y Arquitectura
El proyecto fue construido utilizando un stack tecnológico moderno, todo ejecutado desde el lado del cliente (Frontend) conectado a la nube (Backend as a Service):

*   **Motor Gráfico 3D:** `Three.js` (Renderizado WebGL, manejo de luces dinámicas, texturas y colisiones).
*   **Lenguaje:** `JavaScript (ES6+)`, `HTML5`, `CSS3`.
*   **Base de Datos y Autenticación:** `Supabase` (PostgreSQL). Se utiliza para guardar usuarios, preguntas, progreso de llaves, puntajes y contenido de la biblioteca.
*   **Arquitectura:** Lógica modular. El código está dividido en múltiples archivos para mejor organización (NPCs, Antorchas, Preguntas, Aulas, Laberinto, Paneles de Usuario).

## ✨ Características Principales

### 🌍 Mundo 3D y Jugabilidad
*   **Laberinto Interactivo:** Generado proceduralmente con muros de ladrillo y texturas realistas.
*   **Biblioteca Central:** Lugar de inicio que contiene la primera llave y la guía de instrucciones.
*   **12 Aulas Temáticas:** Cada aula corresponde a una materia (Matemáticas, Física, Biología, etc.) con decoración única.
*   **Sistema de Iluminación:** Uso de antorchas animadas, luces ambientales y "almas" flotantes para mantener una atmósfera de misterio.
*   **NPCs y Almas Perdidas:** Personajes espectrales que siguen al jugador y le dan pistas en el camino.

### 📚 Sistema Académico (Bases de Datos)
*   **Preguntas Dinámicas:** Cada materia tiene un banco de preguntas con 4 opciones y una penalización de puntos por fallos.
*   **Progreso Guardado:** El juego guarda cuántas llaves tienes, cuántas aulas has superado y tu puntaje final en tiempo real.

### 👥 Paneles de Administración y Roles
El juego cuenta con un sistema de autenticación que redirige a los usuarios según su rol:
1.  **Estudiante:** Puede jugar, elegir su materia, ver su progreso detallado y recolectar llaves.
2.  **Profesor:** Panel de control donde puede:
    *   Crear, editar y eliminar preguntas de su materia.
    *   Asignar estudiantes a su clase.
    *   Ver el progreso de cada alumno.
    *   **Modo Examen:** Bloquea el juego para que todas las aulas sean de su materia.
    *   **Modo Prueba:** El profesor puede entrar al juego con todas las llaves desbloqueadas.
3.  **Tutor:** Vista global que permite supervisar el progreso de todos los estudiantes en todas las materias.

## 🎮 Controles del Juego
*   **W, A, S, D:** Moverse por el laberinto.
*   **Mouse:** Mirar alrededor en primera persona (Pointer Lock).
*   **E:** Interactuar (Recoger llaves, abrir puertas, leer estantes, responder).
*   **Flechas Izquierda / Derecha:** Rotar la cámara o al personaje.

## 📦 Instalación y Uso Local
Este proyecto no requiere de una instalación compleja en el sistema operativo, pero sí de un servidor local para poder conectarse a Supabase sin problemas de CORS.

1.  Descarga o clona este repositorio en tu computadora.
2.  Abre la carpeta del proyecto en **Visual Studio Code**.
3.  Abre el archivo `index.html` y asegúrate de que las credenciales de Supabase (en `js/auth.js`) estén configuradas.
4.  Instala la extensión **Live Server** en VS Code.
5.  Haz clic derecho sobre el archivo `index.html` y selecciona **"Open with Live Server"**.
6.  El juego se abrirá en tu navegador (usualmente en `http://127.0.0.1:5500`).

## 🔮 Futuras Mejoras (Roadmap)
*   Agregar más modelos 3D para los NPCs.
*   Implementar un sistema de sonido ambiental y música dinámica.
*   Crear una versión PWA (Progressive Web App) para jugar sin conexión desde el celular.

## 👨‍💻 Autoría
*   **Desarrollador Principal:** [Escribe tu nombre aquí]
*   **Institución:** [Nombre de tu colegio o universidad]
*   **Materia / Proyecto:** Desarrollo de Software / Proyecto Final.

---
*Este proyecto fue desarrollado con el objetivo de demostrar cómo la gamificación y la tecnología 3D pueden aplicarse a la educación.*

## 🗄️ Estructura de la Base de Datos (Supabase)
El sistema se conecta a una base de datos PostgreSQL en Supabase. Las tablas principales son:
*   **`usuarios`:** Almacena a los estudiantes, profesores y tutores (con roles y contraseñas encriptadas).
*   **`preguntas`:** Banco de preguntas creado por los profesores (materia, pregunta, opciones A-B-C-D, respuesta correcta).
*   **`progreso`:** Guarda el avance de cada estudiante (llaves obtenidas, puntaje total, aulas completadas).
*   **`respuestas_estudiante`:** Historial de todas las respuestas dadas (para que el profesor sepa en qué falló el alumno).
*   **`estudiantes_profesor`:** Relaciona a un estudiante con el profesor de su materia.
*   **`contenidos_biblioteca`:** Almacena los textos e imágenes que los profesores suben a la biblioteca del juego.
*   **`configuracion_profesor`:** Guarda si un profesor activó el "Modo Examen".

## 🧩 Retos Técnicos Superados
Durante el desarrollo del proyecto, se enfrentaron y resolvieron los siguientes desafíos:
*   **Optimización de Renderizado 3D:** Se implementó una carga dinámica y se ajustaron las luces (almas y antorchas) para evitar que el navegador se congelara por exceso de cálculo en la tarjeta gráfica.
*   **Sincronización en Tiempo Real:** Se conectó el motor de Three.js con Supabase, logrando que las respuestas y los puntajes se guarden instantáneamente sin recargar la página.
*   **Diseño de Interfaces (UI):** Se crearon paneles con efectos de cristal (Glassmorphism) personalizados para cada rol, manteniendo una estética de "escuela abandonada".
*   **Manejo de Estados Complejos:** Control de pausas, PointerLock (bloqueo del mouse), y transiciones entre el juego 3D y los menús HTML.