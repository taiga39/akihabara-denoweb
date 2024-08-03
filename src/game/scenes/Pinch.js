'use strict';

import { Scene } from 'phaser';

export class Pinch extends Scene {
    constructor() {
        super('Pinch');
        this.cells = [];
    }

    preload() {
        this.load.plugin('rexpinchplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexpinchplugin.min.js', true);
    }

    create() {
        this.cameras.main.setBackgroundColor('#ffffff');

        this.createGrid();

        const dragScale = this.plugins.get('rexpinchplugin').add(this);
        const camera = this.cameras.main;

        camera.centerOn(250, 250);

        dragScale.on('drag1', (dragScale) => {
            const drag1Vector = dragScale.drag1Vector;
            camera.scrollX -= drag1Vector.x / camera.zoom;
            camera.scrollY -= drag1Vector.y / camera.zoom;
        });

        dragScale.on('pinch', (dragScale) => {
            const scaleFactor = dragScale.scaleFactor;
            camera.zoom *= scaleFactor;
        });

        this.input.on('gameobjectdown', this.handleCellClick, this);
    }

    createGrid() {
        const gridSize = 100;
        const worldSize = 500;

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const x = col * gridSize;
                const y = row * gridSize;
                this.createCell(x, y, gridSize);
            }
        }

        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x000000, 0.4);
        for (let i = 0; i <= 5; i++) {
            const position = i * gridSize;
            graphics.moveTo(0, position);
            graphics.lineTo(worldSize, position);
            graphics.moveTo(position, 0);
            graphics.lineTo(position, worldSize);
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
}