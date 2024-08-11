'use strict';

import { Scene } from 'phaser';

export class CrossWord extends Scene {
    constructor() {
        super('CrossWord');
    }

    create() {
        this.gridSize = 4;
        this.cellSize = this.scale.width / 5;
        this.cells = [];
        this.activeCell = null;

        this.gridOriginX = (this.scale.width - this.cellSize * this.gridSize) / 2;
        this.gridOriginY = this.scale.height * 0.2;

        this.blackCells = [
            { row: 0, col: 2 },
            { row: 1, col: 0 },
            { row: 2, col: 2 }
        ];

        this.createGrid();
        this.createInputElement();
        this.setupKeyboardInput();
        this.createSubmitButton();
        this.createWordList();
    }

    createGrid() {
        this.cameras.main.setBackgroundColor('#ffffff');

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cellX = this.gridOriginX + col * this.cellSize;
                const cellY = this.gridOriginY + row * this.cellSize;

                const isBlackCell = this.blackCells.some(cell => cell.row === row && cell.col === col);

                const cellBg = this.add.rectangle(
                    cellX + this.cellSize / 2,
                    cellY + this.cellSize / 2,
                    this.cellSize,
                    this.cellSize,
                    isBlackCell ? 0x000000 : 0xffffff
                ).setStrokeStyle(2, 0x000000);

                const cellText = this.add.text(
                    cellX + this.cellSize / 2,
                    cellY + this.cellSize / 2,
                    '',
                    { 
                        font: `${this.cellSize / 2}px Arial`, 
                        color: isBlackCell ? '#ffffff' : '#000000'
                    }
                ).setOrigin(0.5);

                const inputZone = this.add.zone(cellX, cellY, this.cellSize, this.cellSize)
                    .setOrigin(0)
                    .setInteractive();

                inputZone.on('pointerdown', () => this.focusCell({ row, col, background: cellBg, text: cellText, isBlack: isBlackCell }));

                this.cells.push({ row, col, background: cellBg, text: cellText, inputZone, isBlack: isBlackCell });
            }
        }
    }

    createInputElement() {
        this.inputElement = document.createElement('input');
        this.inputElement.style.position = 'absolute';
        this.inputElement.style.left = '-1000px';  // 画面外に配置
        this.inputElement.style.top = '0px';
        this.inputElement.style.opacity = '0';
        this.inputElement.style.fontSize = '16px';  // iOSで自動ズームを防ぐ
        document.body.appendChild(this.inputElement);
    }

    setupKeyboardInput() {
        this.input.keyboard.on('keydown', this.handleKeyInput, this);
        this.inputElement.addEventListener('input', this.handleMobileInput.bind(this));
        this.inputElement.addEventListener('blur', () => {
            setTimeout(() => this.inputElement.focus(), 0);
        });
    }

    handleKeyInput(event) {
        if (this.activeCell) {
            if (event.key.length === 1) {
                this.activeCell.text.setText(event.key);
                this.focusNextCell();
            } else if (event.key === 'Backspace') {
                this.handleBackspace();
            }
        }
    }

    handleMobileInput(event) {
        if (this.activeCell) {
            const inputValue = event.target.value;
            if (inputValue.length > 0) {
                this.activeCell.text.setText(inputValue.slice(-1));
                this.inputElement.value = '';  // 入力をクリア
                this.focusNextCell();
            }
        }
    }

    handleBackspace() {
        const currentText = this.activeCell.text.text;
        if (currentText === '') {
            this.focusPreviousCell();
        } else {
            this.activeCell.text.setText('');
        }
    }

    focusCell(cell) {
        if (this.activeCell) {
            this.activeCell.background.setFillStyle(this.activeCell.isBlack ? 0x000000 : 0xffffff);
        }
        this.activeCell = cell;
        if (!cell.isBlack) {
            cell.background.setFillStyle(0xffff99);
        } else {
            cell.background.setFillStyle(0x333333);
        }
        this.inputElement.focus();  // モバイルキーボードを表示
    }

    focusNextCell() {
        if (this.activeCell) {
            const currentIndex = this.cells.indexOf(this.activeCell);
            const nextIndex = (currentIndex + 1) % this.cells.length;
            this.focusCell(this.cells[nextIndex]);
        }
    }

    focusPreviousCell() {
        if (this.activeCell) {
            const currentIndex = this.cells.indexOf(this.activeCell);
            const prevIndex = (currentIndex - 1 + this.cells.length) % this.cells.length;
            this.focusCell(this.cells[prevIndex]);
        }
    }

    createSubmitButton() {
        const buttonWidth = this.cellSize * 2;
        const buttonHeight = this.cellSize / 2;
        const buttonX = this.gridOriginX + (this.cellSize * this.gridSize) / 2 - buttonWidth / 2;
        const buttonY = this.gridOriginY + (this.cellSize * this.gridSize) + this.cellSize / 2;

        const button = this.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x0000ff)
            .setOrigin(0)
            .setInteractive();

        const buttonText = this.add.text(buttonX + buttonWidth / 2, buttonY + buttonHeight / 2, '提出', 
            { font: '20px Arial', fill: '#ffffff' })
            .setOrigin(0.5);

        button.on('pointerdown', this.handleSubmit, this);
    }

    createWordList() {
        const words = ['さお', 'おしろい', 'だいこん', 'しかく', 'さくそん'];
        const startY = this.gridOriginY + (this.cellSize * this.gridSize) + this.cellSize * 1.5;
        const lineHeight = 25; // 行の高さを固定値で設定

        words.forEach((word, index) => {
            this.add.text(this.gridOriginX, startY + index * lineHeight, word, 
                { font: '20px Arial', fill: '#000000' });
        });
    }

    handleSubmit() {
        if (this.validateSubmission()) {
            alert('OKKKKKK');
        } else {
            alert('booooooooooooooo');
        }
    }

    validateSubmission() {
        return this.cells.every(cell => {
            const cellText = cell.text.text;
            return cellText === 'も' || cellText === 'じ';
        });
    }
}