'use strict';

import { Scene } from 'phaser';
import SpeechBubble from '../component/SpeechBubble';

export class Pinch extends Scene {
    constructor() {
        super('Pinch');
        this.cells = [];
        this.columnCount = 5;
        this.rowCount = 3;
        this.verticalPadding = 100;
        this.checkboxSize = 15;
        this.imageLayout = [
            3, 2, 4, 5, 7,  // 1行目に3と7を配置
            11, 1, 2, 4, 5,
            6, 8, 9, 10, 11
        ];
        this.isFullView = false;
        this.correctChecks = [1, 9, 10, 3, 7];
    }

    preload() {
        this.load.plugin('rexpinchplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexpinchplugin.min.js', true);
        
        // 画像の読み込み
        for (let i = 1; i <= 11; i++) {
            this.load.image(`rajio${i}`, `assets/rajio (${i}).png`);
        }
    }

    create() {
        this.cameras.main.setBackgroundColor('#ffffff');
    
        // 白いオーバーレイを作成
        const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xffffff)
            .setOrigin(0)
            .setDepth(1000);
    
        this.calculateSizes();
        this.createGrid();
    
        const dragScale = this.plugins.get('rexpinchplugin').add(this);
        const camera = this.cameras.main;
    
        // 3列表示に設定
        this.setInitialZoom(camera);
    
        dragScale.on('pinch', (dragScale) => {
            const scaleFactor = dragScale.scaleFactor;
            const oldZoom = camera.zoom;
            camera.zoom *= scaleFactor;
            camera.zoom = Phaser.Math.Clamp(camera.zoom, this.minZoom, this.maxZoom);
            
            const zoomChange = camera.zoom / oldZoom;
            camera.scrollX = (camera.scrollX + camera.width * 0.5) * zoomChange - camera.width * 0.5;
            camera.scrollY = (camera.scrollY + camera.height * 0.5) * zoomChange - camera.height * 0.5;
            
            this.limitCameraScroll(camera);
        });
    
        this.input.on('gameobjectdown', this.handleCellClick, this);
    
        this.time.delayedCall(100, () => {
            overlay.destroy();
        });

