import { createRelativeUnits } from '../main';
import { BaseScene } from '../BaseScene';

export class Faq extends BaseScene {
    constructor() {
        super('Faq');
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

        const faqItems = [
            { 
                title: '退会するためには？', 
                text: '退会するには、アカウント設定ページから「退会」ボタンを押してください。退会処理には最大24時間かかる場合があります。退会後、アカウントに関連するすべてのデータが削除されます。有料サービスをご利用の場合は、退会前に解約手続きを行ってください。退会後のデータ復旧はできませんので、必要なデータはあらかじめバックアップをお取りください。'
            },
            { 
                title: 'パスワードを忘れた場合は？', 
                text: 'ログインページの「パスワードを忘れた方」リンクをクリックし、登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。リンクの有効期限は24時間です。セキュリティ上の理由から、パスワードリセットの際は、以前と同じパスワードは使用できません。新しいパスワードは8文字以上で、大文字、小文字、数字を含める必要があります。'
            },
            { 
                title: '支払い方法を変更するには？', 
                text: '支払い設定ページから、新しいクレジットカード情報を入力するか、別の支払い方法を選択できます。変更は次回の請求時から適用されます。クレジットカード以外の支払い方法として、PayPal、銀行振込、コンビニ決済などもご利用いただけます。支払い方法の変更は、現在のプラン期間中でも可能です。ただし、一部のプロモーション価格は特定の支払い方法に限定される場合があります。'
            },
            { 
                title: 'アカウントの連携方法は？', 
                text: '設定ページの「アカウント連携」セクションから、SNSアカウントとの連携が可能です。連携することで、ログインがより簡単になります。現在、Google、Facebook、Twitter、Appleアカウントとの連携に対応しています。アカウント連携を行っても、既存のアカウント情報は保持されます。連携後は、SNSアカウントでのログインと、従来のメールアドレスとパスワードでのログインの両方が可能です。セキュリティ強化のため、二段階認証の設定もおすすめです。'
            },
            {
                title: 'プランの変更方法は？',
                text: 'アカウント設定の「プラン変更」セクションから、現在のプランを確認し、他のプランに変更することができます。上位プランへの変更は即時反映されますが、下位プランへの変更は現在の請求期間が終了するまで適用されません。年間プランから月間プランへの変更、またはその逆も可能です。プラン変更時の料金は、利用日数に応じて日割り計算されます。特定のプランでのみ利用可能な機能がありますので、プラン変更前に機能の比較表をご確認ください。'
            }
        ];

        const content = this.createFaqContent(faqItems);

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
                child: content,
                mask: { padding: 1 },
            },
            slider: {
                track: this.rexUI.add.roundRectangle({ width: 10, radius: 10, color: 0xEEEEEE }),
                thumb: this.rexUI.add.roundRectangle({ width: 10, radius: 13, color: 0xCCCCCC }),
            },
            mouseWheelScroller: {
                focus: false,
                speed: 0.1
            },
            header: this.rexUI.add.label({
                height: ru.toPixels(15),
                orientation: 'horizontal',
                background: this.rexUI.add.roundRectangle({ fillColor: 0xFFFFFF, radius: 0 }),
                text: this.add.text(0, 0, 'FAQ', { fontSize: ru.fontSize.large, fontStyle: 'bold', color: '#000000' }),
            }),
            space: { left: 10, right: 10, top: 10, bottom: 10, panel: 10, header: 10 }
        }).layout();
    }

    createFaqContent(faqItems) {
        const ru = createRelativeUnits(this);
        const content = this.add.container();
        let yOffset = 0;

        const panelWidth = this.scale.width - ru.toPixels(15); // パネルの幅を調整

        faqItems.forEach((item, index) => {
            const title = this.add.text(0, yOffset, item.title, {
                fontSize: ru.fontSize.medium,
                fontStyle: 'bold',
                color: '#000000',
                wordWrap: { width: panelWidth, useAdvancedWrap: true }
            }).setPadding(0, ru.toPixels(2), 0, 0); // 上部にパディングを追加
            content.add(title);
            yOffset += title.height + ru.toPixels(5); // 間隔を少し狭めました

            const text = this.add.text(0, yOffset, item.text, {
                fontSize: ru.fontSize.small,
                color: '#000000',
                wordWrap: { width: panelWidth, useAdvancedWrap: true },
                lineSpacing: 5
            }).setPadding(0, ru.toPixels(2), 0, 0); // 上部にパディングを追加
            content.add(text);
            yOffset += text.height + ru.toPixels(15); // 次の中見出しまでの間隔を調整
        });

        content.setSize(panelWidth, yOffset);
        return content;
    }
}