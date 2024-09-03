import { BaseScene } from '../BaseScene';

export class Math extends BaseScene {
    constructor() {
        super('Math');
    }

    createScene() {
        // 背景色を設定
        this.cameras.main.setBackgroundColor('#eeeeee');

        this.createPuzzle();
        this.createInstructions();
    }

    createPuzzle() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        const spacing = 80;

        // 上段のシンボル
        this.createSymbol(centerX - spacing, centerY - spacing / 2, '+', 50);
        this.createSymbol(centerX, centerY - spacing / 2, 'ー', 50);
        this.createSymbol(centerX + spacing, centerY - spacing / 2, '=', 50);

        // 下段の文字
        this.createSymbol(centerX - spacing, centerY + spacing / 2, 'た');
        this.createSymbol(centerX, centerY + spacing / 2, 'ひ');

        // インタラクティブな "?"
        const questionMark = this.createSymbol(centerX + spacing, centerY + spacing / 2, '?');
        questionMark.setInteractive();
        questionMark.on('pointerdown', () => this.handleQuestionMarkClick());
    }

    createSymbol(x, y, symbol, fontsize = 40) {
        return this.add.text(x, y, symbol, {
            fontSize: `${fontsize}px`,
            fontFamily: 'Arial',
            color: '#000000'
        }).setOrigin(0.5);
    }

    createInstructions() {
        const instructions = this.add.text(this.scale.width / 2, this.scale.height - 100, '？を押してください', {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#000000'
        }).setOrigin(0.5);
    }

    handleQuestionMarkClick() {
        this.showFeedback('正解です！答えは「こ」です。', 0x00ff00);
    }

    showFeedback(message, color) {
        const feedbackText = this.add.text(this.scale.width / 2, this.scale.height / 3, message, {
            fontSize: '40px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: color,
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setDepth(2);

        this.time.delayedCall(3000, () => {
            feedbackText.destroy();
        });
    }
}