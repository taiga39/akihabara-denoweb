export default class SpeechBubble extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, height, text) {
        super(scene, x, y);

        const bubblePadding = 4;
        const scaleFactor = 4;
        const fontSize = 12;
        const lineSpacing = 5;

        // 吹き出しの背景
        this.bubble = scene.add.graphics({ x: 0, y: 0 });
        this.bubble.fillStyle(0xFFFFA0, 1);  // 黄色
        this.bubble.fillRoundedRect(0, 0, width, height + bubblePadding * 2, 16);

        // 吹き出しの尖った部分
        this.bubble.fillTriangle(width / 2 - 10, height + bubblePadding * 2, width / 2, height + bubblePadding * 2 + 20, width / 2 + 10, height + bubblePadding * 2);

        // グラフィックスを先に追加
        this.add(this.bubble);

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
            textObject.setPosition(width / 2, height / 2 + yOffset + bubblePadding);

            this.textObjects.push(textObject);
            this.add(textObject);
        });

        scene.add.existing(this);
    }
}