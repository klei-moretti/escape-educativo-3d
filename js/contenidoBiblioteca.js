"use strict";

/*=========================================================
CONTENIDO DE LA BIBLIOTECA
=========================================================*/

const ContenidoBiblioteca = {

    // =============================================
    // HISTORIA DEL COLEGIO
    // =============================================
    historia: {
        titulo: "📖 HISTORIA DEL COLEGIO",
        texto: `
            Este colegio fue fundado en 1875 por un grupo de educadores.
            Durante más de 100 años, formó a generaciones de estudiantes.
            
            En 1985, un incendio destruyó parte del edificio.
            Los estudiantes y profesores huyeron, dejando atrás aulas, libros y recuerdos.
            
            Hoy, décadas después, la escuela sigue en pie pero abandonada.
            Los rumores dicen que aún quedan llaves escondidas en cada aula.
            
            ¿Serás capaz de encontrar las 12 llaves y escapar?
        `
    },

    // =============================================
    // INSTRUCCIONES DEL JUEGO
    // =============================================
    instrucciones: {
        titulo: "🎮 CÓMO JUGAR",
        texto: `
            1. Recoge la LLAVE INICIAL en la biblioteca.
            2. Ve a un aula y presiona E para responder la pregunta.
            3. Si respondes bien, recibes una LLAVE.
            4. Usa esa llave para abrir la siguiente aula.
            5. Cuando tengas las 12 llaves, ve a la puerta final y escapa.
            
            Controles:
            - W, A, S, D: Moverse
            - Mouse: Mirar alrededor
            - E: Interactuar (recoger llaves, abrir puertas, responder)
            - Flechas: Girar
        `
    },

    // =============================================
    // CONTENIDO POR MATERIAS
    // =============================================
    materias: {

        "Matemáticas": {
            titulo: "📐 MATEMÁTICAS",
            texto: `
                Las matemáticas estudian los números, las formas y los patrones.
                
                Temas importantes:
                - Operaciones básicas (suma, resta, multiplicación, división)
                - Fracciones y decimales
                - Álgebra: ecuaciones y variables
                - Geometría: figuras y ángulos
                - Raíces cuadradas
                
                Preguntas del juego:
                - Multiplicaciones como 8 × 9
                - Raíces cuadradas como √100
            `
        },

        "Lenguaje": {
            titulo: "📝 LENGUAJE",
            texto: `
                El lenguaje es la herramienta que usamos para comunicarnos.
                
                Temas importantes:
                - Sustantivos, adjetivos y verbos
                - Sinónimos y antónimos
                - Oraciones y párrafos
                - Comprensión lectora
                
                Preguntas del juego:
                - Identificar verbos
                - Encontrar sinónimos
            `
        },

        "Inglés": {
            titulo: "🇬🇧 INGLÉS",
            texto: `
                El inglés es el idioma más hablado del mundo.
                
                Temas importantes:
                - Saludos y presentaciones
                - Verbos en presente y pasado
                - Vocabulario básico
                - Frases comunes
                
                Preguntas del juego:
                - Traducir palabras
                - Verbos en pasado (go → went)
            `
        },

        "Biología": {
            titulo: "🧬 BIOLOGÍA",
            texto: `
                La biología estudia los seres vivos.
                
                Temas importantes:
                - Células y tejidos
                - Sistemas del cuerpo humano
                - Fotosíntesis en plantas
                - Genética y cromosomas
                
                Preguntas del juego:
                - Órganos del cuerpo
                - Procesos de las plantas
            `
        },

        "Química": {
            titulo: "⚗️ QUÍMICA",
            texto: `
                La química estudia la materia y sus transformaciones.
                
                Temas importantes:
                - Elementos químicos
                - Símbolos (H2O, CO2, etc.)
                - Metales y no metales
                - Reacciones químicas
                
                Preguntas del juego:
                - Símbolos químicos
                - Identificar metales
            `
        },

        "Física": {
            titulo: "⚛️ FÍSICA",
            texto: `
                La física estudia las leyes de la naturaleza.
                
                Temas importantes:
                - Leyes de Newton
                - Fuerza y movimiento
                - Energía
                - Ángulos y geometría
                
                Preguntas del juego:
                - Unidades de medida
                - Tipos de ángulos
            `
        },

        "Literatura": {
            titulo: "📚 LITERATURA",
            texto: `
                La literatura es el arte de escribir obras.
                
                Temas importantes:
                - Géneros literarios
                - Autores famosos
                - Figuras literarias (metáfora, etc.)
                - Obras clásicas
                
                Preguntas del juego:
                - Autores y obras
                - Figuras literarias
            `
        },

        "Música": {
            titulo: "🎵 MÚSICA",
            texto: `
                La música es el arte de combinar sonidos.
                
                Temas importantes:
                - Instrumentos musicales
                - Notas musicales
                - Ritmo y melodía
                - Compositores famosos
                
                Preguntas del juego:
                - Instrumentos
                - Notas musicales
            `
        },

        "Geografía": {
            titulo: "🌎 GEOGRAFÍA",
            texto: `
                La geografía estudia la Tierra y sus habitantes.
                
                Temas importantes:
                - Continentes y océanos
                - Países y capitales
                - Relieve y clima
                - Mapas
                
                Preguntas del juego:
                - Océanos
                - Capitales
            `
        },

        "Arte": {
            titulo: "🎨 ARTE",
            texto: `
                El arte es la expresión de la creatividad humana.
                
                Temas importantes:
                - Colores primarios y secundarios
                - Técnicas de pintura
                - Artistas famosos
                - Obras maestras
                
                Preguntas del juego:
                - Colores primarios
                - Pintores famosos
            `
        },

        "Historia": {
            titulo: "🏛️ HISTORIA",
            texto: `
                La historia estudia los eventos del pasado.
                
                Temas importantes:
                - Independencias
                - Libertadores
                - Civilizaciones antiguas
                - Fechas importantes
                
                Preguntas del juego:
                - Independencia de Bolivia
                - Libertadores
            `
        },

        "Religión": {
            titulo: "✝️ RELIGIÓN",
            texto: `
                La religión estudia las creencias y valores.
                
                Temas importantes:
                - Libros sagrados
                - Mandamientos
                - Religiones del mundo
                - Valores
                
                Preguntas del juego:
                - Libros sagrados
                - Mandamientos
            `
        }
    }
};