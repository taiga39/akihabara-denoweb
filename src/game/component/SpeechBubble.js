import { createRelativeUnits } from '../main';

export default class SpeechBubble extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, height, text, imageKey = 'kairu') {
        super(scene, x, y);

        const ru = createRelativeUnits(scene);
        this.bubbleElements = [];

        const bubblePadding = ru.toPixels(2);
        const topPadding = ru.toPixels(4);
        const fontSize = ru.fontSize.small;
        const fixedImageSize = ru.toPixels(30);
        const triangleHeight = ru.toPixels(5);
        const buttonFontSize = ru.fontSize.small;
        const buttonPadding = ru.toPixels(3);

        // 吹き出しの背景
        this.bubble = scene.add.graphics({ x: 0, y: 0 });
        this.bubble.fillStyle(0xFFFFA0, 1);
        this.bubble.fillRoundedRect(0, 0, width, height, ru.toPixels(4));

        // 吹き出しの尖った部分（右寄りに調整）
        const triangleX = width * 0.75;
        this.bubble.fillTriangle(
            triangleX - ru.toPixels(2), height,
            triangleX, height + triangleHeight,
            triangleX + ru.toPixels(2), height
        );

        this.add(this.bubble);
        this.bubbleElements.push(this.bubble);

        // テキストエリアの作成
        const textAreaHeight = height - buttonFontSize - buttonPadding * 4 - topPadding;
        const textAreaWidth = width - bubblePadding * 2;
        
        const textObject = scene.add.text(bubblePadding, topPadding, '', {
            fontSize: fontSize,
            color: '#000000',
            wordWrap: { 
                width: textAreaWidth,
                useAdvancedWrap: true
            },
            align: 'center'
        });

        // テキストを明示的に設定し、折り返しを強制
        textObject.setText(text);

        // デバッグ情報
        console.log('Text area width:', textAreaWidth);
        console.log('Text object width:', textObject.width);
        console.log('Word wrap width:', textObject.style.wordWrapWidth);

        this.add(textObject);
        this.bubbleElements.push(textObject);

        // ボタンを作成
        const createButton = (x, y, text) => {
            const buttonText = scene.add.text(x, y, text, {
                fontSize: buttonFontSize,
                color: '#000000'
            }).setOrigin(0.5);

            const buttonWidth = Math.max(buttonText.width + buttonPadding * 2, ru.toPixels(15));
            const buttonHeight = buttonText.height + buttonPadding * 2;

            const button = scene.add.graphics();
            button.fillStyle(0xDDDDDD, 1);
            button.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, ru.toPixels(2));
            
            button.setInteractive(new Phaser.Geom.Rectangle(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
            
            this.add(button);
            this.add(buttonText);
            this.bubbleElements.push(button, buttonText);
            
            return { button, buttonText, width: buttonWidth };
        };

        // ボタンのY座標
        const buttonY = height - buttonFontSize - buttonPadding * 2;

        // 「いいえ」ボタン
        const noButton = createButton(width / 4, buttonY * 1.2, 'いいえ');

        // 「はい」ボタン
        const yesButton = createButton(width * 3 / 4, buttonY * 1.2, 'はい');

        // ボタンのイベント
        yesButton.button.on('pointerdown', () => {
            alert('はいが押されました');
        });

        noButton.button.on('pointerdown', () => {
            this.setBubbleVisibility(false);
        });

        // 画像を追加
        this.image = scene.add.image(triangleX, height * 0.9 + triangleHeight, imageKey);
        this.image.setOrigin(0.5, 0);
        this.image.setDisplaySize(fixedImageSize, fixedImageSize);
        this.add(this.image);

        this.image.setInteractive();
        this.image.on('pointerdown', this.toggleBubbleVisibility, this);

        // 吹き出しの初期状態を表示に設定
        this.setBubbleVisibility(true);

        scene.add.existing(this);
        console.log('SpeechBubble elements:', this.list.length);
    }

    toggleBubbleVisibility() {
        this.setBubbleVisibility(!this.bubble.visible);
    }

    setBubbleVisibility(isVisible) {
        this.bubbleElements.forEach(element => {
            element.setVisible(isVisible);
        });
    }
}