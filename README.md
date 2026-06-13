# ⚡ SyncFlow & StudyHub

> Espacio de trabajo integrado para la gestión de proyectos, enfoque y estudio inteligente en tiempo real.

SyncFlow es una aplicación web de productividad consolidada en una sola página (SPA) que fusiona la gestión ágil de proyectos con herramientas avanzadas de estudio potenciadas por Inteligencia Artificial. Diseñada bajo una interfaz oscura premium con gradientes dinámicos adaptables (Indigo, Cyberpunk, Forest, Eclipse).

---

## 🚀 Características Clave

### 📋 1. Tablero Colaborativo (Kanban)
* **Flujo de Trabajo Dinámico:** Cuatro columnas interactivas para el seguimiento visual (`Por Hacer`, `En Progreso`, `En Revisión`, `Completado`).
* **Tarjetas Enriquecidas:** Control de prioridades por color (Alta, Media, Baja), fechas de vencimiento, etiquetas personalizadas, checklists de subtareas y sistema de comentarios dinámicos.

### ⏱️ 2. Enfoque Diario y Temporizador
* **Planificador Diario:** Checklist de prioridades con barra de progreso visual en color verde esmeralda.
* **Rastreador de Hábitos:** Contador de rachas (streaks) consecutivas con efectos animados de latido (*heartbeat*).
* **Temporizador Pomodoro:** Ciclos integrados de enfoque (25 min), recreo corto (5 min) y descanso largo (15 min) con un anillo de progreso interactivo.
* **Sintetizador Ambiental:** Generación de audio en tiempo real mediante **Web Audio API** (Lluvia, Fuego y Ondas Alpha) para maximizar la concentración.

### 🤖 3. Centro de Estudio e Inteligencia Artificial
* **Lector de Documentos:** Visualizador integrado para archivos locales de texto y PDFs libre de distracciones.
* **Tutor Académico (EduBot):** Integración con la API de **Google Gemini** para realizar consultas, resúmenes automáticos en Markdown y generación de Quizzes interactivos de opción múltiple basados en tu material.
* **Lienzo de Álgebra:** Graficador interactivo renderizado sobre un elemento HTML5 Canvas con soporte para zoom, paneo y guardado de ecuaciones.

---

## 🛠️ Tech Stack & Arquitectura

| Capa | Tecnologías | Descripción |
| :--- | :--- | :--- |
| **Frontend Core** | React 19 + Vite + JavaScript (ES6+) | Compilación ultrarrápida, manejo eficiente del DOM y SPA fluida. |
| **Estilos** | CSS3 Pro (Variables Dinámicas) | Más de 2400 líneas de reglas optimizadas para soporte de temas premium. |
| **Backend & Auth** | Supabase (PostgreSQL) | Autenticación (Email, Google, GitHub) y base de datos relacional. |
| **Seguridad** | Row Level Security (RLS) | Políticas estrictas a nivel de fila vinculadas a `auth.uid()`. |
| **IA** | Google Gemini API (EduBot) | Procesamiento de lenguaje natural y análisis de documentos. |
| **Optimización** | LocalStorage (Client-Side) | Historial de chat efímero e independiente por documento para optimizar la DB. |

---

## 🔒 Arquitectura de Base de Datos y Seguridad (Supabase)

La aplicación utiliza un esquema relacional protegido de punta a punta. Cada usuario cuenta con un registro único extendido en la tabla `public.profiles` mediante un **Trigger automático** de PostgreSQL disparado tras el registro en `auth.users`.

### Diagrama del Esquema
* `profiles` (id [FK], theme, audio_mode, audio_volume)
* `tasks` (id, user_id [FK], title, column, priority, tags [JSONB], subtasks [JSONB], comments [JSONB])
* `daily_tasks` (id, user_id [FK], text, completed, category)
* `habits` (id, user_id [FK], text, completed, streak)
* `pomodoro_history` (id, user_id [FK], mode, duration, completed_at)
* `study_materials` (id, user_id [FK], file_url, file_name, study_notes, saved_equations [JSONB])

> ⚠️ **Nota de Seguridad:** Todas las tablas tienen habilitado **Row Level Security (RLS)**. Ningún usuario puede leer, insertar o mutar registros que no correspondan estrictamente a su `auth.uid()`.

---

## 💻 Instalación y Configuración Local

1. **Clonar el repositorio:**
```bash
   git clone [https://github.com/tu-usuario/syncflow-workspace.git](https://github.com/tu-usuario/syncflow-workspace.git)
   cd syncflow-workspace
