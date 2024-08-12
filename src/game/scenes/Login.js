import { Scene } from 'phaser';
import { createRelativeUnits } from '../main';

export class Login extends Scene {
    constructor() {
        super('Login');
        this.defaultEmail = 'kairu@kairu.com';
        this.defaultPassword = 'ももももももなばしょ';
    }

    preload() {
        // rexhiddeninputtextplugin を読み込む
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
            // realTextに保存された内容を取得
            const email = this.emailInput.realText;
            const password = this.passwordInput.realText;
            
            // パスワードチェック
            if (password === 'モロッコ' || password === 'もろっこ') {
                alert('正解です');
            } else {
                this.errorMessage.setText('パスワードが間違っています');
            }
        
            // 初期文言をリセット
            this.resetInputFields();
        });
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
    
        // rexhiddeninputtextpluginを使用して入力フィールドを作成
        const hiddenInput = this.plugins.get('rexhiddeninputtextplugin').add(text, {
            type: 'text',
            enterClose: false,
            onOpen: (textObject) => {
                field.setStrokeStyle(ru.toPixels(0.3), 0x0000ff);
            },
            onClose: (textObject) => {
                field.setStrokeStyle(); // ストロークをクリア
            },
            onUpdate: (text, textObject, hiddenInputText) => {
                // 入力されたテキストをリアルタイムでrealTextに保存
                this[inputName].realText = text;
                return text; // これによりテキストがPhaserのテキストオブジェクトに反映される
            }
        });
    
        // 入力フィールドの状態を保存
        this[inputName] = {
            text: text,
            realText: defaultText,
            hiddenInput: hiddenInput, // hiddenInputへの参照を保存
            isPassword: isPassword,
            isHidden: isPassword
        };
    
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

    updatePasswordDisplay(inputName) {
        const input = this[inputName];
        if (input.isPassword) {
            input.text.setText(input.isHidden ? '●'.repeat(input.realText.length) : input.realText);
        } else {
            input.text.setText(input.realText);
        }
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
}
