export default class SpeechBubble extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, height, text, imageKey = 'kairu') {
        super(scene, x, y);

        this.bubbleElements = [];

        const bubblePadding = 4;
        const scaleFactor = 4;
        const fontSize = 12;
        const lineSpacing = 5;
        const fixedImageSize = 80; // 画像の固定サイズ（ピクセル）
        const triangleHeight = 20; // 三角形の高さ
        const buttonFontSize = 8; // ボタンの文字サイズ
        const buttonPadding = 10; // ボタンの内側の余白
        const buttonSpacing = 50; // ボタン間の間隔

        // 吹き出しの背景
        this.bubble = scene.add.graphics({ x: 0, y: 0 });
        this.bubble.fillStyle(0xFFFFA0, 1);  // 黄色
        this.bubble.fillRoundedRect(0, 0, width, height + bubblePadding * 2, 16);

        // 吹き出しの尖った部分（右寄りに調整）
        const triangleX = width * 0.75; // 右側に配置（幅の75%の位置）
        this.bubble.fillTriangle(triangleX - 10, height + bubblePadding * 2, triangleX, height + bubblePadding * 2 + triangleHeight, triangleX + 10, height + bubblePadding * 2);

        // グラフィックスを先に追加
        this.add(this.bubble);
        this.bubbleElements.push(this.bubble);

        // テキストを@で分割
        const lines = text.split('@');

        // テキストオブジェクトの配列
        this.textObjects = [];

        // 各行のテキストを作成
        lines.forEach((line, index) => {
            const textObject = scene.add.text(0, 0, line, {
                fontSize: fontSize * scaleFactor + 'px',
                color: '#000000',
                align: 'center'
            });
            textObject.setOrigin(0.5);
            textObject.setScale(1 / scaleFactor);
            
            // Y座標を計算（中央から上下に広がるように）
            const yOffset = (index - (lines.length - 1) / 2) * (fontSize + lineSpacing);
            textObject.setPosition(width / 2, height / 2 + yOffset + bubblePadding - 20); // ボタンのスペースを確保するために少し上に移動

            this.textObjects.push(textObject);
            this.add(textObject);
            this.bubbleElements.push(textObject);
        });

        // ボタンを作成
        const createButton = (x, y, text) => {
            const buttonText = scene.add.text(0, 0, text, {
                fontSize: buttonFontSize * scaleFactor + 'px',
                color: '#000000'
            }).setOrigin(0.5);

            buttonText.setScale(1 / scaleFactor);

            const buttonWidth = (buttonText.width * buttonText.scaleX) + buttonPadding * 2;
            const buttonHeight = (buttonText.height * buttonText.scaleY) + buttonPadding * 2;

            const button = scene.add.graphics();
            button.fillStyle(0xDDDDDD, 1);
            button.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
            
            buttonText.setPosition(x, y);
            
            button.setInteractive(new Phaser.Geom.Rectangle(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
            
            this.add(button);
            this.add(buttonText);
            this.bubbleElements.push(button, buttonText);
            
            return { button, buttonText };
        };

        // ボタンのY座標
        const buttonY = height - buttonFontSize - buttonPadding * 2 + 10;

        // 「いいえ」ボタン
        const noButton = createButton(width / 2 - buttonSpacing / 2, buttonY, 'いいえ');

        // 「はい」ボタン
        const yesButton = createButton(width / 2 + buttonSpacing / 2, buttonY, 'はい');

        // 「はい」ボタンにクリックイベントを追加
        yesButton.button.on('pointerdown', () => {
            alert('はいが押されました');
        });

        noButton.button.on('pointerdown', () => {
            this.setBubbleVisibility(false);
        });

        // 画像を追加
        this.image = scene.add.image(triangleX + 10, height + bubblePadding * 2 + triangleHeight, imageKey);
        this.image.setOrigin(0.5, 0); // 画像の上端中央を基準点に
        this.image.setDisplaySize(fixedImageSize, fixedImageSize); // 画像サイズを固定
        this.add(this.image);

        // 画像をインタラクティブにし、クリック/タップ可能にする
        this.image.setInteractive();

        // 画像がクリック/タップされたときのイベントリスナーを追加
        this.image.on('pointerdown', this.toggleBubbleVisibility, this);

        // 吹き出しの初期状態を非表示に設定
        this.setBubbleVisibility(false);

        scene.add.existing(this);
    }

    // 吹き出しの表示/非表示を切り替えるメソッド
    toggleBubbleVisibility() {
        this.setBubbleVisibility(!this.bubble.visible);
    }

    // 吹き出しの表示/非表示を設定するメソッド
    setBubbleVisibility(isVisible) {
        this.bubbleElements.forEach(element => {
            element.setVisible(isVisible);
        });
    }
}