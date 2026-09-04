import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const W = 480;
        const H = 800;

        this.cameras.main.setBackgroundColor('#0d1b2a');

        // Textura de la pelota también aquí (el menú se muestra antes que Game)
        if (!this.textures.exists('ball'))
        {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xe63946, 1);
            g.fillCircle(16, 16, 14);
            g.fillStyle(0xffffff, 0.85);
            g.fillCircle(11, 10, 4);
            g.lineStyle(2, 0x7f1d1d, 1);
            g.strokeCircle(16, 16, 14);
            g.generateTexture('ball', 32, 32);
            g.destroy();
        }

        this.add.text(W / 2, 150, 'BOUNCE BALL', {
            fontFamily: 'Arial Black', fontSize: '48px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(W / 2, 210, 'ENDLESS', {
            fontFamily: 'Arial Black', fontSize: '28px', color: '#ffd166',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // Pelotita decorativa rebotando
        if (this.textures.exists('ball'))
        {
            const ball = this.add.image(W / 2, 330, 'ball').setScale(2);
            this.tweens.add({
                targets: ball,
                y: 280,
                duration: 450,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        const best = localStorage.getItem('bounceBallBest') || '0';

        this.add.text(W / 2, 430,
            'La pelota rebota sola.\nMuévela de izquierda a derecha\npara subir por las plataformas.\n\nEsquiva los pinchos.\nCada metro cuenta.',
            {
                fontFamily: 'Arial', fontSize: '19px', color: '#e0e1dd',
                align: 'center', lineSpacing: 6
            }).setOrigin(0.5);

        this.add.text(W / 2, 590,
            '← →  o  A / D para moverse\nR para reiniciar',
            {
                fontFamily: 'Arial', fontSize: '17px', color: '#2ec4b6',
                align: 'center', lineSpacing: 5
            }).setOrigin(0.5);

        this.add.text(W / 2, 640, `Récord: ${best} m`, {
            fontFamily: 'Arial Black', fontSize: '20px', color: '#ffd166'
        }).setOrigin(0.5);

        this.add.text(W / 2, 710, 'Pulsa ESPACIO o clic para jugar', {
            fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5);

        // Marcador de versión (diagnóstico: confirma que el navegador
        // corre el código actual; se quita al final)
        this.add.text(W - 10, H - 10, 'v8-canonical', {
            fontFamily: 'monospace', fontSize: '13px', color: '#7fff7f'
        }).setOrigin(1, 1);
        const prompt = this.children.list[this.children.list.length - 1];

        this.tweens.add({
            targets: prompt,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        const start = () => this.scene.start('Game');
        this.input.once('pointerdown', start);
        if (this.input.keyboard)
        {
            this.input.keyboard.once('keydown-SPACE', start);
            this.input.keyboard.once('keydown-ENTER', start);
        }
    }
}
