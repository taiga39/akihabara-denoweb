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
    }

    preload() {
        this.load.plugin('rexpinchplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexpinchplugin.min.js', true);
    }

    create() {
        this.cameras.main.setBackgroundColor('#ffffff');
    
        // 白いオーバーレイを作成
        const overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xffffff)
            .setOrigin(0)
            .setDepth(1000); // 最前面に表示
    
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
            
            // ズーム時にカメラの中心を維持
            const zoomChange = camera.zoom / oldZoom;
            camera.scrollX = (camera.scrollX + camera.width * 0.5) * zoomChange - camera.width * 0.5;
            camera.scrollY = (camera.scrollY + camera.height * 0.5) * zoomChange - camera.height * 0.5;
            
            this.limitCameraScroll(camera);
        });
    
        this.input.on('gameobjectdown', this.handleCellClick, this);
    
        // 短い遅延の後、オーバーレイを削除
        this.time.delayedCall(100, () => {
            overlay.destroy();
        });

        const speechBubble = new SpeechBubble(this, 120, 250, 200, 100, "helloHEyheyhey@こんにちは！@これは吹き出しです。");
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

    showAllColumns(camera) {
        camera.zoom = this.minZoom;
        camera.centerOn(this.worldWidth / 2, this.worldHeight / 2);
    }

    setInitialZoom(camera) {
        camera.zoom = this.maxZoom;
        camera.centerOn(this.worldWidth / 2, this.worldHeight / 2);
    }

    createGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x000000, 0.4);

        const startY = this.verticalPadding;

        for (let row = 0; row < this.rowCount; row++) {
            for (let col = 0; col < this.columnCount; col++) {
                const x = col * this.cellSize;
                const y = startY + row * this.cellSize;
                this.createCell(x, y, this.cellSize);

                // グリッド線を描画
                graphics.strokeRect(x, y, this.cellSize, this.cellSize);
            }
        }
    }

    createCell(x, y, size) {
        const cell = this.add.rectangle(x, y, size, size, 0xffffff)
            .setOrigin(0)
            .setInteractive();

        const shape = this.createRandomShape(x + size / 2, y + size / 2, size * 0.4);
        const checkbox = this.createCheckbox(x + 5, y + 5, false); // チェックボックスの位置を調整

        this.cells.push({ cell, checkbox, shape });
    }

    createRandomShape(x, y, size) {
        const graphics = this.add.graphics();
        const shapeType = Phaser.Math.Between(0, 2);
        const color = Phaser.Display.Color.RandomRGB().color;

        graphics.fillStyle(color);

        switch (shapeType) {
            case 0: // 三角形
                graphics.fillTriangle(x, y - size / 2, x - size / 2, y + size / 2, x + size / 2, y + size / 2);
                break;
            case 1: // 円
                graphics.fillCircle(x, y, size / 2);
                break;
            case 2: // 四角形
                graphics.fillRect(x - size / 2, y - size / 2, size, size);
                break;
        }

        return graphics;
    }

    createCheckbox(x, y, checked) {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x000000); // 線の太さを1に変更
        graphics.strokeRect(x, y, this.checkboxSize, this.checkboxSize);

        if (checked) {
            this.drawCheck(graphics, x, y);
        }

        return graphics;
    }

    drawCheck(graphics, x, y) {
        graphics.lineStyle(1, 0x000000); // 線の太さを1に変更
        graphics.beginPath();
        graphics.moveTo(x + 3, y + this.checkboxSize / 2);
        graphics.lineTo(x + this.checkboxSize / 3, y + this.checkboxSize - 3);
        graphics.lineTo(x + this.checkboxSize - 3, y + 3);
        graphics.strokePath();
    }

    handleCellClick(pointer, gameObject) {
        const cellData = this.cells.find(cell => cell.cell === gameObject);
        if (cellData) {
            const { checkbox } = cellData;
            const checked = !checkbox.data || !checkbox.data.get('checked');
            
            checkbox.clear();
            checkbox.lineStyle(1, 0x000000); // 線の太さを1に変更
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

    limitCameraScroll(camera) {
        const zoom = camera.zoom;
        const leftBound = (this.worldWidth - this.scale.width / zoom) / 2;
        const rightBound = -leftBound;
        const topBound = (this.worldHeight - this.scale.height / zoom) / 2;
        const bottomBound = -topBound;

        camera.scrollX = Phaser.Math.Clamp(camera.scrollX, leftBound, rightBound);
        camera.scrollY = Phaser.Math.Clamp(camera.scrollY, topBound, bottomBound);
    }
}