# AGENTS.md — Picada al Mas Alla

Instrucciones para agentes de codificación (OpenCode / Muse Spark) trabajando en este repo.
Seguirlas para mantener consistencia y no romper el juego.

## 1. Contexto del proyecto

- Juego: **Picada al Mas Alla** (antes "Bounce Ball"). Jumper vertical endless estilo Doodle Jump.
- La pelota rebota sola; el jugador la mueve lateralmente para subir plataformas y esquivar pinchos.
- Cámara solo sube, nunca baja. Muerte por pincho o por caída. Récord en `localStorage`.
- Stack: **Phaser 4.0.0 + Vite 6.3.1 + JavaScript ES Modules + Node/npm**.
- Resolución fija: **480x800**, `Scale.FIT + CENTER_BOTH`, `parent: game-container`.
- Sin assets externos para gameplay: texturas procedurales (`ball`, `platform`, `spike`, `dot`, `bit`) vía `make.graphics + generateTexture`. Sonido procedural con WebAudio.
- Escenas en orden (`src/game/main.js`): `Boot → Preloader → MainMenu → Game → GameOver`.
- Título visible: `PICADA / AL MAS ALLA` en `MainMenu.js`. Título HTML: `Picada al Mas Alla` en `index.html`. No reintroducir `BOUNCE BALL` ni `ENDLESS`.

## Objetivo

Desarrollar un videojuego pequeño pero completo aplicando:
- Buenas prácticas de organización de código (clases pequeñas, sin lógica duplicada, sin globales innecesarios).
- Desarrollo asistido por agentes de programación (flujo Plan → Build, pasos pequeños y verificables).
- Flujo de juego completo: iniciar, jugar, derrota con puntaje/récord y reinicio.

## 2. Estructura relevante

```
index.html                  # título + #game-container + src/main.js
public/                     # estáticos servidos tal cual
src/main.js                 # bootstrap + overlay de errores (error-overlay)
src/game/main.js            # config Phaser + StartGame(parent)
src/game/scenes/
  Boot.js                   # carga mínima → Preloader
  Preloader.js              # barra de carga → MainMenu
  MainMenu.js               # título, instrucciones, récord, input inicio
  Game.js                   # gameplay (física, plataformas, pinchos, HUD, cámara)
  GameOver.js               # ¡EXPLOTÓ!, puntaje, récord, reintento/menú
vite/config.dev.mjs         # config dev
vite/config.prod.mjs        # config build
```

## 3. Comandos (Windows PowerShell 5.1)

> En este entorno `npm.ps1` está bloqueado por ExecutionPolicy. Usar scope Process Bypass.

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
npm run dev-nolog       # dev con hot-reload, sin telemetría
npm run build-nolog     # build prod → dist/ (verificación obligatoria tras editar)
```

- Dev server por defecto: `http://localhost:8080`.
- No commitear `node_modules/` ni `dist/`.
- Verificar siempre con `npm run build-nolog` tras cambios en `src/`. Build OK = `✨ Done ✨`.

## 4. Convenciones de código

- ES Modules: `import { Scene } from 'phaser'`, `export class X extends Scene`.
- `Game.js` usa `import * as Phaser from 'phaser'` y `extends Phaser.Scene`.
- Indentación 4 espacios, llaves Allman (apertura en línea nueva):
  ```js
  create ()
  {
      // ...
  }
  ```
- Espacio antes de paréntesis en métodos: `create ()`, `update (time, delta)`.
- Comentarios en español, concisos. UI en español (`Altura`, `Récord`, `Pulsa ESPACIO o clic para jugar`).
- Fuentes: `Arial Black` para títulos/HUD, `Arial` para cuerpo, `monospace` solo para diagnóstico temporal (no dejar en producción).
- Colores base: fondo `#0d1b2a`, pelota `#e63946`, plataforma `#2ec4b6`, acento `#ffd166`, pincho `#f1fa8c`.

## 5. Reglas de gameplay (no romper)

- Física: `arcade`, `gravity {x:0,y:0}`, `debug: false`. Gravedad de pelota: `GRAVITY=1300`, `BOUNCE_V=-780`, `MOVE_SPEED=360` (tuning en constructor de `Game`).
- Plataformas: grupo `immovable + allowGravity:false`, solo colisión `up=true` (estilo Doodle Jump), `body.updateFromGameObject()` tras mover.
- Patrón canónico anti-deriva en `Game.js`: `p.cx / p.cy` (plataformas) y `s.sx / s.sy` (pinchos) son fuente de verdad. Restaurar cada frame + `body.setVelocity(0,0)`.
- Pinchos: grupo aparte, `overlap` (no `collider`), flotantes a costados (`addFloatingSpike`), escala 0.8, hitbox 60%.
- Cámara: seguimiento manual solo hacia arriba (`wantY = ball.y - 480; if (wantY < scrollY) scrollY = wantY`). Fondo `tileSprite dot` con `scrollFactor(0)` + `tilePositionY = scrollY * 0.3`.
- Puntaje: `score = floor((startY - minY)/10)`, solo cuando `ball.y < minY`.
- Reciclaje: `killY = scrollY + H + 60`. Plataformas se reposicionan arriba con `gapForHeight / rollPlatformOpts`; pinchos bajo `killY` se destruyen.
- Clave récord: `bounceBallBest` en `localStorage`. **No renombrar** (perdería récords existentes). Formato: `Récord: ${best} m`.
- Input juego: **solo teclado** para moverse (`cursors + A/D`), `R` reinicio. Menú/GameOver además aceptan `SPACE/ENTER` y `pointerdown`, GameOver acepta `M` para menú. No agregar touch/joystick sin pedirlo.

## 6. Prohibiciones / decisiones ya tomadas

- NO agregar HUD de telemetría verde (`y: vy: topY: plats: spikes: fps:`). Ya se quitó `debugText/debugTimer` de `Game.js`. No reintroducir.
- NO dejar marcadores de diagnóstico visibles (`v8-canonical`, `error-overlay` solo para errores reales, `dumpPlats/keyT` es temporal).
- NO activar `arcade.debug = true` en producción.
- NO cambiar `width/height` (480x800) ni `Scale` sin aprobación.
- NO agregar assets binarios externos si se puede generar procedural. Si se agregan, van en `public/assets` y se documentan en README.
- Preferir editar archivos existentes antes que crear nuevos. No crear `.md` nuevos salvo pedido explícito.

## 7. Cómo verificar cambios

1. Leer archivos implicados con `read` antes de editar.
2. Edits mínimos con `edit` (preservar `cx/cy`, `sx/sy`, colisiones `up`-only).
3. `grep` para asegurar que no queden referencias (`debugText`, `ENDLESS`, `BOUNCE BALL`).
4. Correr `npm run build-nolog` (con Bypass en Windows). Solo marcar done si sale `✨ Done ✨`.
5. Responder corto, en español, con archivos:líneas tocadas (ej. `src/game/scenes/Game.js:82`).
