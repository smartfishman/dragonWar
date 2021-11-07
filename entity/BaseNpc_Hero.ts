import BaseEntity from "./BaseEntity";
import BaseNpc from "./BaseNpc";
import * as MACRO from "../common/MACRO";

const { ccclass, property } = cc._decorator;

/**
 * 玩家操控的实体类，包含一些加成属性的接口，比如....还没想到^_^
 */
@ccclass
export default abstract class BaseNpc_Hero extends BaseNpc {
    /**
     * 控制英雄与敌人之间碰撞的生效间隔
     */
    private _countTimeForCrashWithUnit = 0;


    /**
     * 玩家操控的角色在攻击时总是寻找离自己最近的单位,
     * 玩家未移动时，不改变之前的攻击目标，除非该目标已死亡。
     */
    findPosForNextAttack(): cc.Vec2 {
        if (this.curTargetToAttack && !this.curTargetToAttack.isKilled()) {
            return this.curTargetToAttack.rigidbody.getWorldCenter();
        }
        this.curTargetToAttack = Entities.findNearestEnemy(this.rigidbody.getWorldCenter());
        return this.curTargetToAttack && this.curTargetToAttack.rigidbody.getWorldCenter();
    }

    protected onCrashWithUnit(unit: BaseEntity, contact: cc.PhysicsContact): void {
        if (!unit.isNPC() || this._countTimeForCrashWithUnit < 1) {//1秒内不反复生效碰撞,且只有碰撞到敌人时才受到伤害
            return;
        }
        this._countTimeForCrashWithUnit = 0;
        let _unit: BaseNpc = unit as BaseNpc;
        this.applyDamage(_unit, _unit.getBaseAttackWA(), MACRO.DAMAGE_TYPE.CRASH);
        contact.disabled = true;
    }

    public isHero(): boolean {
        return true;
    }

    update(dt: number) {
        super.update(dt);
        this._countTimeForCrashWithUnit += dt;
    }
}
import Entities from "../manager/Entities";