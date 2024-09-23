'use strict';

import { BaseScene } from '../BaseScene';
import SpeechBubble from '../component/SpeechBubble';

export class Pinch extends BaseScene {
    constructor() {
        super('Pinch');
        this.cells = [];
        this.columnCount = 5;
        this.rowCount = 3;
        this.checkboxSize = 15;
        this.imageLayout = [
            3, 2, 4, 11, 7,  // 1行目に3と7を配置
            11, 1, 6, 5, 5,
            6, 8, 9, 10, 11
        ];
        this.isFullView = false;
        this.correctChecks = [1, 9, 10, 3, 7];
        this.imagePadding = 0.05; // 画像間のマージンを小さくするために値を減らしました
    }

    preload() {
        // プラグインを変更
        this.load.scenePlugin('rexgesturesplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexgesturesplugin.min.js', 'rexGestures', 'rexGestures');
        
        // 画像の読み込み
        for (let i = 1; i <= 11; i++) {
            this.load.image(`rajio${i}`, `assets/rajio (${i}).png`);
        }
    }

    createScene() {
        this.cameras.main.setBackgroundColor('#ffffff');

        // ゲームオブジェクト用のコンテナを作成
        this.gameObjectsContainer = this.add.container(0, 0);

        this.calculateSizes();
        this.createGrid();

        // ピンチジェスチャーの設定
        this.setupPinchGesture();

        // UI要素用のコンテナを作成
        this.uiContainer = this.add.container(0, 0);

        // 指示テキストを作成
        const instructionText = this.createHighQualityText(
            this.scale.width / 2,
            this.verticalPadding * 0.45,
            '看板の赤い文字\nをすべて選択してください',
            {
                font: '2.3rem Arial',
                fill: '#ffffff',
                backgroundColor: '#0000ff',
                padding: { x: 15, y: 8 }
            }
        )
        .setOrigin(0.5)
        .setDepth(1000);
    
        // UIコンテナに追加
        this.uiContainer.add(instructionText);

        // 確認ボタンを作成
        this.createConfirmButton();

        // メインカメラがUIコンテナを無視
        this.cameras.main.ignore(this.uiContainer);

        // UIカメラを作成
        this.createUICamera();

        // 入力イベントの設定
        this.input.setTopOnly(false);

        // セルのクリックイベントを設定
        this.input.on('gameobjectdown', this.handleCellClick, this);

        // デバッグ用のトグルボタンを作成（必要に応じてコメントアウト）
        this.createDebugToggleButton();
    }

    calculateSizes() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        // セルサイズを計算
        this.cellSize = Math.min(screenWidth / this.columnCount, screenHeight / this.rowCount);

        // ワールドサイズを計算
        this.worldWidth = this.cellSize * this.columnCount;
        this.worldHeight = this.cellSize * this.rowCount;

        // 垂直方向のパディングを計算してグリッドを中央に配置
        this.verticalPadding = (screenHeight - this.worldHeight) / 2;

