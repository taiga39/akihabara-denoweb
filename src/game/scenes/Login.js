import { createRelativeUnits } from '../main';
import SpeechBubble from '../component/SpeechBubble';
import HamburgerMenu from '../component/HamburgerMenu';
import { BaseScene } from '../BaseScene';
import { loadGameState, saveGameState } from '../hooks/gameState';

export class Login extends BaseScene {
    constructor() {
        super('Login');
        this.defaultEmail = 'kairu@kairu.com';
        this.defaultPassword = '🍑(もも)×3=国名';
    }

    preload() {
        this.load.plugin('rexhiddeninputtextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexhiddeninputtextplugin.min.js', true);
        this.load.svg('eye-icon', 'assets/eye.svg');
    }

    createScene() {
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
        this.passwordToggleButton = this.add.image(centerX + ru.toPixels(19), ru.toPixels(82) - ru.toPixels(2), 'eye-icon')
            .setOrigin(0.5)
            .setInteractive()
            .setScale(ru.toPixels(0.03)); // Adjust scale as needed

        this.updatePasswordToggleIcon();

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
                this.startNextScene();
            } else {
                this.errorMessage.setText('パスワードが間違っています');
                this.resetPasswordField();
            }
        });

        const bubbleWidth = ru.toPixels(60);
        const bubbleHeight = ru.toPixels(37);
        const bubbleX = this.scale.width - bubbleWidth - ru.toPixels(5);
        const bubbleY = this.scale.height - bubbleHeight - ru.toPixels(30);
    
        const speechBubble = new SpeechBubble(
            this,
            bubbleX,
            bubbleY,
            bubbleWidth,
            bubbleHeight,
            "こんにちは！これは吹き出しですaaaaaaaaaaaaaaaaaaaaafasdfasdfasfasdfasfasaaaaaaaa。sdasdfasdfasasdfasfasfasfasfasfss"
        );
    
        this.children.bringToTop(speechBubble);

        new HamburgerMenu(this);
    }

    createInputField(x, y, defaultText, inputName, isPassword = false) {
        const ru = createRelativeUnits(this);
    
        const field = this.add.rectangle(x, y, ru.toPixels(50), ru.toPixels(10), 0xffffff)
            .setOrigin(0.5)
            .setInteractive();
    
        const displayText = isPassword ? '●'.repeat(defaultText.length) : defaultText;
        const text = this.createHighQualityText(x - ru.toPixels(22), y - ru.toPixels(2), displayText, {
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
            onUpdate: (newText, textObject) => {
                if (!newText.includes('●')) {
                    this[inputName].realText = newText;
                } else if (newText.length < this[inputName].realText.length) {
                    this[inputName].realText = this[inputName].realText.slice(0, newText.length);
                }
    
                if (isPassword && !this[inputName].isVisible) {
                    return '●'.repeat(this[inputName].realText.length);
                } else {
                    return this[inputName].realText;
                }
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

    updatePasswordDisplay() {
        const input = this.passwordInput;
        const displayText = input.isVisible ? input.realText : '●'.repeat(input.realText.length);
        input.text.setText(displayText);
    }

    togglePasswordVisibility() {
        this.passwordInput.isVisible = !this.passwordInput.isVisible;
        this.updatePasswordDisplay();
        this.updatePasswordToggleIcon();
    }

    updatePasswordToggleIcon() {
        if (this.passwordInput.isVisible) {
            this.passwordToggleButton.setAlpha(1); // Fully opaque
        } else {
            this.passwordToggleButton.setAlpha(0.5); // 50% transparent
        }
    }

    resetPasswordField() {
        this.passwordInput.realText = this.defaultPassword;
        this.passwordInput.isVisible = false;
        this.updatePasswordDisplay();
        this.passwordInput.hiddenInput.resetText('●'.repeat(this.defaultPassword.length));
        this.updatePasswordToggleIcon();
    }

    resetInputFields() {
        this.emailInput.realText = this.defaultEmail;
        this.emailInput.text.setText(this.defaultEmail);
        this.emailInput.hiddenInput.resetText(this.defaultEmail);

        this.resetPasswordField();
    }

    createHighQualityText(x, y, text, style) {
        const highResScale = 3;
        style.fontSize *= highResScale;
        const textObject = this.add.text(x, y, text, style);
        textObject.setScale(1 / highResScale);
        return textObject;
    }

    startNextScene() {
        const gameState = loadGameState();
        gameState.current_scene = 'Stop';
        if (!gameState.answer_scene.includes('Login')) {
            gameState.answer_scene.push('Login');
        }
        saveGameState(gameState);
        this.scene.start('Stop');
    }
}