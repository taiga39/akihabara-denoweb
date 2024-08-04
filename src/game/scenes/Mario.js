import { Scene } from 'phaser';

export class Mario extends Scene {
    constructor() {
        super('Mario');
    }

    init() {
        console.log('Mario scene initialized');
        this.initialX = 50; // マリオの初期X座標
        this.cameraLerpFactor = 0.05; // カメラの追従速度
        this.hasMovedRight = false; // 右に移動したかどうかを追跡
        this.leftMoveProgress = 0; // 左移動の進行度
        this.jumpPressed = false; // ジャンプボタンの状態
        this.jumpCooldown = 0;
        this.autoMove = 0; // -1: 左、0: 停止、1: 右
    }

    create() {
        console.log('Create method started');
        
        // 背景のグラデーション生成
        this.createGradientBackground();
        
        // 地面を左右に広げる
        this.ground = this.add.rectangle(0, this.scale.height - 50, this.scale.width * 20, 100, 0x964B00);
        this.physics.add.existing(this.ground, true);
    
        // マリオ（四角形）- 左端に配置
        this.mario = this.add.rectangle(this.initialX, this.scale.height - 200, 50, 50, 0xFF0000);
        this.physics.add.existing(this.mario);
        this.mario.body.setCollideWorldBounds(false);
        this.mario.body.setGravityY(300);
    
        // 衝突設定
        this.physics.add.collider(this.mario, this.ground);
    
        // カメラの設定
        this.cameras.main.setBounds(-this.scale.width * 10, 0, this.scale.width * 20, this.scale.height);
        
        // 初期カメラ位置を設定
        this.cameras.main.scrollX = 0;
    
        // 移動ボタン
        this.createMoveButtons();
    }

    createGradientBackground() {
        const width = 1024;
        const height = this.scale.height;
        const texture = this.textures.createCanvas('skyGradient', width, height);
        const context = texture.getContext();
    
        const gradient = context.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#4a90e2');   // 青
        gradient.addColorStop(0.5, '#f0f0f0'); // 白（中間色）
        gradient.addColorStop(1, '#e74c3c');   // 赤
    
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
    
        texture.refresh();
    
        this.background = this.add.tileSprite(-this.scale.width * 10, 0, this.scale.width * 20, height, 'skyGradient');
        this.background.setOrigin(0, 0);
    }

    createMoveButtons() {
        const buttonStyle = {
            fontSize: '32px',
            backgroundColor: '#4a4a4a',
            padding: { x: 10, y: 10 },
            fixedWidth: this.scale.width / 4 - 10, // 画面幅の1/4から余白を引いた幅
            align: 'center'
        };
    
        const buttonY = this.scale.height - 80;
    
        const leftButton = this.add.text(5, buttonY, '←', buttonStyle)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => this.autoMove = -1);
    
        const stopButton = this.add.text(this.scale.width / 4 + 5, buttonY, '■', buttonStyle)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => this.autoMove = 0);
    
        const rightButton = this.add.text(this.scale.width / 2 + 5, buttonY, '→', buttonStyle)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => this.autoMove = 1);
    
        const jumpButton = this.add.text(this.scale.width * 3 / 4 + 5, buttonY, 'Jump', buttonStyle)
            .setScrollFactor(0)
            .setInteractive()
            .on('pointerdown', () => this.jumpPressed = true)
            .on('pointerup', () => this.jumpPressed = false);
    }
    
    moveMario() {
        const moveSpeed = 200;
        this.mario.body.setVelocityX(this.autoMove * moveSpeed);
    }

    jumpMario() {
        if ((this.mario.body.touching.down || this.mario.body.blocked.down) && this.jumpCooldown <= 0) {
            this.mario.body.setVelocityY(-250);
            this.jumpCooldown = 300; // 300ミリ秒のクールダウンを設定
        }
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    update(time, delta) {
        // マリオの移動
        this.moveMario();

        // ジャンプの処理
        if (this.jumpPressed) {
            this.jumpMario();
        } else {
            // ジャンプボタンが押されていない場合、クールダウンをリセット
            this.jumpCooldown = 0;
        }

        // ジャンプのクールダウンを減少
        if (this.jumpCooldown > 0) {
            this.jumpCooldown -= delta;
        }

        // カメラの追従制御
        const distanceFromStart = this.mario.x - this.initialX;
        const halfScreenWidth = this.scale.width / 2;

        if (distanceFromStart >= 0) {
            // 右方向の移動
            if (!this.hasMovedRight) {
                // 初めて右に移動した場合、滑らかに中央に移動
                const targetX = Math.max(0, this.mario.x - halfScreenWidth);
                this.cameras.main.scrollX += (targetX - this.cameras.main.scrollX) * this.cameraLerpFactor;
                
                if (this.mario.x >= halfScreenWidth) {
                    this.hasMovedRight = true;
                    this.cameras.main.startFollow(this.mario);
                }
            }
            this.leftMoveProgress = 0; // 左移動の進行度をリセット
        } else {
            // 左方向の移動
            this.hasMovedRight = false; // 左に移動したらフラグをリセット

            // 左移動の進行度を更新
            this.leftMoveProgress = Math.min(1, Math.abs(distanceFromStart) / halfScreenWidth);

            // イージング関数を適用してカメラの位置を計算
            const easeValue = this.easeOutCubic(this.leftMoveProgress);
            const targetX = -distanceFromStart * easeValue;
            
            this.cameras.main.scrollX += (targetX - this.cameras.main.scrollX) * this.cameraLerpFactor;

            // 完全に左に移動したらカメラを追従
            if (this.leftMoveProgress === 1) {
                this.cameras.main.startFollow(this.mario);
            }
        }
    }
}