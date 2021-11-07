import BaseNpc_Hero from "../BaseNpc_Hero";
import * as MACRO from "../../common/MACRO";
import * as Modifiers from "../../utils/Modifiers";

const { ccclass, property } = cc._decorator;
/**
 * 玩家操控的其中一种角色：红龙。
 * 可发射一个火球，升级后可同时发射多个火球
 */
@ccclass
export default class RedDragon extends BaseNpc_Hero {
    public unitName: string = "红龙";

    protected initProps(): void {
        // setTimeout(() => {
        //     this.addAbilityByName(Modifiers.Ability_imcreamentHpByKill.prototype.getModifierName());
        // }, 2000);
        // setInterval(() => {
        //     this.addAbilityByName(Modifiers.Ability_healthBonus.prototype.getModifierName());
        //     cc.log(this.currentHp, this.getBaseHpWA());
        // }, 2000);
    }

    setAnimationToIdle() {
        if (this.isKilled() || this.curStateOfAnimation == MACRO.ANIMATION_STATE.IDLE) {
            return;
        }
        this.curStateOfAnimation = MACRO.ANIMATION_STATE.IDLE;
        this.armature.animation.fadeIn("IDLE1", -1, -1, 0, "normal");
    }

    setAnimationToMove() {
        this.setAnimationToIdle();
        // if (this.curStateOfAnimation == MACRO.ANIMATION_STATE.MOVE) {
        //     return;
        // }
        // this.curStateOfAnimation = MACRO.ANIMATION_STATE.MOVE;
        // this.armature.animation.fadeIn("SPRINT1", -1, -1, 0, "normal");
    }

    public setAnimationToBeAttacked(): void {
        this.setAnimationToIdle();
    }


}
