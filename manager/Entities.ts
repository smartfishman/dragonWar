class _Entities {
    private _enemyList: BaseNpc[] = [];
    /**
     * 将新增的敌人添加至list中方便后续的查找
     */
    addEnemyToList(enemy: BaseNpc): void {
        if (!enemy) {
            return;
        }
        this._enemyList.push(enemy);
    }

    /**
     * 去除已经无用的敌人实体
     */
    removeEnemyFromList(enemy: BaseNpc): void {
        let removeIndex: number = -1;
        for (let index in this._enemyList) {
            if (enemy === this._enemyList[index]) {
                removeIndex = Number(index);
            }
        }
        // cc.log("remove ",this._enemyList[removeIndex].node.uuid);
        removeIndex > -1 && this._enemyList.splice(removeIndex, 1);
        if (this._enemyList.length === 0) {
            GameMode.openDoorOfNextWave();
        }
    }

    /**
     * 在一定范围内寻找最近的敌方单位，没有敌人了则返回null
     * @param centerPos 刚体的世界坐标，一般是玩家操控英雄的质心位置
     * @param radius 查询范围，不传入该值则查询范围为全地图
     * @param unitsForExclude 排除在外的敌人列表
     */
    findNearestEnemy(centerPos: cc.Vec2, radius: number = -1, unitsForExclude: BaseNpc[] = []): BaseNpc {
        let nearestOne: BaseNpc = null;
        let nearestDistance: number = radius;
        for (let index in this._enemyList) {
            let newDistance = this._enemyList[index].rigidbody.getWorldCenter().sub(centerPos).mag();
            if ((nearestDistance < 0 || newDistance < nearestDistance) && unitsForExclude.indexOf(this._enemyList[index]) === -1) {
                nearestDistance = newDistance;
                nearestOne = this._enemyList[index];
            }
        }
        // cc.log("nearestOne: ",nearestOne.node.uuid);
        return nearestOne;
    }



    /**
     * 检查一个单位是否存在且未死亡。
     */
    isValid(entity: BaseEntity): boolean {
        if (!entity) {
            return false;
        }
        return !entity.isKilled();
    }
}

/**
 * 所有单位的管理实例，一般用于查询指定的实体
 */
let Entities: _Entities = new _Entities();
export default Entities;
import GameMode from "./GameMode";
import BaseEntity from "entity/BaseEntity";
import BaseNpc from "../entity/BaseNpc";
