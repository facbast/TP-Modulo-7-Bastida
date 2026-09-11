import { Scene } from 'phaser';
import { EN, ES } from '../../enums/languages';
import { FETCHED, FETCHING, READY, TODO } from '../../enums/status';
import { getLanguage, getPhrase, getTranslations, fill, ml } from '../../services/translations';
import keys from '../../enums/keys';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
        this.language = 'es';
        this.wasChangedLanguage = TODO;
    }

    init (data)
    {
        this.language = (data && data.language) || getLanguage() || 'es';
        this.wasChangedLanguage = TODO;
    }

    create ()
    {
        const W = 480;
        const H = 800;
        const t = keys.sceneMainMenu;

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

        // Botones de idioma (igual que el ejemplo: rectángulos interactivos)
        const btnES = this.add.rectangle(140, 45, 150, 55, 0xffffff).setInteractive({ useHandCursor: true });
        const btnEN = this.add.rectangle(340, 45, 150, 55, 0xffffff).setInteractive({ useHandCursor: true });
        this.add.text(btnES.x, btnES.y, 'Español', { fontFamily: 'Arial Black', fontSize: '18px', color: '#000000' }).setOrigin(0.5);
        this.add.text(btnEN.x, btnEN.y, 'English', { fontFamily: 'Arial Black', fontSize: '18px', color: '#000000' }).setOrigin(0.5);
        btnES.on('pointerup', () => { this.changeLanguage(ES); });
        btnEN.on('pointerup', () => { this.changeLanguage(EN); });

        this.add.text(W / 2, 150, 'PICADA\nAL MAS ALLA', {
            fontFamily: 'Arial Black', fontSize: '44px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
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

        this.instructionsText = this.add.text(W / 2, 430, ml(getPhrase(t.instructions)),
            {
                fontFamily: 'Arial', fontSize: '19px', color: '#e0e1dd',
                align: 'center', lineSpacing: 6
            }).setOrigin(0.5);

        this.controlsText = this.add.text(W / 2, 590, ml(getPhrase(t.controls)),
            {
                fontFamily: 'Arial', fontSize: '17px', color: '#2ec4b6',
                align: 'center', lineSpacing: 5
            }).setOrigin(0.5);

        this.recordText = this.add.text(W / 2, 640, fill(getPhrase(t.record), best), {
            fontFamily: 'Arial Black', fontSize: '20px', color: '#ffd166'
        }).setOrigin(0.5);

        this.playText = this.add.text(W / 2, 710, getPhrase(t.play), {
            fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.playText,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Inicio: teclado + clic (el clic en la franja de idiomas no inicia)
        let started = false;
        const start = () => {
            if (started) return;
            started = true;
            this.scene.start('Game', { language: this.language });
        };
        this.input.on('pointerdown', (pointer) => {
            if (pointer.y < 90) return;
            start();
        });
        if (this.input.keyboard)
        {
            this.input.keyboard.once('keydown-SPACE', start);
            this.input.keyboard.once('keydown-ENTER', start);
        }
    }

    update ()
    {
        // Igual que el ejemplo: el repintado ocurre en el frame
        // siguiente al FETCHED (FETCHING → FETCHED → READY).
        if (this.wasChangedLanguage === FETCHED)
        {
            this.wasChangedLanguage = READY;
            const t = keys.sceneMainMenu;
            const best = localStorage.getItem('bounceBallBest') || '0';
            this.instructionsText.setText(ml(getPhrase(t.instructions)));
            this.controlsText.setText(ml(getPhrase(t.controls)));
            this.recordText.setText(fill(getPhrase(t.record), best));
            this.playText.setText(getPhrase(t.play));
        }
    }

    updateWasChangedLanguage = () =>
    {
        this.wasChangedLanguage = FETCHED;
    };

    async changeLanguage (language)
    {
        if (language === this.language) return;
        this.language = language;
        this.wasChangedLanguage = FETCHING;
        await getTranslations(language, this.updateWasChangedLanguage);
    }
}
