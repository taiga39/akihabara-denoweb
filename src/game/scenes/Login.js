import { Scene } from 'phaser';

export class Login extends Scene {
    constructor() {
        super('Login');
    }

    create() {
        this.cameras.main.setBackgroundColor('#ffffff');

        this.add.text(this.scale.width / 2, 50, 'ログイン', {
            fontSize: '32px',
            color: '#000000'
        }).setOrigin(0.5);

        const loginButton = this.add.text(this.scale.width / 2, 100, 'ログイン', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        loginButton.on('pointerdown', () => {
            console.log('Email:', this.emailInput.text);
            console.log('Password:', this.passwordInput.realText);
        });

        this.add.text(this.scale.width / 2, 180, 'Email:', {
            fontSize: '18px',
            color: '#000000'
        }).setOrigin(0.5);

        this.createInputField(this.scale.width / 2, 220, 'email@example.com', 'emailInput');

        this.add.text(this.scale.width / 2, 260, 'Password:', {
            fontSize: '18px',
            color: '#000000'
        }).setOrigin(0.5);

        this.createInputField(this.scale.width / 2, 300, 'password', 'passwordInput', true);

        this.input.keyboard.on('keydown', this.handleKeyDown, this);
    }

    createInputField(x, y, defaultText, inputName, isPassword = false) {
        const field = this.add.rectangle(x, y, 200, 30, 0xcccccc)
            .setOrigin(0.5)
            .setInteractive();

        const text = this.add.text(x - 95, y - 10, isPassword ? '●'.repeat(defaultText.length) : defaultText, {
            fontSize: '16px',
            color: '#000000'
        });

        this[inputName] = {
            text: text,
            realText: defaultText,
            isPassword: isPassword,
            isHidden: isPassword
        };

        field.on('pointerdown', () => {
            this.focusedInput = inputName;
            field.setStrokeStyle(2, 0x0000ff);
        });

        if (isPassword) {
            const toggleButton = this.add.text(x + 85, y - 10, '👁', {
                fontSize: '16px'
            }).setInteractive();

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
        if (event.keyCode === 8) {  // Backspace
            input.realText = input.realText.slice(0, -1);
        } else if (event.keyCode >= 32 && event.keyCode <= 126) {  // Printable characters
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