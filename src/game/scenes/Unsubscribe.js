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
    
        const unsubscribeContent = this.createUnsubscribeContent();
    
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
                speed: 0.1
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
    }

    createUnsubscribeContent() {
        const ru = createRelativeUnits(this);
        const content = this.add.container();
        let yOffset = 0;

        const panelWidth = this.scale.width - ru.toPixels(8);

        const addText = (text, fontSize, isBold = false, color = '#000000') => {
            const textObject = this.add.text(0, yOffset, text, {
                fontSize: fontSize,
                fontStyle: isBold ? 'bold' : 'normal',
                color: color,
                wordWrap: { width: panelWidth, useAdvancedWrap: true },
                lineSpacing: 1
            }).setPadding(0, ru.toPixels(1), 0, 0);
            content.add(textObject);
            yOffset += textObject.height + ru.toPixels(5);
            return textObject;
        };

        addText('解約手続きについて', ru.fontSize.medium, true);
        addText('こちらのページでは、有料会員サービスの解約手続きについてご案内いたします。', ru.fontSize.small);

        addText('解約の流れ', ru.fontSize.medium, true);
        addText('1. アカウント設定ページにアクセスする', ru.fontSize.small);
        addText('2. 「解約手続き」ボタンをクリック', ru.fontSize.small);
        addText('3. 解約理由を選択（任意）', ru.fontSize.small);
        addText('4. 解約確認画面で「解約する」ボタンをクリック', ru.fontSize.small);
        addText('5. 解約完了メールの受信を確認', ru.fontSize.small);

        addText('注意事項', ru.fontSize.medium, true);
        addText('・解約手続き完了後、次回の更新日をもってサービスの利用ができなくなります。', ru.fontSize.small);
        addText('・解約後のデータ復旧はできません。必要なデータは事前にバックアップをお取りください。', ru.fontSize.small);
        addText('・解約月の日割り返金は行っておりません。', ru.fontSize.small);

        addText('解約後のサービス利用について', ru.fontSize.medium, true);
        addText('解約後は、無料プランでのサービス利用が可能です。ただし、一部機能に制限がかかります。', ru.fontSize.small);

        const unsubscribeButton = this.add.text(panelWidth / 2, yOffset + ru.toPixels(20), '解約手続きへ進む', {
            fontSize: ru.fontSize.medium,
            backgroundColor: '#ff0000',
            color: '#ffffff',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        unsubscribeButton.setInteractive();
        unsubscribeButton.on('pointerdown', () => {
            // ここに解約処理のロジックを追加
            console.log('解約処理を開始');
        });
        content.add(unsubscribeButton);

        yOffset += unsubscribeButton.height + ru.toPixels(30);

        content.setSize(panelWidth, yOffset);
        return content;
    }
}