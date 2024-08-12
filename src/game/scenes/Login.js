import { Scene } from 'phaser';
import { createRelativeUnits } from '../main';

export class Login extends Scene {
    constructor() {
        super('Login');
        this.defaultEmail = 'kairu@kairu.com';
        this.defaultPassword = 'ももももももなばしょ';
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

        // エラーメッセージ用のテキストオブジェクトを作成
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
            console.log('Email:', this.emailInput.text);
            console.log('Password:', this.passwordInput.realText);
            
            // パスワードチェック（ここでは単純な例として）
            if (this.passwordInput.realText !== this.defaultPassword) {
                this.errorMessage.setText('パスワードが間違っています');
            } else {
                this.errorMessage.setText(''); // エラーメッセージをクリア
            }

            // 初期文言をリセット
            this.resetInputFields();
        });

        this.input.keyboard.on('keydown', this.handleKeyDown, this);
    }

    resetInputFields() {
        this.emailInput.realText = this.defaultEmail;
        this.emailInput.text.setText(this.defaultEmail);

        this.passwordInput.realText = this.defaultPassword;
        this.passwordInput.isHidden = true; // パスワードを非表示状態に戻す
        this.updatePasswordDisplay('passwordInput');

        // パスワード表示/非表示トグルボタンのアイコンをリセット
        if (this.passwordInput.toggleButton) {
            this.passwordInput.toggleButton.setText('👁');
        }
    }

    createHighQualityText(x, y, text, style) {
        const highResScale = 3;
        style.fontSize *= highResScale;
        const textObject = this.add.text(x, y, text, style);
        textObject.setScale(1 / highResScale);
        return textObject;
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

        this[inputName] = {
            text: text,
            realText: defaultText,
            isPassword: isPassword,
            isHidden: isPassword
        };

        field.on('pointerdown', () => {
            this.focusedInput = inputName;
            field.setStrokeStyle(ru.toPixels(0.3), 0x0000ff);
        });

        if (isPassword) {
            const toggleButton = this.createHighQualityText(x + ru.toPixels(19), y - ru.toPixels(2), '👁', {
                fontSize: ru.fontSize.small,
                fontFamily: 'Arial, sans-serif',
                color: '#000000'
            }).setInteractive();

            this[inputName].toggleButton = toggleButton; // トグルボタンへの参照を保存

            toggleButton.on('pointerdown', () => {
                this[inputName].isHidden = !this[inputName].isHidden;
                this.updatePasswordDisplay(inputName);
            });
        }

        return { field, text };
    }

    handleKeyDown(event) {
        if (!this.focusedInput) return;

        const input = this[this.focusedInput];
        if (event.keyCode === 8) {
            input.realText = input.realText.slice(0, -1);
        } else if (event.keyCode >= 32 && event.keyCode <= 126) {
            input.realText += event.key;
        }
        this.updatePasswordDisplay(this.focusedInput);
    }

    updatePasswordDisplay(inputName) {
        const input = this[inputName];
        if (input.isPassword) {
            input.text.setText(input.isHidden ? '●'.repeat(input.realText.length) : input.realText);
        } else {
            input.text.setText(input.realText);
        }
    }
}