import BaseNpc from "../BaseNpc";
import * as MACRO from "../../common/MACRO";
import Entities from "../../manager/Entities";

const { ccclass, property } = cc._decorator;

/**
 * 自爆怪的实体类，跟踪英雄，只有碰撞没有子弹射击。
 */
@ccclass
export default class Enemy_SelfDestruct extends BaseNpc {
    @property({
        override: true,
        visible: false,
    })
    bulletPrefab: cc.Prefab = null;
    @property({
        displayName: "基础攻击间隔",
        override: true,
        visible: false,
    })
    protected intervalOfAttack: number = 100;
    @property({
        displayName: "基础暴击几率",
        override: true,
        visible: false,
    })
    protected chanceOfCriticalStrike: number = 0;
    @property({
        displayName: "基础暴击伤害倍率",
        override: true,
        visible: false,
    })
    protected damageOfCriticalStrike: number = 100;
    @property({
        displayName: "碰撞减免",
        override: true,
        visible: false,
    })
    protected damageReductionOfCrash: number = 0;

    /**
     * 重新规划路径的间隔时间
     */
    private _intervalOfUpdatePath: number = 1;
    private _countTimeForUpdatePath: number = 0;

    private _timerForTaggleAnimation: number = 0;

    protected initProps(): void {
        this.countTimeForIntervalOfAttack = this.getIntervalOfAttackWA();
    }

    protected findPosForNextAttack(): cc.Vec2 {
        return null;
    }

    public setAnimationToIdle(): void {
        if (this.isKilled() || this.curStateOfAnimation == MACRO.ANIMATION_STATE.IDLE) {
            return;
        }
        this.curStateOfAnimation = MACRO.ANIMATION_STATE.IDLE;
        this.armature.animation.fadeIn("IDLE1", -1, -1, 0, "normal");
    }

    public setAnimationToMove(): void {
        this.setAnimationToIdle();
    }

    public setAnimationToBeAttacked(): void {
        this.setAnimationToIdle();
    }

    protected updatePathToMove(): void {
        this.updateTargetOfNPC();
        if (!Entities.isValid(this.curTargetToAttack)) {
            return;
        }
        this.moveToPosition(this.curTargetToAttack.rigidbody.getWorldCenter());
    }

    update(dt: number) {
        super.update(dt);
        this._countTimeForUpdatePath += dt;
        if (this._countTimeForUpdatePath > this._intervalOfUpdatePath) {
            this._countTimeForUpdatePath = 0;
            this.updatePathToMove();
        }
    }
}
