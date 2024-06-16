import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Stop extends Scene {
    constructor() {
        super('Stop');
        this.reels = []; // 複数リール用のテキストオブジェクト配列
        this.isSpinning = [false, false, false]; // 各リールのスピン状態
        this.symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        this.currentIndexes = [0, 0, 0]; // 各リールの現在の数字のインデックス
        this.spinEvents = []; // スピン用のタイマーイベント配列
        this.selectBoxes = []; // セレクトボックスのDOM要素
    }

    create() {
        this.add.image(512, 384, 'background');

        // スタートボタン
        const startText = this.add.text(400, 500, 'START', { fontSize: '32px', fill: '#000' })
            .setInteractive()
            .on('pointerdown', () => this.startAllSpins());

        // リールの作成とストップボタンの追加
        for (let i = 0; i < 3; i++) {
            const x = 300 + i * 200; // X座標を設定
            const reel = this.add.text(x, 300, this.symbols[this.currentIndexes[i]], { fontSize: '64px', fill: '#fff' })
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => this.showSelectBox(i));
            this.reels.push(reel);

            const stopText = this.add.text(x, 400, 'STOP', { fontSize: '32px', fill: '#f00' })
                .setInteractive()
                .on('pointerdown', () => this.stopSpin(i));

            // セレクトボックスを作成
            const selectBox = document.createElement('select');
            selectBox.style.position = 'absolute';
            selectBox.style.display = 'none';
            selectBox.style.zIndex = 1000;
            selectBox.style.width = '50px';
            selectBox.style.height = '30px';
            selectBox.onchange = (event) => this.selectNumber(i, event.target.value);
            this.symbols.forEach(symbol => {
                const option = document.createElement('option');
                option.value = symbol;
                option.text = symbol;
                selectBox.add(option);
            });
            document.body.appendChild(selectBox);
            this.selectBoxes.push(selectBox);
        }

        EventBus.emit('current-scene-ready', this);
    }

    startAllSpins() {
        for (let i = 0; i < this.reels.length; i++) {
            this.startSpin(i);
        }
    }

    startSpin(reelIndex) {
        if (!this.isSpinning[reelIndex]) {
            this.isSpinning[reelIndex] = true;
            if (this.spinEvents[reelIndex]) {
                this.spinEvents[reelIndex].remove(); // 既存のイベントがある場合は削除
            }
            this.spinEvents[reelIndex] = this.time.addEvent({
                delay: 50, // 0.05秒
                callback: () => this.updateReel(reelIndex),
                loop: true
            });
        }
    }

    updateReel(reelIndex) {
        if (this.isSpinning[reelIndex]) {
            this.currentIndexes[reelIndex] = (this.currentIndexes[reelIndex] + 1) % this.symbols.length; // 次の数字へ
            this.reels[reelIndex].setText(this.symbols[this.currentIndexes[reelIndex]]);
        }
    }

    stopSpin(reelIndex) {
        if (this.isSpinning[reelIndex]) {
            this.isSpinning[reelIndex] = false;
            if (this.spinEvents[reelIndex]) {
                this.spinEvents[reelIndex].remove();
            }
        }
    }

    showSelectBox(reelIndex) {
        // セレクトボックスの位置を設定し、表示する
        const reel = this.reels[reelIndex];
        const worldPoint = this.cameras.main.worldView;
        const bounds = reel.getBounds();
        const x = worldPoint.x + bounds.x - 25;
        const y = worldPoint.y + bounds.y + 30;

        this.selectBoxes[reelIndex].style.left = `${x}px`;
        this.selectBoxes[reelIndex].style.top = `${y}px`;
        this.selectBoxes[reelIndex].style.display = 'block';
    }

    selectNumber(reelIndex, value) {
        // リールの数字を選択された値に設定
        this.currentIndexes[reelIndex] = this.symbols.indexOf(value);
        this.reels[reelIndex].setText(value);
        this.selectBoxes[reelIndex].style.display = 'none'; // セレクトボックスを非表示にする
    }
}