        this.createDebugToggleButton();
        this.createConfirmButton();
        // const speechBubble = new SpeechBubble(this, 120, 250, 200, 100, "helloHEyheyhey@こんにちは！@これは吹き出しです。");
    }

    calculateSizes() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        this.cellSize = Math.min(screenWidth / 5, (screenHeight - 2 * this.verticalPadding) / this.rowCount);
        this.worldWidth = this.cellSize * this.columnCount;
        this.worldHeight = this.cellSize * this.rowCount + 2 * this.verticalPadding;
        this.minZoom = 1;
        this.maxZoom = screenWidth / (this.cellSize * 3);
    }

    setInitialZoom(camera) {
        camera.zoom = this.maxZoom;
        camera.centerOn(this.worldWidth / 2, this.worldHeight / 2);
    }

    createGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x000000, 0.4);

        const startY = this.verticalPadding;
        let cellIndex = 0;

        for (let row = 0; row < this.rowCount; row++) {
            for (let col = 0; col < this.columnCount; col++) {
                const x = col * this.cellSize;
                const y = startY + row * this.cellSize;
                this.createCell(x, y, this.cellSize, this.imageLayout[cellIndex]);
                cellIndex++;

                graphics.strokeRect(x, y, this.cellSize, this.cellSize);
            }
        }
    }

    createCell(x, y, size, imageNumber) {
        const cell = this.add.rectangle(x, y, size, size, 0xffffff)
            .setOrigin(0)
            .setInteractive();

        const image = this.add.image(x + size / 2, y + size / 2, `rajio${imageNumber}`)
            .setDisplaySize(size * 0.8, size * 0.8);

        const checkbox = this.createCheckbox(x + 5, y + 5, false);

        this.cells.push({ cell, checkbox, image, imageNumber });
    }

    createCheckbox(x, y, checked) {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x000000);
        graphics.strokeRect(x, y, this.checkboxSize, this.checkboxSize);

        if (checked) {
            this.drawCheck(graphics, x, y);
        }

        return graphics;
    }

    handleCellClick(pointer, gameObject) {
        const cellData = this.cells.find(cell => cell.cell === gameObject);
        if (cellData) {
            const { checkbox } = cellData;
            const checked = !checkbox.data || !checkbox.data.get('checked');
            
            checkbox.clear();
            checkbox.lineStyle(1, 0x000000);
            checkbox.strokeRect(cellData.cell.x + 5, cellData.cell.y + 5, this.checkboxSize, this.checkboxSize);
            
            if (checked) {
                this.drawCheck(checkbox, cellData.cell.x + 5, cellData.cell.y + 5);
            }
            
            if (!checkbox.data) {
                checkbox.setDataEnabled();
            }
            checkbox.data.set('checked', checked);
        }
    }

    createConfirmButton() {
        const button = this.add.text(200, 480, '確認', {
            font: '20px Arial',
            fill: '#ffffff',  // 文字色を白に変更
            backgroundColor: '#0000ff',  // 背景色を青に変更
            padding: { x: 10, y: 5 }
        })
        .setInteractive()
        .on('pointerdown', () => this.checkAnswers());

        button.setScrollFactor(0);  // カメラに追従しないように設定
    }

    checkAnswers() {
        const checkedCells = this.cells.filter(cell => cell.checkbox.data && cell.checkbox.data.get('checked'));
        const checkedNumbers = checkedCells.map(cell => cell.imageNumber);

        const isCorrect = this.correctChecks.every(num => checkedNumbers.includes(num)) &&
                          checkedNumbers.length === this.correctChecks.length;

        if (isCorrect) {
            alert('OK');
        } else {
            this.resetCheckboxes();
        }
    }

    resetCheckboxes() {
        this.cells.forEach(cellData => {
            const { checkbox } = cellData;
            checkbox.clear();
            checkbox.lineStyle(1, 0x000000);
            checkbox.strokeRect(cellData.cell.x + 5, cellData.cell.y + 5, this.checkboxSize, this.checkboxSize);
            
            if (checkbox.data) {
                checkbox.data.set('checked', false);
            }
        });
    }

    drawCheck(graphics, x, y) {
        graphics.lineStyle(1, 0x000000);
        graphics.beginPath();
        graphics.moveTo(x + 3, y + this.checkboxSize / 2);
        graphics.lineTo(x + this.checkboxSize / 3, y + this.checkboxSize - 3);
        graphics.lineTo(x + this.checkboxSize - 3, y + 3);
        graphics.strokePath();
    }

    limitCameraScroll(camera) {
        const zoom = camera.zoom;
        const leftBound = (this.worldWidth - this.scale.width / zoom) / 2;
        const rightBound = -leftBound;
        const topBound = (this.worldHeight - this.scale.height / zoom) / 2;
        const bottomBound = -topBound;

        camera.scrollX = Phaser.Math.Clamp(camera.scrollX, leftBound, rightBound);
        camera.scrollY = Phaser.Math.Clamp(camera.scrollY, topBound, bottomBound);
    }

    createDebugToggleButton() {
        const button = this.add.text(200, 150, 'Toggle View', {
            font: '16px Arial',
            fill: '#000000',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        })
        .setInteractive()
        .on('pointerdown', () => this.toggleView());

        button.setScrollFactor(0);  // カメラに追従しないように設定
    }

    toggleView() {
        this.isFullView = !this.isFullView;
        const camera = this.cameras.main;

        if (this.isFullView) {
            // 全体表示
            camera.zoom = this.minZoom;
        } else {
            // 初期表示（3列表示）
            camera.zoom = this.maxZoom;
        }

        camera.centerOn(this.worldWidth / 2, this.worldHeight / 2);
        this.limitCameraScroll(camera);
    }
}