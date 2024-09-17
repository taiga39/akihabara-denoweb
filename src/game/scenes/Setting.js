import { createRelativeUnits } from '../main';
import { BaseScene } from '../BaseScene';
import { loadGameState, saveGameState } from '../hooks/gameState';

export class Setting extends BaseScene {
    constructor() {
        super('Setting');
        this.defaultEmail = 'kairu@kairu.com';
        this.defaultPassword = '●●●●';
        this.defaultName = 'カイル';
    }

    preload() {
        this.load.svg('eye-icon', 'assets/eye.svg');

        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
    }

    createScene() {
        const ru = createRelativeUnits(this);
        
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xFFFFFF).setOrigin(0, 0);

        const centerX = ru.toPixels(50);

        this.createSettingItem(centerX, ru.toPixels(30), '名前', this.defaultName, 'nameText');
        this.createSettingItem(centerX, ru.toPixels(55), 'Email', this.defaultEmail, 'emailText');
        this.createSettingItem(centerX, ru.toPixels(80), 'Password', this.defaultPassword, 'passwordText', true);

        const closeButton = this.createHighQualityText(centerX, ru.toPixels(105), '閉じる', {
            fontSize: ru.fontSize.small,
            color: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: ru.toPixels(8), y: ru.toPixels(4) },
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();
        

        closeButton.on('pointerdown', () => {
            this.scene.start('MenuScene');  // MenuSceneに遷移
        });
    }

    createSettingItem(x, y, label, value, textName, isPassword = false) {
        const ru = createRelativeUnits(this);

        this.createHighQualityText(x, y, label, {
            fontSize: ru.fontSize.medium,
            color: '#000000',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        const valueText = this.createHighQualityText(x, y + ru.toPixels(10), value, {
            fontSize: ru.fontSize.small,
            color: '#333333',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        this[textName] = {
            text: valueText,
            isPassword: isPassword,
            isVisible: false
        };

        if (isPassword) {
            // 目のアイコンの位置を少し中央寄りに調整
            this.passwordToggleButton = this.add.image(x + ru.toPixels(35), y + ru.toPixels(10), 'eye-icon')
                .setOrigin(0.5)
                .setInteractive()
                .setScale(ru.toPixels(0.03));

            this.passwordToggleButton.on('pointerdown', () => {
                this.togglePasswordVisibility();
            });
        }
    }

    togglePasswordVisibility() {
        this.passwordText.isVisible = !this.passwordText.isVisible;
        this.updatePasswordDisplay();
    }

    updatePasswordDisplay() {
        if (this.passwordText.isVisible) {
            this.passwordText.text.setText('モロッコ');
        } else {
            this.passwordText.text.setText('●●●●');
        }
    }

    createHighQualityText(x, y, text, style) {
        const highResScale = 3;
        style.fontSize *= highResScale;
        const textObject = this.add.text(x, y, text, style);
        textObject.setScale(1 / highResScale);
        return textObject;
    }
}