        // 最小ズームと最大ズームを計算
        this.minZoom = Math.min(screenWidth / this.worldWidth, screenHeight / (this.worldHeight + this.verticalPadding * 2));
        this.maxZoom = screenWidth / (this.cellSize * 3);
    }

    getGridCenterY() {
        return this.verticalPadding + (this.cellSize * this.rowCount) / 2;
    }

    setInitialZoom(camera) {
        camera.zoom = this.maxZoom;
        camera.centerOn(this.worldWidth / 2, this.getGridCenterY());
        camera.setBounds(0, 0, this.worldWidth, this.worldHeight + this.verticalPadding * 2);
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

        // グラフィックスをコンテナに追加
        this.gameObjectsContainer.add(graphics);
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

        // コンテナに追加
        this.gameObjectsContainer.add(cell);
        this.gameObjectsContainer.add(image);
        this.gameObjectsContainer.add(checkbox);

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
        const button = this.createHighQualityText(
            this.scale.width / 2,
            this.scale.height - 80,
            '確認',
            {
                font: '2rem Arial',
                fill: '#ffffff',
                backgroundColor: '#0000ff',
                padding: { x: 20, y: 10 }
            }
        )
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => this.checkAnswers());
    
        this.uiContainer.add(button);
    }

    createHighQualityText(x, y, text, style) {
        const highResScale = 3;
        const adjustedStyle = { ...style };
        adjustedStyle.font = adjustedStyle.font.replace(/(\d+(\.\d+)?)(px|rem)/, (match, p1, p2, p3) => {
            return `${parseFloat(p1) * highResScale}${p3}`;
        });
        const textObject = this.add.text(x, y, text, adjustedStyle);
        textObject.setScale(1 / highResScale);
        return textObject;
    }

    checkAnswers() {
        const checkedCells = this.cells.filter(cell => cell.checkbox.data && cell.checkbox.data.get('checked'));
        const checkedNumbers = checkedCells.map(cell => cell.imageNumber);

        const isCorrect = this.correctChecks.every(num => checkedNumbers.includes(num)) &&
                          checkedNumbers.length === this.correctChecks.length;

        if (isCorrect) {
            this.startNextScene();
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

    createUICamera() {
        // UIカメラを作成
        this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
        this.uiCamera.setScroll(0, 0);
        this.uiCamera.setZoom(1);

        // UIカメラがゲームオブジェクトコンテナを無視
        this.uiCamera.ignore(this.gameObjectsContainer);
    }

    setupPinchGesture() {
        // ピンチジェスチャーの設定
        const pinch = this.rexGestures.add.pinch();

        // メインカメラを取得
        const camera = this.cameras.main;

        // 初期ズームを設定
        this.setInitialZoom(camera);

        // ピンチイベントの設定
        pinch.on('pinch', (pinch) => {
            const scaleFactor = pinch.scaleFactor;
            const oldZoom = camera.zoom;
            camera.zoom *= scaleFactor;
            camera.zoom = Phaser.Math.Clamp(camera.zoom, this.minZoom, this.maxZoom);

            // ピンチの中心を取得
            const pinchCenter = pinch.center;
            const worldX = (pinchCenter.x - camera.x) / oldZoom + camera.scrollX;
            const worldY = (pinchCenter.y - camera.y) / oldZoom + camera.scrollY;

            // カメラのスクロール位置を調整
            camera.scrollX = worldX - (pinchCenter.x - camera.x) / camera.zoom;
            camera.scrollY = worldY - (pinchCenter.y - camera.y) / camera.zoom;

            // ズームレベルに応じてカメラの位置と境界を調整
            if (camera.zoom >= this.maxZoom) {
                // ズームイン最大値に達した場合、カメラを初期位置に戻す
                camera.zoom = this.maxZoom;
                camera.centerOn(this.worldWidth / 2, this.getGridCenterY());
                camera.setBounds(0, 0, this.worldWidth, this.worldHeight + this.verticalPadding * 2);
            } else if (camera.zoom <= this.minZoom) {
                // ズームアウト最小値に達した場合、カメラをグリッドの中央にし、境界を解除
                camera.zoom = this.minZoom;
                camera.centerOn(this.worldWidth / 2, this.getGridCenterY());
                camera.setBounds(); // 境界を解除
            } else {
                // ズーム中の場合、境界を設定しスクロール範囲を制限
                camera.setBounds(0, 0, this.worldWidth, this.worldHeight + this.verticalPadding * 2);
                this.limitCameraScroll(camera);
            }
        });
    }

    limitCameraScroll(camera) {
        const zoom = camera.zoom;
        const worldLeft = 0;
        const worldRight = this.worldWidth;
        const worldTop = 0;
        const worldBottom = this.worldHeight + this.verticalPadding * 2;

        const viewWidth = camera.width / zoom;
        const viewHeight = camera.height / zoom;

        let leftBound, rightBound, topBound, bottomBound;

        if (viewWidth < this.worldWidth) {
            leftBound = worldLeft;
            rightBound = worldRight - viewWidth;
        } else {
            // カメラの表示領域がワールドより大きい場合、ワールドを中央に配置
            leftBound = (worldRight - viewWidth) / 2;
            rightBound = leftBound;
        }

        if (viewHeight < worldBottom) {
            topBound = worldTop;
            bottomBound = worldBottom - viewHeight;
        } else {
            // カメラの表示領域がワールドより大きい場合、ワールドを中央に配置
            topBound = (worldBottom - viewHeight) / 2;
            bottomBound = topBound;
        }

        camera.scrollX = Phaser.Math.Clamp(camera.scrollX, leftBound, rightBound);
        camera.scrollY = Phaser.Math.Clamp(camera.scrollY, topBound, bottomBound);
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

        // コンテナに追加
        this.uiContainer.add(button);
    }

    toggleView() {
        this.isFullView = !this.isFullView;
        const camera = this.cameras.main;

        if (this.isFullView) {
            // 全体表示
            camera.zoom = this.minZoom;
            camera.centerOn(this.worldWidth / 2, this.getGridCenterY());
            camera.setBounds(); // 境界を解除
        } else {
            // 3列表示
            camera.zoom = this.maxZoom;
            camera.centerOn(this.worldWidth / 2, this.getGridCenterY());
            camera.setBounds(0, 0, this.worldWidth, this.worldHeight + this.verticalPadding * 2);
        }

        this.limitCameraScroll(camera);
    }
}
