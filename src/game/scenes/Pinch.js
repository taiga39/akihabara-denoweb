'use strict';

import { Scene } from 'phaser';

export class Pinch extends Scene {
    constructor() {
        super('Pinch');
    }

    preload() {
        // rexpinchplugin の読み込み
        this.load.plugin('rexpinchplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexpinchplugin.min.js', true);
    }

    create() {
        // グリッドを描画して背景に設定
        this.createGridBackground();

        // rexpinchplugin を追加
        const dragScale = this.plugins.get('rexpinchplugin').add(this);

        // カメラの取得
        const camera = this.cameras.main;

        // カメラの初期位置をグリッドの中央に設定
        camera.centerOn(0, 0);

        // 1本指ドラッグでカメラをスクロール
        dragScale.on('drag1', (dragScale) => {
            const drag1Vector = dragScale.drag1Vector;
            camera.scrollX -= drag1Vector.x / camera.zoom;
            camera.scrollY -= drag1Vector.y / camera.zoom;
        });

        // ピンチでズーム
        dragScale.on('pinch', (dragScale) => {
            const scaleFactor = dragScale.scaleFactor;
            camera.zoom *= scaleFactor;
        });

        // デバッグ用：ズームレベルのログ
        camera.on('cameraupdate', () => {
            console.log(`Zoom: ${camera.zoom}`);
        });
    }

    createGridBackground() {
        // グリッド背景を描画
        const graphics = this.add.graphics();
        const lineColor = 0x000000;
        const lineAlpha = 0.4;
        const gridSize = 100;
        const worldSize = 2000;

        graphics.lineStyle(1, lineColor, lineAlpha);

        // 垂直線
        for (let x = -worldSize; x <= worldSize; x += gridSize) {
            graphics.beginPath();
            graphics.moveTo(x, -worldSize);
            graphics.lineTo(x, worldSize);
            graphics.strokePath();
        }

        // 水平線
        for (let y = -worldSize; y <= worldSize; y += gridSize) {
            graphics.beginPath();
            graphics.moveTo(-worldSize, y);
            graphics.lineTo(worldSize, y);
            graphics.strokePath();
        }
    }
}
