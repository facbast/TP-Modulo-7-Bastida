# Picada al Mas Alla

Juego vertical estilo Doodle Jump / endless jumper hecho con Phaser.

La pelota rebota sola. El jugador la mueve de izquierda a derecha para subir por las plataformas, esquivar los pinchos flotantes y sumar altura en metros. La cámara solo sube, nunca baja. Si la pelota toca un pincho o cae por debajo de la pantalla, explota y termina la partida.

Características:
- Plataformas procedurales con dificultad progresiva (más gap, más angostas y móviles con la altura).
- Pinchos flotantes esquivables a los costados.
- Récord guardado en `localStorage` (`bounceBallBest`).
- HUD con `Altura: X m` y `Récord: X m`.
- Texturas y sonidos generados por código (sin assets externos).
- Escenas: `Boot`, `Preloader`, `MainMenu`, `Game`, `GameOver`.

## Tecnologías utilizadas

- [Phaser 4.0.0](https://github.com/phaserjs/phaser) — motor de juego (Arcade Physics).
- [Vite 6.3.1](https://github.com/vitejs/vite) — bundler y dev server.
- JavaScript ES Modules (`src/main.js`, `src/game/main.js`, `src/game/scenes/`).
- Node.js + npm — dependencias y scripts.
- HTML / CSS (`index.html`, `public/style.css`).
- WebAudio procedural para efectos (sin archivos de audio).
- `localStorage` para persistir el récord.

## Instrucciones para ejecutar el proyecto

Requisitos: [Node.js](https://nodejs.org) instalado.

```bash
# 1. Instalar dependencias
npm install

# 2. Desarrollo (con hot-reload)
npm run dev
# o sin telemetría anónima:
npm run dev-nolog

# 3. Abrir en el navegador
# http://localhost:8080 por defecto
```

Build de producción:

```bash
npm run build
# o:
npm run build-nolog

# El resultado queda en la carpeta `dist/`
# Subir todo el contenido de `dist/` a un servidor web estático para desplegar.
```

Estructura relevante:

| Path | Descripción |
|------|-------------|
| `index.html` | Página base, título `Picada al Mas Alla`. |
| `src/main.js` | Bootstrap, llama a `StartGame('game-container')`. |
| `src/game/main.js` | Config de Phaser (480x800, Arcade, Scale.FIT). |
| `src/game/scenes/MainMenu.js` | Menú principal con título e instrucciones. |
| `src/game/scenes/Game.js` | Gameplay principal. |
| `src/game/scenes/GameOver.js` | Pantalla de fin (`¡EXPLOTÓ!`). |

## Controles del juego

Solo teclado + clic:

**Menú principal (`MainMenu`):**
- `ESPACIO` / `ENTER` / clic — empezar partida.

**Partida (`Game`):**
- `←` `→` o `A` / `D` — mover la pelota (con wrap lateral: salir por un lado = entrar por el otro).
- `R` — reiniciar escena.
- La pelota rebota sola al caer sobre una plataforma.

**Fin de juego (`GameOver`):**
- `ESPACIO` / `ENTER` / `R` / clic — reintentar.
- `M` — volver al menú.

## Agentes de OpenCode utilizados

- Agente principal de OpenCode en operación actual: **Muse Spark (`muse-spark-1.3-contributor-free`)** — asistente de codificación OpenCode potenciado por Muse Spark de Meta MSL.
  - Quitar telemetría de coordenadas (`debugText` en `Game.js`).
  - Renombrar título de `BOUNCE BALL` a `PICADA AL MAS ALLA` (`MainMenu.js`, `index.html`).
  - Quitar texto `ENDLESS` del menú.
  - Generación de este `README.md`.
