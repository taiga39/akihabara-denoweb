'use strict';

import { Scene } from 'phaser';

export class CrossWord extends Scene {
    constructor() {
        super('CrossWord');
    }

    preload() {
        this.load.plugin('rexinputtextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexinputtextplugin.min.js', true);
    }

    create() {
        this.gridSize = 5;
        this.cellSize = this.scale.width / 6;

        this.gridOriginX = (this.scale.width - this.cellSize * this.gridSize) / 2;
        this.gridOriginY = this.scale.height * 0.2;

        // 背景色を設定
        this.cameras.main.setBackgroundColor('#eeeeee');

        this.createGrid();
        this.createInputForm();
    }

    createGrid() {
        const gridContent = [
            ['8', 'さ', '5', 'い', '6'],
            ['あ', 'ん', 'わ', 'か', 'り'],
            ['1', 'と', '7', 'ま', '4'],
            ['ら', 'そ', 'く', 'お', 'ち'],
            ['2', 'じ', '3', 'た', 'わ']
        ];

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cellX = this.gridOriginX + col * this.cellSize;
                const cellY = this.gridOriginY + row * this.cellSize;

                const cellContent = gridContent[row][col];
                const isNumber = !isNaN(cellContent);

                const cellBg = this.add.rectangle(
                    cellX + this.cellSize / 2,
                    cellY + this.cellSize / 2,
                    this.cellSize,
                    this.cellSize,
                    isNumber ? 0x87CEEB : 0xffffff
                ).setStrokeStyle(2, 0x000000);

                this.add.text(
                    cellX + this.cellSize / 2,
                    cellY + this.cellSize / 2,
                    cellContent,
                    { 
                        font: `${this.cellSize / 2.5}px Arial`, 
                        color: isNumber ? '#ffffff' : '#000000'
                    }
                ).setOrigin(0.5);
            }
        }
    }

    createInputForm() {
        const inputY = this.gridOriginY + (this.cellSize * this.gridSize) + this.cellSize;
        const formWidth = this.scale.width * 0.8;

        this.inputText = this.add.rexInputText(this.scale.width / 2, inputY, formWidth - 20, 40, {
            type: 'text',
            text: '',
            placeholder: 'ひらがなで回答してください',
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#ffffff',
            borderColor: '#000000',
            borderThickness: 2
        })
        .setOrigin(0.5)
        .setDepth(1);

        const submitButton = this.add.text(this.scale.width / 2, inputY + 50, '回答する', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(1);

        // ボタンの枠線を追加
        submitButton.setStroke('#000000', 2);

        submitButton.on('pointerdown', () => this.handleSubmit());
    }

    handleSubmit() {
        const userInput = this.inputText.text.trim().toLowerCase();
        const correctAnswers = ['らじおかいかん', 'ラジオ会館', 'らじお会館'];

        if (correctAnswers.includes(userInput)) {
            this.showFeedback('正解です！', 0x00ff00);
        } else {
            this.showFeedback('不正解です。もう一度試してください。', 0xff0000);
        }
    }

    showFeedback(message, color) {
        const feedbackText = this.add.text(this.scale.width / 2, this.scale.height * 0.9, message, {
            fontSize: '24px',
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