import { EventBus } from '../EventBus';
import { BaseScene } from '../BaseScene';
import { createRelativeUnits } from '../main';
import SpeechBubble from '../component/SpeechBubble';
import HamburgerMenu from '../component/HamburgerMenu';
import { loadGameState, saveGameState } from '../hooks/gameState';

export class Stop extends BaseScene {
    constructor() {
        super('Stop');
        this.reels = [];
        this.isSpinning = [true, true, true];
        this.symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        this.currentIndexes = [0, 0, 0];
        this.spinEvents = [];
        this.dropDownLists = [];
    }

    preload() {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
    }

    createHighQualityText(x, y, text, style) {
        const highResScale = 3;
        style.fontSize *= highResScale;
        const textObject = this.add.text(x, y, text, style);
        textObject.setScale(1 / highResScale);
        return textObject;
    }

    createScene() {
        console.log('Stop scene is being created');
        const width = this.scale.width;
        const height = this.scale.height;
        this.ru = createRelativeUnits(this);

        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

        this.createHighQualityText(width / 2, height * 0.2, '７７７でそろえろ', { 
            fontSize: this.ru.fontSize.large * 1.4,
            fill: '#ffffff',
            wordWrap: { width: width * 0.8 },
            align: 'center'
        })
        .setOrigin(0.5, 0)
        .setPadding(10);

        this.reels = [];

        const startButton = this.add.circle(width * 0.5, height * 0.8, this.ru.toPixels(10), 0xff0000);
        const startText = this.add.text(width * 0.5, height * 0.8, 'START', { 
            fontSize: `${this.ru.fontSize.medium}px`, 
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        startButton.setInteractive()
            .on('pointerdown', () => this.startAllSpins());

        for (let i = 0; i < 3; i++) {
            const x = width * (0.15 + i * 0.35);
            const reelY = height * 0.4;
        
            const background = this.add.rectangle(x, reelY, width * 0.25, height * 0.15, 0xffffff);
            background.setOrigin(0.5);
        
            const reel = this.createReel(i, x, reelY, background.width, background.height);
            this.reels.push(reel);
        
            const triangle = this.add.triangle(
                x + background.width * 0.45,
                reelY * 1.05, 
                0, height * 0.01,
                height * 0.015, -height * 0.015,
                -height * 0.015, -height * 0.015,
                0x000000
            );
            triangle.setOrigin(0.5);
        
            const stopButton = this.add.circle(x, height * 0.6, this.ru.toPixels(8), 0xffff00);
            const stopText = this.add.text(x, height * 0.6, 'STOP', { 
                fontSize: `${this.ru.fontSize.small}px`, 
                fill: '#000',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            stopButton.setInteractive()
                .on('pointerdown', () => this.stopSpin(i));
        }

        EventBus.emit('current-scene-ready', this);

        this.startAllSpins();

        const bubbleWidth = this.ru.toPixels(60);
        const bubbleHeight = this.ru.toPixels(30);
        const bubbleX = this.scale.width - bubbleWidth - this.ru.toPixels(5);
        const bubbleY = this.scale.height - bubbleHeight - this.ru.toPixels(30);
    
        const speechBubble = new SpeechBubble(
            this,
            bubbleX,
            bubbleY,
            bubbleWidth,
            bubbleHeight,
            "こんにちは！@これは@吹き出しです。"
        );
    
        this.children.bringToTop(speechBubble);
    }

    createReel(index, x, y, width, height) {
        const options = this.symbols.map(symbol => ({ text: symbol, value: symbol }));
    
        const dropDownList = this.rexUI.add.dropDownList({
            x: x,
            y: y,
            width: width,
            height: height,
    
            background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 10, 0xFFFFFF),
    
            text: this.add.text(0, 0, this.symbols[this.currentIndexes[index]], {
                fontSize: `${height * 0.8}px`,
                color: '#000000',
                fontStyle: 'bold'
            }).setOrigin(0.5),
    
            options: options,
    
            list: {
                expandDirection: 'down',
    
                createBackgroundCallback: (scene) => {
                    return scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, 0xFFFFFF);
                },
    
                createButtonCallback: (scene, option, optionIndex, options) => {
                    const button = scene.rexUI.add.label({
                        background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFFFFFF),
                        text: scene.add.text(0, 0, option.text, {
                            fontSize: this.ru.fontSize.small,
                            color: '#000000'
                        }),
                        space: {
                            left: 10, right: 10, top: 0, bottom: 10, icon: 10
                        }
                    });
    
                    return button;
                },
    
                onButtonClick: (button, optionIndex, pointer, event) => {
                    if (!this.isSpinning[index]) {
                        const selectedValue = button.text;
                        this.updateReel(index, selectedValue);
                        this.checkWinCondition();
                        dropDownList.closeListPanel();
                    }
                },
    
                maxHeight: 200,
            },
    
            setValueCallback: (dropDownList, value) => {
                dropDownList.text = value;
            },
    
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
                icon: 10,
                choice: 10,
            },
        }).layout();
    
        // リールが回転中はドロップダウンリストを開けないようにする
        const originalOpenListPanel = dropDownList.openListPanel;
        dropDownList.openListPanel = function() {
            if (!this.scene.isSpinning[index]) {
                originalOpenListPanel.call(this);
            }
        };
    
        this.dropDownLists[index] = dropDownList;
        return dropDownList;
    }

    updateReel(reelIndex, value) {
        this.currentIndexes[reelIndex] = this.symbols.indexOf(value);
        this.reels[reelIndex].setText(value);
        this.dropDownLists[reelIndex].setText(value);  // ドロップダウンリストのテキストも更新
    }

    startAllSpins() {
        for (let i = 0; i < this.reels.length; i++) {
            this.startSpin(i);
        }
    }

    startSpin(reelIndex) {
        this.isSpinning[reelIndex] = true;
        if (this.spinEvents[reelIndex]) {
            this.spinEvents[reelIndex].remove();
        }
        this.spinEvents[reelIndex] = this.time.addEvent({
            delay: 50,
            callback: () => this.updateReelSpin(reelIndex),
            loop: true
        });
        this.dropDownLists[reelIndex].closeListPanel();
    }

    updateReelSpin(reelIndex) {
        if (this.isSpinning[reelIndex]) {
            this.currentIndexes[reelIndex] = (this.currentIndexes[reelIndex] + 1) % this.symbols.length;
            this.reels[reelIndex].setText(this.symbols[this.currentIndexes[reelIndex]]);
        }
    }

    stopSpin(reelIndex) {
        if (this.isSpinning[reelIndex]) {
            this.isSpinning[reelIndex] = false;
            if (this.spinEvents[reelIndex]) {
                this.spinEvents[reelIndex].remove();
            }
            this.checkWinCondition();
            this.dropDownLists[reelIndex].updateListPanel();
        }
    }

    checkWinCondition() {
        if (!this.isSpinning.some(spinning => spinning)) {
            const allSevens = this.currentIndexes.every(index => this.symbols[index] === '7');
            if (allSevens) {
                this.startNextScene();
            }
        }
    }
}