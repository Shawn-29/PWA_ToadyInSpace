import {Enemy} from './base_enemy.js';
import {ExpMgr} from '../explosion_mgr.js';
import {TileMgr, checkTileBits} from '../tile_mgr.js';

import {getImg} from '../utilities.js';

import {BASE_MOVE_VEL, LEVEL_HEIGHT} from '../gameplay_constants.js';

export const SmileyBall = class extends Enemy {
    constructor(x, y) {
        super(60, 50, 50, x, y);
        this.hits = 0;
        this.vel = [-BASE_MOVE_VEL >> 1, BASE_MOVE_VEL >> 1];
        this.hueStep = 0;
        this.hue = '';
        this.changeHue();
    }
    update(dt, data = null) {
        super.update(dt, data);
        let xOffset = data['gameXPos'];
        if (this.right - xOffset >= gameCanvas.width) {
            this.setPos(gameCanvas.width + xOffset - (SmileyBall.img.width >> 1), this.y);
            this.reverseX();
        }
        else if (this.left - xOffset <= 0) {
            this.setPos(SmileyBall.img.width + xOffset, this.y);
            this.reverseX();
        }

        if (this.bot >= LEVEL_HEIGHT) {
            this.setPos(this.x, LEVEL_HEIGHT - (SmileyBall.img.height >> 1));
            this.reverseY();
        }
        else if (this.top <= 0) {
            this.setPos(this.x, SmileyBall.img.height);
            this.reverseY();
        }

        let xM = ~~(this.vel[0] * dt);
        let yM = ~~(this.vel[1] * dt);

        let rTileOffset = this.right + xM,
            lTileOffset = this.left + xM;

        if (checkTileBits(TileMgr.get().getPointTileType(rTileOffset, this.top),
                                  TileMgr.get().getPointTileType(rTileOffset, this.bot),
                                  TileMgr.get().getPointTileType(rTileOffset, this.y),
                                  TileMgr.get().getPointTileType(lTileOffset, this.top),
                                  TileMgr.get().getPointTileType(lTileOffset, this.bot),
                                  TileMgr.get().getPointTileType(lTileOffset, this.y)) & TILE_TYPES['TILE_WALL']) {
            this.reverseX();
            xM = ~~(this.vel[0] * dt);
        }

        rTileOffset += xM;
        lTileOffset += xM;

        if (checkTileBits(TileMgr.get().getPointTileType(rTileOffset, this.top + yM),
                                  TileMgr.get().getPointTileType(rTileOffset, this.bot + yM),
                                  TileMgr.get().getPointTileType(lTileOffset, this.top + yM),
                                  TileMgr.get().getPointTileType(lTileOffset, this.bot + yM)) & TILE_TYPES['TILE_WALL']) {
            this.reverseY();
            yM = ~~(this.vel[1] * dt);
        }

        if (this.hits > 30) {
            ExpMgr.get().addExp(this.x - xOffset, this.y);
            this.done = true;
            return;
        }
        
        let p = data['player'];
        if (p.collCheck(this, xOffset)) {
            p.setHp(15 + this.hits);
            if ((this.x + xOffset > p.x && Math.sign(this.vel[0]) == -1) ||
               ((this.x + xOffset <= p.x && Math.sign(this.vel[0]) == 1))) {
                this.reverseX();
                xM = ~~(this.vel[0] * dt);
            }
            if ((this.y > p.x && Math.sign(this.vel[1]) == -1) ||
               ((this.y <= p.x && Math.sign(this.vel[1]) == 1))) {
                this.reverseY();
                yM = ~~(this.vel[1] * dt);
            }
        }

        this.move(xM, yM);
    }
    draw(context, xOffset = 0) {
        if (this.blinkTimer.started) {
            context.save();
            context.fillStyle = '#fff';
            context.beginPath();
            context.arc(this.x - xOffset, this.y, 24, 0, 2 * Math.PI, false);
            context.fill();
            context.restore();
            drawHitFrame(context, this, SmileyBall.img, xOffset);
        }
        else {
            context.save();
            context.fillStyle = this.hue;
            context.beginPath();
            context.arc(this.x - xOffset, this.y, 24, 0, 2 * Math.PI, false);
            context.fill();
            context.restore();
            context.drawImage(SmileyBall.img,
                              this.x - xOffset - (SmileyBall.img.width >> 1),
                              this.y - (SmileyBall.img.height >> 1));          
        }       
    }
    reverseX() {
        ++this.hits;
        this.vel[0] = -this.vel[0] - Math.sign(this.vel[0]) * 2;
        this.vel[1] = this.vel[1] + Math.sign(this.vel[1]) * 2;
        this.changeHue();
    }
    reverseY() {
        ++this.hits;
        this.vel[0] = this.vel[0] + Math.sign(this.vel[0]) * 2;
        this.vel[1] = -this.vel[1] - Math.sign(this.vel[1]) * 2;
        this.changeHue();
    }
    changeHue() {
        switch (this.hueStep++) {
            default: this.hueStep = 1;
            case 0: this.hue = '#41e100'; break;
            case 1: this.hue = '#f00'; break;
            case 2: this.hue = '#77f'; break;
            case 3: this.hue = '#ff0'; break;
            case 4: this.hue = '#d0f'; break;
            case 5: this.hue = '#f80'; break;
        }
    }
};
// SmileyBall.img = getImg('Images/Enemies/SmileyBall.png');
SmileyBall.img = getImg('./images/enemies/SmileyBall.png');