'use strict';

import { Scene } from 'phaser';

export class CrossWord extends Scene {
    constructor() {
        super('CrossWord');
    }

    create() {
        this.gridSize = 9; // グリッドのサイズ（9x9）

        // 画面幅に基づいてセルサイズを動的に計算
        this.cellSize = this.calculateCellSize();
        this.cells = []; // セルのデータを保持する配列
        this.activeCell = null; // フォーカスされているセル

        // グリッドの描画位置をキャンバス中央に設定
        this.gridOriginX = (this.scale.width - this.cellSize * this.gridSize) / 2;
        this.gridOriginY = (this.scale.height - this.cellSize * this.gridSize) / 2;

        // グリッドを描画
        this.createGrid();

        // タッチ/クリックイベントのリスナー
        this.input.on('pointerdown', this.handlePointerDown, this);
    }

    calculateCellSize() {
        // 画面の幅を9分割してセルサイズを計算
        return this.scale.width / this.gridSize;
    }

    createGrid() {
        // 背景色を設定
        this.cameras.main.setBackgroundColor('#ffffff');

        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x000000, 1);

        // 9x9のグリッドを描画
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                // 各セルに空のテキストオブジェクトを追加
                const cellBg = this.add.rectangle(
                    this.gridOriginX + col * this.cellSize + this.cellSize / 2,
                    this.gridOriginY + row * this.cellSize + this.cellSize / 2,
                    this.cellSize,
                    this.cellSize,
                    0xffffff // セルの背景色
                ).setStrokeStyle(2, 0x000000);

                const cellText = this.add.text(
                    this.gridOriginX + col * this.cellSize + this.cellSize / 2,
                    this.gridOriginY + row * this.cellSize + this.cellSize / 2,
                    '',
                    { font: `${this.cellSize / 2}px Arial`, color: '#000000' }
                ).setOrigin(0.5);

                // セルのデータを保存
                this.cells.push({
                    row: row,
                    col: col,
                    background: cellBg,
                    text: cellText
                });
            }
        }
    }

    handlePointerDown(pointer) {
        // クリック位置からセルを取得
        const row = Math.floor((pointer.y - this.gridOriginY) / this.cellSize);
        const col = Math.floor((pointer.x - this.gridOriginX) / this.cellSize);
        const cell = this.cells.find(c => c.row === row && c.col === col);

        if (cell) {
            // 先にセルをフォーカス
            this.focusCell(cell);

            // フォーカス後に短い遅延を入れてからダイアログを表示
            setTimeout(() => {
                this.promptForCharacters(cell);
            }, 10); // 10msの遅延でフォーカスの視覚効果を反映
        }
    }

    focusCell(cell) {
        // 前のセルのフォーカスを解除
        if (this.activeCell) {
            this.activeCell.background.setFillStyle(0xffffff); // 背景色を白に戻す
        }

        // 新しいセルにフォーカスを設定
        this.activeCell = cell;
        cell.background.setFillStyle(0xffff99); // フォーカスされたセルの背景色を黄色に設定
    }

    promptForCharacters(startCell) {
        // ユーザーに文字列の入力を促す
        const input = prompt('文字を入力してください:');

        if (input) {
            // 入力された文字を設定
            this.setTextFromCell(startCell, input);
        }
    }

    setTextFromCell(startCell, text) {
        let currentCell = startCell;

        for (let i = 0; i < text.length; i++) {
            if (currentCell) {
                currentCell.text.setText(text[i]);

                // 次のセルに移動（右方向）
                currentCell = this.getNextCell(currentCell);
            } else {
                break;
            }
        }
    }

    getNextCell(cell) {
        const nextCol = cell.col + 1;
        const nextRow = cell.row;

        if (nextCol < this.gridSize) {
            // 次の列が存在する場合
            return this.cells.find(c => c.row === nextRow && c.col === nextCol);
        } else {
            return null;
        }
    }
}
