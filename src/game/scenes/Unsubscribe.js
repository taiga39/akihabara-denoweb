import { createRelativeUnits } from '../main';
import { BaseScene } from '../BaseScene';

export class Unsubscribe extends BaseScene {
    constructor() {
        super('Unsubscribe');
    }

    preload() {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
    }

    init() {
        this.scale.resize(window.innerWidth, window.innerHeight);
    }

    createScene() {
        const ru = createRelativeUnits(this);
    
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xFFFFFF).setOrigin(0, 0);
    
        // `createUnsubscribeContent`から初期オフセットを取得します
        const { content: unsubscribeContent, initialOffset } = this.createUnsubscribeContent();
    
        const scrollablePanel = this.rexUI.add.scrollablePanel({
            x: this.scale.width / 2,
            y: this.scale.height / 2,
            width: this.scale.width,
            height: this.scale.height,
            scrollMode: 'y',
            background: this.rexUI.add.roundRectangle({
                strokeColor: 0xCCCCCC,
                fillColor: 0xFFFFFF,
                strokeWidth: 1,
                radius: 0
            }),
            panel: {
                child: unsubscribeContent,
                mask: { padding: 1 },
            },
            mouseWheelScroller: {
                focus: false,
                speed: 0.05
            },
            header: this.rexUI.add.label({
                height: ru.toPixels(15),
                orientation: 'horizontal',
                background: this.rexUI.add.roundRectangle({ fillColor: 0xFFFFFF, radius: 0 }),
                text: this.add.text(0, 0, '解約手続き', {
                    fontSize: ru.fontSize.large,
                    fontStyle: 'bold',
                    color: '#000000'
                }).setPadding(2),
            }),
            space: { left: 10, right: 10, top: 10, bottom: 10, panel: 10, header: 10 }
        }).layout();
    
        // 5. 初期スクロール位置を設定して、ボタンをヘッダーの背後に隠します
        scrollablePanel.setChildOY(-initialOffset);
    }
    

    createUnsubscribeContent() {
        const ru = createRelativeUnits(this);
        const content = this.add.container();
        let yOffset = 0;
    
        const panelWidth = this.scale.width - ru.toPixels(8);
    
        // 1. ボタンを最初に作成し、ヘッダーの背後に配置します
        const unsubscribeButton = this.add.text(panelWidth / 2, yOffset, '解約手続きへ進む', {
            fontSize: ru.fontSize.medium,
            backgroundColor: '#ff0000',
            color: '#ffffff',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5, 0);
        unsubscribeButton.setInteractive();
        unsubscribeButton.on('pointerdown', () => {
            alert('解約処理を開始');
        });
        content.add(unsubscribeButton);
    
        yOffset += unsubscribeButton.height + ru.toPixels(10); // ボタンの後にスペースを追加
    
        // 2. テキストを追加します
        const addText = (text, fontSize, isBold = false, color = '#000000') => {
            const textObject = this.add.text(0, yOffset, text, {
                fontSize: fontSize,
                fontStyle: isBold ? 'bold' : 'normal',
                color: color,
                wordWrap: { width: panelWidth, useAdvancedWrap: true },
                lineSpacing: 3
            }).setPadding(0, ru.toPixels(1), 0, 0);
            content.add(textObject);
            yOffset += textObject.height + ru.toPixels(5);
            return textObject;
        };
    
        addText('解約手続きについて', ru.fontSize.medium, true);
        addText('こちらのページでは、有料会員サービスの解約手続きについてご案内いたします。', ru.fontSize.small);
    
        addText('解約の流れ', ru.fontSize.medium, true);
        addText('1. 解約理由を選択してください。', ru.fontSize.small);
        addText('2.「解約手続きへ進む」から解約処理を開始してください。', ru.fontSize.small);
    
        addText('注意事項', ru.fontSize.medium, true);
        addText('解約手続き完了後、24時間以内に退会処理(アカウント削除)を行わない場合は有料会員への移行手続きを自動で行います。', ru.fontSize.small);
        addText('解約理由には「引っ越しのため」を選択する必要があります。', ru.fontSize.small);
    
        addText('解約後のサービス利用について', ru.fontSize.medium, true);
        addText('解約後は無料プランでのサービス利用が可能です。ただし、一部機能に制限がかかります。', ru.fontSize.small);
    
        // 3. コンテンツのサイズを設定します
        content.setSize(panelWidth, yOffset);
        
        // 4. 初期オフセットを計算して返します
        const initialOffset = unsubscribeButton.height + ru.toPixels(20) - ru.toPixels(15); // ボタンの高さ + スペース - ヘッダーの高さ
    
        return { content, initialOffset };
    }
    
}