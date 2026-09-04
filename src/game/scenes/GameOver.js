import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    init (data)
    {
        this.finalScore = data.score || 0;
        this.best = data.best || parseInt(localStorage.getItem('bounceBallBest') || '0', 10) || 0;
    }

    create ()
    {
        const W = 480;
        const H = 800;

        this.cameras.main.setBackgroundColor('#3d0000');

        this.add.text(W / 2, 250, '¡EXPLOTÓ!', {
            fontFamily: 'Arial Black', fontSize: '56px', color: '#ff5964',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(W / 2, 340, 'La pelota se pinchó', {
            fontFamily: 'Arial', fontSize: '20px', color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(W / 2, 430, `${this.finalScore} m`, {
            fontFamily: 'Arial Black', fontSize: '64px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5);

        const isRecord = this.finalScore > 0 && this.finalScore >= this.best;
        this.add.text(W / 2, 500,
            isRecord ? '★ ¡NUEVO RÉCORD! ★' : `Récord: ${this.best} m`,
            {
                fontFamily: 'Arial Black', fontSize: '22px',
                color: isRecord ? '#ffd166' : '#e0e1dd'
            }).setOrigin(0.5);

        this.add.text(W / 2, 600, 'ESPACIO / clic: reintentar\nM: menú', {
            fontFamily: 'Arial', fontSize: '18px', color: '#ffffff',
            align: 'center', lineSpacing: 6
        }).setOrigin(0.5);

        const retry = () => this.scene.start('Game');
        const menu = () => this.scene.start('MainMenu');

        this.input.once('pointerdown', retry);
        if (this.input.keyboard)
        {
            this.input.keyboard.once('keydown-SPACE', retry);
            this.input.keyboard.once('keydown-ENTER', retry);
            this.input.keyboard.once('keydown-R', retry);
            this.input.keyboard.once('keydown-M', menu);
        }
    }
}
