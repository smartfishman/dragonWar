import BaseNpc from "../BaseNpc";
import GameMode from "../../manager/GameMode";
import * as MACRO from "../../common/MACRO";

const { ccclass, property } = cc._decorator;

/**
 * 怪物A的实体类，主要实现怪物移动和攻击的逻辑方法，以及一些具体动画动作的具体实现。
 */
@ccclass
export default class Enemy_A extends BaseNpc {
    @property({
        displayName: "单位移动时的速率",
        visible: false,
        override: true,
    })
    velocity: number = 0;
    @property({
        displayName: "碰撞减免",
        override: true,
        visible: false,
    })
    protected damageReductionOfCrash: number = 0;

    private _timerForTaggleAnimation: number = 0;

    protected initProps(): void {
    }

    protected findPosForNextAttack(): cc.Vec2 {
        if (GameMode.getAssignedHero().isKilled()) {
            return null;
        }
        return GameMode.getAssignedHero().rigidbody.getWorldCenter();
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
        if (this.isKilled() || this.curStateOfAnimation == MACRO.ANIMATION_STATE.BE_ATTACKED) {
            return;
        }
        this.curStateOfAnimation = MACRO.ANIMATION_STATE.BE_ATTACKED;
        this.armature.animation.fadeIn("IDLE2", -1, -1, 0, "normal");
        if (this._timerForTaggleAnimation !== 0) {
            clearTimeout(this._timerForTaggleAnimation);
        }
        this._timerForTaggleAnimation = setTimeout(() => {
            this.setAnimationToIdle();
        }, 800);
    }


}
