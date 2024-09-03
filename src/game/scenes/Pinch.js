'use strict';

import { BaseScene } from '../BaseScene';
import SpeechBubble from '../component/SpeechBubble';

export class Pinch extends BaseScene {
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
        this.imagePadding = 0.05; // 画像間のマージンを小さくするために値を減らしました
    }

    preload() {
        this.load.plugin('rexpinchplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexpinchplugin.min.js', true);
        
        // 画像の読み込み
        for (let i = 1; i <= 11; i++) {
            this.load.image(`rajio${i}`, `assets/rajio (${i}).png`);
        }
    }

    createScene() {
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

        const instructionText = this.createHighQualityText(this.scale.width / 2, this.verticalPadding * 2, '看板の赤い文字\nをすべて選択してください', {
            font: '3rem Arial',
            fill: '#ffffff',
            backgroundColor: '#0000ff',
            padding: { x: 100, y: 5 }
        })
        .setOrigin(0.5)
        .setDepth(1000)
        .setScrollFactor(0);
    
        this.createDebugToggleButton();
        this.createConfirmButton();
    
        // 指示枠をカメラに追従させる
        this.cameras.main.ignore([instructionBox, instructionText]);
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
            .setDisplaySize(size * (1 - this.imagePadding), size * (1 - this.imagePadding));
        
        // 初期サイズを保存
        image.initialWidth = image.displayWidth;
        image.initialHeight = image.displayHeight;
    
        const checkbox = this.createCheckbox(x + 5, y + 5, false);
    
        this.cells.push({ cell, checkbox, image, imageNumber });
    }

    createCheckbox(x, y, checked) {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x0000ff, 1);
        graphics.fillCircle(x + this.checkboxSize / 2, y + this.checkboxSize / 2, this.checkboxSize / 2);
    
        // デフォルトでは非表示に設定
        graphics.setVisible(false);
    
        if (checked) {
            this.drawCheck(graphics, x, y);
        }
    
        return graphics;
    }
    
    handleCellClick(pointer, gameObject) {
        const cellData = this.cells.find(cell => cell.cell === gameObject);
        if (cellData) {
            const { checkbox, image } = cellData;
            const checked = !checkbox.data || !checkbox.data.get('checked');
    
            checkbox.clear(); // グラフィックスをクリア
    
            if (checked) {
                // 青丸の描画
                checkbox.fillStyle(0x0000ff, 1);
                checkbox.fillCircle(cellData.cell.x + 5 + this.checkboxSize / 2, cellData.cell.y + 5 + this.checkboxSize / 2, this.checkboxSize / 2);
                // チェックマークを描画
                this.drawCheck(checkbox, cellData.cell.x + 5, cellData.cell.y + 5);
    
                // 画像を少し小さくする
                image.setDisplaySize(image.displayWidth * 0.9, image.displayHeight * 0.9);
            } else {
                // チェックが外れたら、青丸を非表示にするためにクリア
                checkbox.clear();
    
                // 画像のサイズを元に戻す
                image.setDisplaySize(image.displayWidth / 0.9, image.displayHeight / 0.9);
            }
    
            checkbox.setVisible(true); // チェックボックスを表示する
    
            if (!checkbox.data) {
                checkbox.setDataEnabled();
            }
            checkbox.data.set('checked', checked);
        }
    }

    createConfirmButton() {
        const button = this.createHighQualityText(220, 460, '確認', {
            font: '3rem Arial',
            fill: '#ffffff',
            backgroundColor: '#0000ff',
            padding: { x: 10, y: 5 }
        })
        .setInteractive()
        .on('pointerdown', () => this.checkAnswers());

        button.setScrollFactor(0);  // カメラに追従しないように設定
    }

    createHighQualityText(x, y, text, style) {
        const highResScale = 3;
        style.fontSize *= highResScale;
        const textObject = this.add.text(x, y, text, style);
        textObject.setScale(1 / highResScale);
        return textObject;
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
            const { checkbox, image } = cellData;
    
            // チェックボックスのグラフィックスをクリア
            checkbox.clear();
            
            // チェックが外れた状態に戻す
            if (checkbox.data) {
                checkbox.data.set('checked', false);
            }
    
            // 画像のサイズを初期サイズに戻す
            image.setDisplaySize(image.initialWidth, image.initialHeight);
    
            // チェックボックスを非表示にする
            checkbox.setVisible(false);
        });
    }

    drawCheck(graphics, x, y) {
        // 白のチェックマークの描画
        graphics.lineStyle(2, 0xffffff, 1);
        graphics.beginPath();
        graphics.moveTo(x + 4, y + this.checkboxSize / 2);
        graphics.lineTo(x + this.checkboxSize / 3, y + this.checkboxSize - 4);
        graphics.lineTo(x + this.checkboxSize - 4, y + 4);
        graphics.strokePath();
    }

    createDebugToggleButton() {
        const button = this.createHighQualityText(200, 150, 'Toggle View', {
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
    
        // カメラの境界をリセット
        camera.removeBounds();
    
        if (this.isFullView) {
            // 全体表示
            camera.zoom = this.minZoom;
            camera.centerOn(this.worldWidth / 2, this.worldHeight / 2);
        } else {
            // 3列表示
            camera.zoom = this.maxZoom;
            
            // 3列分の幅を計算
            const threeColumnsWidth = this.cellSize * 3;
            
            // 画面中央に来るべき位置を計算
            const centerX = this.worldWidth / 2;
            const centerY = this.worldHeight / 2;
            
            // カメラの表示範囲を計算
            const cameraWidth = this.scale.width / camera.zoom;
            const cameraHeight = this.scale.height / camera.zoom;
            
            // カメラの位置を調整
            camera.centerOn(centerX, centerY);
            
            // 横方向のスクロール範囲を制限
            const minX = Math.max(0, centerX - threeColumnsWidth / 2);
            const maxX = Math.min(this.worldWidth, centerX + threeColumnsWidth / 2);
            camera.setBounds(minX, 0, maxX - minX, this.worldHeight);
        }


        camera.centerOn(this.worldWidth / 2, this.worldHeight / 2);
    
        camera.centerOn(this.worldWidth / 2, this.worldHeight / 2);
        this.limitCameraScroll(camera);
    }
    
    limitCameraScroll(camera) {
        const zoom = camera.zoom;
        const bounds = camera.getBounds();
        
        if (bounds) {
            const leftBound = bounds.x;
            const rightBound = Math.max(leftBound, bounds.right - camera.width / zoom);
            const topBound = bounds.y;
            const bottomBound = Math.max(topBound, bounds.bottom - camera.height / zoom);
    
            camera.scrollX = Phather.Math.Clamp(camera.scrollX, leftBound, rightBound);
            camera.scrollY = Phaser.Math.Clamp(camera.scrollY, topBound, bottomBound);
        } else {
            // 全体表示時の処理
            const leftBound = 0;
            const rightBound = Math.max(0, this.worldWidth - camera.width / zoom);
            const topBound = 0;
            const bottomBound = Math.max(0, this.worldHeight - camera.height / zoom);
    
            camera.scrollX = Phaser.Math.Clamp(camera.scrollX, leftBound, rightBound);
            camera.scrollY = Phaser.Math.Clamp(camera.scrollY, topBound, bottomBound);
        }
    }
}