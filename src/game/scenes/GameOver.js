import { Scene } from 'phaser';
import { EN, ES } from '../../enums/languages';
import { FETCHED, FETCHING, READY, TODO } from '../../enums/status';
import { getLanguage, getPhrase, getTranslations, fill, ml } from '../../services/translations';
import keys from '../../enums/keys';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
        this.language = 'es';
        this.wasChangedLanguage = TODO;
    }

    init (data)
    {
        this.finalScore = data.score || 0;
        this.best = data.best || parseInt(localStorage.getItem('bounceBallBest') || '0', 10) || 0;
        this.language = (data && data.language) || getLanguage() || 'es';
        this.wasChangedLanguage = TODO;
    }

    create ()
    {
        const W = 480;
        const H = 800;
        const t = keys.sceneGameOver;

        this.cameras.main.setBackgroundColor('#3d0000');

        // Botones de idioma (igual que el ejemplo)
        const btnES = this.add.rectangle(140, 45, 150, 55, 0xffffff).setInteractive({ useHandCursor: true });
        const btnEN = this.add.rectangle(340, 45, 150, 55, 0xffffff).setInteractive({ useHandCursor: true });
        this.add.text(btnES.x, btnES.y, 'Español', { fontFamily: 'Arial Black', fontSize: '18px', color: '#000000' }).setOrigin(0.5);
        this.add.text(btnEN.x, btnEN.y, 'English', { fontFamily: 'Arial Black', fontSize: '18px', color: '#000000' }).setOrigin(0.5);
        btnES.on('pointerup', () => { this.changeLanguage(ES); });
        btnEN.on('pointerup', () => { this.changeLanguage(EN); });

        this.titleText = this.add.text(W / 2, 250, getPhrase(t.title), {
            fontFamily: 'Arial Black', fontSize: '56px', color: '#ff5964',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.subtitleText = this.add.text(W / 2, 340, getPhrase(t.subtitle), {
            fontFamily: 'Arial', fontSize: '20px', color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        this.scoreText = this.add.text(W / 2, 430, fill(getPhrase(t.score), this.finalScore), {
            fontFamily: 'Arial Black', fontSize: '64px', color: '#ffffff',
            stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5);

        this.isRecord = this.finalScore > 0 && this.finalScore >= this.best;
        this.recordText = this.add.text(W / 2, 500,
            this.isRecord ? getPhrase(t.newRecord) : fill(getPhrase(t.record), this.best),
            {
                fontFamily: 'Arial Black', fontSize: '22px',
                color: this.isRecord ? '#ffd166' : '#e0e1dd'
            }).setOrigin(0.5);

        this.hintsText = this.add.text(W / 2, 600, ml(getPhrase(t.hints)), {
            fontFamily: 'Arial', fontSize: '18px', color: '#ffffff',
            align: 'center', lineSpacing: 6
        }).setOrigin(0.5);

        let done = false;
        const retry = () => {
            if (done) return;
            done = true;
            this.scene.start('Game', { language: this.language });
        };
        const menu = () => {
            if (done) return;
            done = true;
            this.scene.start('MainMenu', { language: this.language });
        };

        // Clic (fuera de la franja de idiomas) = reintentar
        this.input.on('pointerdown', (pointer) => {
            if (pointer.y < 90) return;
            retry();
        });
        if (this.input.keyboard)
        {
            this.input.keyboard.once('keydown-SPACE', retry);
            this.input.keyboard.once('keydown-ENTER', retry);
            this.input.keyboard.once('keydown-R', retry);
            this.input.keyboard.once('keydown-M', menu);
        }
    }

    update ()
    {
        // Igual que el ejemplo: repintar en el frame siguiente al FETCHED.
        if (this.wasChangedLanguage === FETCHED)
        {
            this.wasChangedLanguage = READY;
            const t = keys.sceneGameOver;
            this.titleText.setText(getPhrase(t.title));
            this.subtitleText.setText(getPhrase(t.subtitle));
            this.scoreText.setText(fill(getPhrase(t.score), this.finalScore));
            this.recordText.setText(
                this.isRecord ? getPhrase(t.newRecord) : fill(getPhrase(t.record), this.best)
            );
            this.hintsText.setText(ml(getPhrase(t.hints)));
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
