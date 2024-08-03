'use strict';

import { Scene } from 'phaser';

export class Pinch extends Scene {
    constructor() {
        super('Pinch');
        this.cells = [];
        this.columnCount = 5;
        this.rowCount = 5;
    }

    preload() {
        this.load.plugin('rexpinchplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexpinchplugin.min.js', true);
    }

    create() {
        this.cameras.main.setBackgroundColor('#ffffff');

        // セルサイズと世界サイズを計算
        this.calculateSizes();

        this.createGrid();

        const dragScale = this.plugins.get('rexpinchplugin').add(this);
        const camera = this.cameras.main;

        // 初期ズームを3列表示に設定
        this.setInitialZoom(camera);

        dragScale.on('drag1', (dragScale) => {
            const drag1Vector = dragScale.drag1Vector;
            camera.scrollX -= drag1Vector.x / camera.zoom;
            camera.scrollY -= drag1Vector.y / camera.zoom;
            this.limitCameraScroll(camera);
        });

        dragScale.on('pinch', (dragScale) => {
            const scaleFactor = dragScale.scaleFactor;
            camera.zoom *= scaleFactor;
            camera.zoom = Phaser.Math.Clamp(camera.zoom, this.minZoom, this.maxZoom);
            this.limitCameraScroll(camera);
        });

        this.input.on('gameobjectdown', this.handleCellClick, this);
    }

    calculateSizes() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        this.cellSize = Math.min(screenWidth / 3, screenHeight / this.rowCount);
        this.worldWidth = this.cellSize * this.columnCount;
        this.worldHeight = this.cellSize * this.rowCount;
        this.minZoom = screenWidth / this.worldWidth;
        this.maxZoom = (screenWidth / this.worldWidth) * (5 / 3);
    }

    setInitialZoom(camera) {
        camera.zoom = this.maxZoom;
        camera.centerOn(this.worldWidth / 2, this.worldHeight / 2);
    }

    createGrid() {
        for (let row = 0; row < this.rowCount; row++) {
            for (let col = 0; col < this.columnCount; col++) {
                const x = col * this.cellSize;
                const y = row * this.cellSize;
                this.createCell(x, y, this.cellSize);
            }
        }

        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x000000, 0.4);
        for (let i = 0; i <= this.columnCount; i++) {
            const position = i * this.cellSize;
            graphics.moveTo(0, position);
            graphics.lineTo(this.worldWidth, position);
            graphics.moveTo(position, 0);
            graphics.lineTo(position, this.worldHeight);
        }
        graphics.strokePath();
    }

    createCell(x, y, size) {
        const cell = this.add.rectangle(x, y, size, size, 0xffffff, 0)
            .setOrigin(0)
            .setInteractive();

        const shape = this.createRandomShape(x + size / 2, y + size / 2, size * 0.4);
        const checkbox = this.createCheckbox(x + 10, y + 10, false);
        
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
        graphics.lineStyle(2, 0x000000);
        graphics.strokeRect(x, y, 20, 20);

        if (checked) {
            this.drawCheck(graphics, x, y);
        }

        return graphics;
    }

    drawCheck(graphics, x, y) {
        graphics.lineStyle(2, 0x000000);
        graphics.beginPath();
        graphics.moveTo(x + 3, y + 10);
        graphics.lineTo(x + 8, y + 15);
        graphics.lineTo(x + 17, y + 5);
        graphics.strokePath();
    }

    handleCellClick(pointer, gameObject) {
        const cellData = this.cells.find(cell => cell.cell === gameObject);
        if (cellData) {
            const { checkbox } = cellData;
            const checked = !checkbox.data || !checkbox.data.get('checked');
            
            checkbox.clear();
            checkbox.lineStyle(2, 0x000000);
            checkbox.strokeRect(cellData.cell.x + 10, cellData.cell.y + 10, 20, 20);
            
            if (checked) {
                this.drawCheck(checkbox, cellData.cell.x + 10, cellData.cell.y + 10);
            }
            
            if (!checkbox.data) {
                checkbox.setDataEnabled();
            }
            checkbox.data.set('checked', checked);
        }
    }

    limitCameraScroll(camera) {
        const zoom = camera.zoom;
        const leftBound = this.worldWidth * (1 - 1 / zoom) / 2;
        const rightBound = this.worldWidth * (1 / zoom - 1) / 2;
        const topBound = this.worldHeight * (1 - 1 / zoom) / 2;
        const bottomBound = this.worldHeight * (1 / zoom - 1) / 2;

        camera.scrollX = Phaser.Math.Clamp(camera.scrollX, leftBound, -rightBound);
        camera.scrollY = Phaser.Math.Clamp(camera.scrollY, topBound, -bottomBound);
    }
}