import { Scene } from 'phaser';
import { createRelativeUnits } from '../main';
import SpeechBubble from '../component/SpeechBubble';

export class Login extends Scene {
    constructor() {
        super('Login');
        this.defaultEmail = 'kairu@kairu.com';
        this.defaultPassword = '🍑(もも)×3=国名';
    }

    preload() {
        this.load.image('kairu', 'path/to/kairu/image.png');
        this.load.plugin('rexhiddeninputtextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexhiddeninputtextplugin.min.js', true);
    }

    create() {
        const ru = createRelativeUnits(this);
        
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xcccccc).setOrigin(0, 0);

        const centerX = ru.toPixels(50);

        this.createHighQualityText(centerX, ru.toPixels(45), 'Email', {
            fontSize: ru.fontSize.medium,
            color: '#000000',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        this.createInputField(centerX, ru.toPixels(55), this.defaultEmail, 'emailInput');

        this.createHighQualityText(centerX, ru.toPixels(70), 'Password', {
            fontSize: ru.fontSize.medium,
            color: '#000000',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        this.createInputField(centerX, ru.toPixels(80), this.defaultPassword, 'passwordInput', true);

        // トグルボタンの作成
        this.passwordToggleButton = this.createHighQualityText(centerX + ru.toPixels(19), ru.toPixels(80) - ru.toPixels(2), '👁', {
            fontSize: ru.fontSize.small,
            fontFamily: 'Arial, sans-serif',
            color: '#000000'
        }).setInteractive();

        this.passwordToggleButton.on('pointerdown', () => {
            this.togglePasswordVisibility();
        });

        this.errorMessage = this.createHighQualityText(centerX, ru.toPixels(90), '', {
            fontSize: ru.fontSize.small,
            color: '#FF0000',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);

        const loginButton = this.createHighQualityText(centerX, ru.toPixels(100), 'ログイン', {
            fontSize: ru.fontSize.small,
            color: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: ru.toPixels(8), y: ru.toPixels(4) },
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive();

        loginButton.on('pointerdown', () => {
            const email = this.emailInput.realText;
            const password = this.passwordInput.realText;
            
            if (password === 'モロッコ' || password === 'もろっこ') {
                alert('正解です');
                this.scene.start('Stop');
            } else {
                this.errorMessage.setText('パスワードが間違っています');
            }
        
            this.resetInputFields();
        });

        const bubbleWidth = ru.toPixels(60);
        const bubbleHeight = ru.toPixels(30);
        const bubbleX = this.scale.width - bubbleWidth - ru.toPixels(5);
        const bubbleY = this.scale.height - bubbleHeight - ru.toPixels(30);
    
        const speechBubble = new SpeechBubble(
            this,
            bubbleX,
            bubbleY,
            bubbleWidth,
            bubbleHeight,
            "こんにちは！@これは@吹き出しです。"
        );
    
        this.children.bringToTop(speechBubble);
    }

    createInputField(x, y, defaultText, inputName, isPassword = false) {
        const ru = createRelativeUnits(this);
    
        const field = this.add.rectangle(x, y, ru.toPixels(50), ru.toPixels(10), 0xffffff)
            .setOrigin(0.5)
            .setInteractive();
    
        const text = this.createHighQualityText(x - ru.toPixels(22), y - ru.toPixels(2), isPassword ? '●'.repeat(defaultText.length) : defaultText, {
            fontSize: ru.fontSize.small,
            color: '#000000',
            fontFamily: 'Arial, sans-serif'
        });
    
        const hiddenInput = this.plugins.get('rexhiddeninputtextplugin').add(text, {
            type: 'text',
            enterClose: false,
            onOpen: (textObject) => {
                field.setStrokeStyle(ru.toPixels(0.3), 0x0000ff);
            },
            onClose: (textObject) => {
                field.setStrokeStyle();
            },
            onUpdate: (text, textObject) => {
                this[inputName].realText = text;
                if (isPassword) {
                    this.updatePasswordDisplay();
                }
                return this.getDisplayText(inputName);
            }
        });
    
        this[inputName] = {
            text: text,
            realText: defaultText,
            hiddenInput: hiddenInput,
            isPassword: isPassword,
            isVisible: false
        };
    
        return { field, text };
    }

    getDisplayText(inputName) {
        const input = this[inputName];
        if (input.isPassword && !input.isVisible) {
            return '●'.repeat(input.realText.length);
        }
        return input.realText;
    }

    updatePasswordDisplay() {
        const displayText = this.getDisplayText('passwordInput');
        this.passwordInput.text.setText(displayText);
    }

    togglePasswordVisibility() {
        this.passwordInput.isVisible = !this.passwordInput.isVisible;
        this.updatePasswordDisplay();
    }

    resetInputFields() {
        this.emailInput.realText = this.defaultEmail;
        this.emailInput.text.setText(this.defaultEmail);
        this.emailInput.hiddenInput.resetText(this.defaultEmail);

        this.passwordInput.realText = this.defaultPassword;
        this.passwordInput.isVisible = false;
        this.updatePasswordDisplay();
        this.passwordToggleButton.setText('👁');
    }

    createHighQualityText(x, y, text, style) {
        const highResScale = 3;
        style.fontSize *= highResScale;
        const textObject = this.add.text(x, y, text, style);
        textObject.setScale(1 / highResScale);
        return textObject;
    }
}