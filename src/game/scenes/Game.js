import * as Phaser from 'phaser';
import { getLanguage, getPhrase, fill } from '../../services/translations';
import keys from '../../enums/keys';

export class Game extends Phaser.Scene
{
    constructor ()
    {
        super('Game');

        // --- Tuning ---
        this.GRAVITY = 1300;
        this.BOUNCE_V = -780;
        this.MOVE_SPEED = 360;
        this.W = 480;
        this.H = 800;
    }

    init (data)
    {
        this.language = (data && data.language) || getLanguage() || 'es';
    }

    create ()
    {
        this.gameOver = false;
        this.score = 0;
        this.minY = 0;          // punto más alto alcanzado (y más chico = más alto)
        this.topY = 0;          // Y de la plataforma más alta generada
        this.startY = 700;

        this.createTextures();

        this.cameras.main.setBackgroundColor('#0d1b2a');

        // Fondo sutil que no se mueve (parallax simple con tileSprite fijo a cámara)
        this.bg = this.add.tileSprite(0, 0, this.W, this.H, 'dot')
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setAlpha(0.6)
            .setDepth(-10);

        // --- Grupos físicos ---
        this.platforms = this.physics.add.group({ allowGravity: false, immovable: true });
        this.spikes = this.physics.add.group({ allowGravity: false, immovable: true });

        // --- Pelota ---
        this.ball = this.physics.add.sprite(this.W / 2, this.startY, 'ball');
        this.ball.setDepth(5);
        this.ball.setGravityY(this.GRAVITY);
        this.ball.setCollideWorldBounds(false);
        if (this.ball.body && this.ball.body.setCircle) {
            this.ball.body.setCircle(13, 3, 3);
        }
        this.ball.setVelocityY(this.BOUNCE_V * 0.6);
        this.ball.setBounce(0);

        this.minY = this.startY;

        // --- Plataformas iniciales ---
        // Base segura debajo del jugador
        this.addPlatform(this.W / 2, 770, { w: 160, moving: false });
        this.topY = 770;

        let y = 770;
        for (let i = 0; i < 22; i++)
        {
            const h = Math.max(0, -(y - 770)); // altura aprox
            const gap = this.gapForHeight(h);
            y -= gap;
            const x = Phaser.Math.Between(50, this.W - 50);
            this.addPlatform(x, y, this.rollPlatformOpts(h));
            this.topY = Math.min(this.topY, y);
        }

        // --- Colisiones ---
        this.physics.add.collider(this.ball, this.platforms, this.onBounce, null, this);
        this.physics.add.overlap(this.ball, this.spikes, this.onSpikeHit, null, this);

        // --- Input: SOLO teclado ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.keyT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);

        // --- HUD fijo a cámara ---
        this.best = parseInt(localStorage.getItem('bounceBallBest') || '0', 10) || 0;
        this.scoreText = this.add.text(12, 10, fill(getPhrase(keys.sceneGame.height), 0), {
            fontFamily: 'Arial Black', fontSize: '22px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 5
        }).setScrollFactor(0).setDepth(100);
        this.bestText = this.add.text(12, 38, fill(getPhrase(keys.sceneGame.record), this.best), {
            fontFamily: 'Arial', fontSize: '16px', color: '#ffd166'
        }).setScrollFactor(0).setDepth(100);
        this.helpText = this.add.text(this.W / 2, this.H - 26,
            getPhrase(keys.sceneGame.help), {
            fontFamily: 'Arial', fontSize: '15px', color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0.85);

        // Cámara: empieza mirando la zona de inicio.
        // Seguimiento manual solo hacia arriba (nunca baja).
        this.cameras.main.scrollY = this.startY - this.H + 120;

        this.lastCamY = this.cameras.main.scrollY;
    }

    // ================= Texturas procedurales (sin assets externos) =================
    createTextures ()
    {
        if (!this.textures.exists('ball'))
        {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xe63946, 1);
            g.fillCircle(16, 16, 14);
            g.fillStyle(0xffffff, 0.85);
            g.fillCircle(11, 10, 4); // brillo
            g.lineStyle(2, 0x7f1d1d, 1);
            g.strokeCircle(16, 16, 14);
            g.generateTexture('ball', 32, 32);
            g.destroy();
        }
        if (!this.textures.exists('platform'))
        {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x2ec4b6, 1);
            g.fillRoundedRect(0, 0, 140, 20, 8);
            g.lineStyle(2, 0x0a3d3d, 1);
            g.strokeRoundedRect(1, 1, 138, 18, 8);
            g.fillStyle(0xffffff, 0.35);
            g.fillRoundedRect(4, 3, 132, 5, 3);
            g.generateTexture('platform', 140, 20);
            g.destroy();
        }
        if (!this.textures.exists('spike'))
        {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xf1fa8c, 1);
            g.lineStyle(2, 0x333333, 1);
            // 3 pinchos
            for (let i = 0; i < 3; i++)
            {
                const x0 = i * 18;
                g.fillTriangle(x0, 24, x0 + 9, 2, x0 + 18, 24);
                g.strokeTriangle(x0, 24, x0 + 9, 2, x0 + 18, 24);
            }
            g.generateTexture('spike', 54, 26);
            g.destroy();
        }
        if (!this.textures.exists('dot'))
        {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x1b263b, 1);
            g.fillRect(0, 0, 48, 48);
            g.fillStyle(0x415a77, 1);
            g.fillCircle(24, 24, 2);
            g.generateTexture('dot', 48, 48);
            g.destroy();
        }
        if (!this.textures.exists('bit'))
        {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffffff, 1);
            g.fillCircle(4, 4, 4);
            g.generateTexture('bit', 8, 8);
            g.destroy();
        }
    }

    // ================= Dificultad progresiva =================
    gapForHeight (h)
    {
        // h en px de altura. Base 105 → hasta 200.
        // El salto máximo es 234px (780^2 / 2*1300), así que 200 deja margen.
        return Math.min(105 + h * 0.018, 200);
    }

    widthForHeight (h)
    {
        return Math.max(140 * (1 - h * 0.000028), 62);
    }

    movingChanceForHeight (h)
    {
        if (h < 1200) return 0;
        return Math.min(0.10 + (h - 1200) * 0.00005, 0.35);
    }

    rollPlatformOpts (h)
    {
        // Todas las plataformas son seguras y rebotan.
        // El peligro son los pinchos flotantes (se esquivan en el aire).
        return {
            w: this.widthForHeight(h),
            moving: Math.random() < this.movingChanceForHeight(h)
        };
    }

    addPlatform (x, y, opts = {})
    {
        const { w = 140, moving = false } = opts;
        const p = this.platforms.create(x, y, 'platform');
        p.setDepth(1);
        p.setDisplaySize(w, 20);
        p.body.setAllowGravity(false);
        p.body.setImmovable(true);
        p.body.setVelocity(0, 0);
        // Solo colisiona por arriba (estilo Doodle Jump)
        p.body.checkCollision.up = true;
        p.body.checkCollision.down = false;
        p.body.checkCollision.left = false;
        p.body.checkCollision.right = false;
        p.body.updateFromGameObject();

        // Datos de movimiento lateral (dificultad tardía)
        p.isMoving = moving;
        p.moveSpeed = moving ? Phaser.Math.Between(60, 140) : 0;
        p.moveDir = Math.random() < 0.5 ? -1 : 1;
        p.moveRange = Phaser.Math.Between(60, 140);
        p.baseX = x;
        p.platW = w;
        // Posición canónica: la única fuente de verdad. Cada frame se
        // restaura (ver update) para que nada pueda desplazar plataformas.
        p.cx = x;
        p.cy = y;

        // Pincho flotante entre plataformas: se esquiva en el aire.
        // Más probable cuanto más alto (dificultad progresiva).
        const h = Math.max(0, -(y - 770));
        const floatChance = Math.min(0.15 + h * 0.00005, 0.40);
        if (Math.random() < floatChance)
        {
            this.addFloatingSpike(x, y);
        }

        return p;
    }

    addFloatingSpike (platX, platY)
    {
        // Desplazado a un costado de la plataforma para que la línea
        // vertical directa quede libre y siempre se pueda esquivar.
        const side = Math.random() < 0.5 ? -1 : 1;
        let fx = platX + side * Phaser.Math.Between(90, 190);
        fx = Phaser.Math.Clamp(fx, 30, this.W - 30);
        const fy = platY - Phaser.Math.Between(50, 85);
        const s = this.spikes.create(fx, fy, 'spike');
        s.setDepth(2);
        s.setScale(0.8);
        s.body.setAllowGravity(false);
        s.body.setImmovable(true);
        s.body.setSize(s.width * 0.6, s.height * 0.6);
        s.body.updateFromGameObject();
        s.isFloating = true;
        // Posición canónica del pincho (nunca se mueve solo)
        s.sx = fx;
        s.sy = fy;
        return s;
    }

    onBounce (ball, platform)
    {
        if (this.gameOver) return;
        // OJO: Arcade separa los cuerpos ANTES de llamar a este callback,
        // así que aquí velocity.y ya vale 0. La forma fiable de saber que
        // la pelota aterrizó encima es con las banderas touching.
        if (ball.body.touching.down && platform.body.touching.up)
        {
            const ballBottom = ball.y + ball.displayHeight / 2 - 4;
            const platTop = platform.y - 12;
            if (ballBottom <= platTop + 14)
            {
                ball.setVelocityY(this.BOUNCE_V);
                this.blip(300 + Math.random() * 80, 0.05);
            }
        }
    }

    onSpikeHit ()
    {
        if (this.gameOver) return;
        this.explode();
    }

    explode ()
    {
        this.gameOver = true;
        this.ball.setVelocity(0, 0);
        this.ball.body.setEnable(false);
        this.ball.setVisible(false);

        // Partículas de explosión
        const parts = this.add.particles(this.ball.x, this.ball.y, 'bit', {
            speed: { min: 120, max: 420 },
            angle: { min: 0, max: 360 },
            lifespan: { min: 300, max: 800 },
            quantity: 28,
            scale: { start: 1.4, end: 0 },
            tint: [0xe63946, 0xffd166, 0xffffff]
        });
        parts.setDepth(50);
        parts.explode(40, this.ball.x, this.ball.y);

        this.cameras.main.shake(250, 0.015);
        this.blip(120, 0.25);

        if (this.score > this.best)
        {
            this.best = this.score;
            localStorage.setItem('bounceBallBest', String(this.best));
        }

        this.time.delayedCall(1000, () => {
            this.scene.start('GameOver', { score: this.score, best: this.best, language: this.language });
        });
    }

    // Sonidito procedural (sin assets): oscilador WebAudio
    blip (freq = 440, dur = 0.06)
    {
        try
        {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            if (!this._audio) this._audio = new Ctx();
            const ctx = this._audio;
            if (ctx.state === 'suspended') ctx.resume();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'square';
            o.frequency.value = freq;
            g.gain.setValueAtTime(0.05, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
            o.connect(g).connect(ctx.destination);
            o.start();
            o.stop(ctx.currentTime + dur);
        }
        catch (e) { /* sin audio, no pasa nada */ }
    }

    update (time, delta)
    {
        if (this.gameOver) return;

        const dt = Math.min(delta / 1000, 0.033);

        // --- Movimiento lateral: SOLO teclado ---
        let dir = 0;
        if (this.cursors.left.isDown || this.keyA.isDown) dir -= 1;
        if (this.cursors.right.isDown || this.keyD.isDown) dir += 1;
        this.ball.setVelocityX(dir * this.MOVE_SPEED);

        // Flip visual según dirección
        if (dir !== 0) this.ball.setFlipX(dir < 0);

        // Wrap horizontal (salir por un lado = entrar por el otro)
        const m = 20;
        if (this.ball.x < -m) this.ball.x = this.W + m;
        else if (this.ball.x > this.W + m) this.ball.x = -m;

        // --- Plataformas: oscilación + restauración canónica anti-deriva ---
        for (const p of this.platforms.getChildren())
        {
            if (!p.active || !p.body) continue;
            if (p.isMoving)
            {
                p.x += p.moveDir * p.moveSpeed * dt;
                if (p.x > p.baseX + p.moveRange) { p.x = p.baseX + p.moveRange; p.moveDir = -1; }
                if (p.x < p.baseX - p.moveRange) { p.x = p.baseX - p.moveRange; p.moveDir = 1; }
                p.cx = p.x;      // la X del móvil sí evoluciona (acotada)
                p.y = p.cy;      // la Y es canónica: nunca deriva
            }
            else
            {
                p.x = p.cx;      // restauración canónica total
                p.y = p.cy;
            }
            p.body.setVelocity(0, 0);      // sin velocidad residual
            p.body.updateFromGameObject();
        }

        // --- Cámara: solo sube, nunca baja ---
        const cam = this.cameras.main;
        const wantY = this.ball.y - 480;
        if (wantY < cam.scrollY)
        {
            cam.scrollY = wantY;
        }
        // Parallax del fondo
        this.bg.tilePositionY = cam.scrollY * 0.3;

        // --- Puntaje por altura máxima ---
        if (this.ball.y < this.minY)
        {
            this.minY = this.ball.y;
            this.score = Math.max(0, Math.floor((this.startY - this.minY) / 10));
            this.scoreText.setText(fill(getPhrase(keys.sceneGame.height), this.score));
            if (this.score > this.best) this.bestText.setText(fill(getPhrase(keys.sceneGame.record), this.score));
        }

        // --- Reciclar plataformas que quedaron abajo ---
        const killY = cam.scrollY + this.H + 60;
        for (const p of [...this.platforms.getChildren()])
        {
            if (p.y > killY)
            {
                const h = Math.max(0, -(this.topY - 770));
                const gap = this.gapForHeight(h);
                this.topY -= gap;
                p.x = Phaser.Math.Between(45, this.W - 45);
                p.y = this.topY;
                const opts = this.rollPlatformOpts(h);
                p.setDisplaySize(opts.w, 20);
                p.platW = opts.w;
                p.isMoving = opts.moving;
                p.moveSpeed = opts.moving ? Phaser.Math.Between(60, 150 + Math.min(h * 0.02, 80)) : 0;
                p.moveDir = Math.random() < 0.5 ? -1 : 1;
                p.moveRange = Phaser.Math.Between(60, 140);
                p.baseX = p.x;
                // Nueva posición canónica (fuente de verdad anti-deriva)
                p.cx = p.x;
                p.cy = p.y;
                p.body.updateFromGameObject();

                // Con cierta probabilidad, pincho flotante cerca (esquivable)
                const floatChance = Math.min(0.15 + h * 0.00005, 0.40);
                if (Math.random() < floatChance)
                {
                    const s = this.addFloatingSpike(p.x, p.y);
                    // El pincho nuevo nace arriba; si quedó bajo por algún motivo, no importa
                    void s;
                }
            }
        }

        // Reciclar pinchos flotantes que quedaron abajo + fijar el resto
        for (const s of [...this.spikes.getChildren()])
        {
            if (!s.active || !s.body) continue;
            if (s.y > killY)
            {
                s.destroy();
                continue;
            }
            if (s.sx !== undefined)
            {
                s.x = s.sx;
                s.y = s.sy;
            }
            s.body.setVelocity(0, 0);
            s.body.updateFromGameObject();
        }

        // --- Muerte por caída ---
        if (this.ball.y > cam.scrollY + this.H + 80)
        {
            this.explode();
            return;
        }

        // Reinicio rápido con R
        if (Phaser.Input.Keyboard.JustDown(this.keyR))
        {
            this.scene.restart({ language: this.language });
        }

        // Volcado de diagnóstico con T (temporal)
        if (Phaser.Input.Keyboard.JustDown(this.keyT))
        {
            this.dumpPlats();
        }
    }

    // Diagnóstico temporal: vuelca plataformas ordenadas por Y al cartel rojo
    dumpPlats ()
    {
        const rows = this.platforms.getChildren()
            .map(p => ({
                y: Math.round(p.y),
                x: Math.round(p.x),
                v: p.visible ? 1 : 0,
                act: p.active ? 1 : 0,
                w: Math.round(p.displayWidth),
                by: p.body ? Math.round(p.body.y) : null,
                imm: p.body && p.body.immovable ? 1 : 0,
                vx: p.body ? Math.round(p.body.velocity.x) : null,
                vy: p.body ? Math.round(p.body.velocity.y) : null,
                mov: p.body && p.body.moves ? 1 : 0,
                ag: p.body && p.body.allowGravity ? 1 : 0,
                mv: p.isMoving ? 1 : 0
            }))
            .sort((m, n) => m.y - n.y);
        let box = document.getElementById('error-overlay');
        if (!box)
        {
            box = document.createElement('pre');
            box.id = 'error-overlay';
            box.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:9999;' +
                'max-width:95vw;max-height:40vh;overflow:auto;background:#7f0000;color:#fff;' +
                'font:12px monospace;padding:8px;white-space:pre-wrap;text-align:left;';
            document.body.appendChild(box);
        }
        box.textContent += 'PLATS(ballY=' + Math.round(this.ball.y) +
            ' camY=' + Math.round(this.cameras.main.scrollY) + '):\n' +
            rows.map(r => `y=${r.y} x=${r.x} vis=${r.v} act=${r.act} w=${r.w} bodyY=${r.by} imm=${r.imm} vx=${r.vx} vy=${r.vy} moves=${r.mov} grav=${r.ag} isMov=${r.mv}`).join('\n') + '\n';
    }
}
