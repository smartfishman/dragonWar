class _GameMode {
    /**
     * 场景节点的脚本
     */
    private _fightScript: Fight = null;
    /**
     * 技能池
     */
    private _abilityPool: { abilityName: string, count: number }[] = [
        { abilityName: "Ability_attackBonus", count: 500 },
        { abilityName: "Ability_chanceOfCriticalStrikeBonus", count: 500 },
        { abilityName: "Ability_chanceOfSeckillBonus", count: 1 },
        { abilityName: "Ability_countsOfReboundBonus", count: 1 },
        { abilityName: "Ability_ejectionAttackBonus", count: 1 },
        { abilityName: "Ability_extraCountsOfAttackBonus", count: 2 },
        { abilityName: "Ability_healthBonus", count: 5 },
        { abilityName: "Ability_imcreamentHpByKill", count: 1 },
        { abilityName: "Ability_intensifyAttackOnAngel45Bonus", count: 2 },
        { abilityName: "Ability_intensifyAttackOnAngel90Bonus", count: 2 },
        { abilityName: "Ability_intensifyAttackOnBackBonus", count: 2 },
        { abilityName: "Ability_intensifyAttackOnForwardBonus", count: 2 },
        { abilityName: "Ability_intervalOfAttackBonus", count: 5 },
        { abilityName: "Ability_piercingAttackBonus", count: 1 }
    ];

    public getFightScript(): Fight {
        return this._fightScript;
    }

    /**
     * 初始化
     * @param script 
     */
    public initMode(script: Fight): void {
        this._fightScript = script;
    }

    /**
     * 所有玩家操控的英雄放至这个数组（为多人模式做准备）
     */
    private _heros: BaseNpc_Hero[] = [];

    public addHero(hero: BaseNpc_Hero) {
        this._heros.push(hero);
    }

    public getHeroByPlayerID(playerID: number): BaseNpc_Hero {
        return this._heros[playerID];
    }

    /**
     * 获取本地玩家拥有的英雄
     */
    public getAssignedHero(): BaseNpc_Hero {
        return this.getHeroByPlayerID(0);
    }

    /**
     * 获取玩家数量
     */
    public getPlayerCounts(): number {
        return this._heros.length;
    }

    /**
     * 加载地图
     */
    public loadMap(mapName: string, callBack: (prefab: cc.Prefab) => void, caller: any): void {
        cc.loader.loadRes(`prefab/maps/${mapName}`, function (err, prefab: cc.Prefab) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            callBack.call(caller, prefab);
        });
    }

    /**
     * 获取控制战斗场景角度的摄像机
     */
    public getCameraOfMap(): cc.Camera {
        return this._fightScript.cameraOfMap;
    }

    /**
     * 每一关地图重置基础数据,保留旧地图需要保存的数据，比如英雄节点等
     */
    public newWaveReset(): void {
        for (let index in this._heros) {
            this._heros[index].setNodeParent(null);
        }
    }

    /**
     * 初始化新地图数据
     */
    public newWaveInit(newMap: cc.Node): void {
        let newHero = newMap.getChildByName("heroList").children[0].getComponent(BaseNpc_Hero);
        let oldHero = this.getAssignedHero();
        if (oldHero) {
            oldHero.setNodeParent(newHero.node.parent);
            oldHero.node.position = newHero.node.position;
            oldHero.node.rotation = newHero.node.rotation;
            newHero.node.destroy();
        } else {
            this.addHero(newHero);
        }
    }

    /**
     * 当前关卡完成，开启下一关通道
     */
    public openDoorOfNextWave(): void {
        UIManager.newUI(MACRO.UI_PATH.abilitySelectorPanel, this._fightScript.node, function (ui) { });
        this._fightScript.openDoorOfNextWave();
    }

    /**
     * 进入下一关
     */
    public nextWaveStart(): void {
        this.loadMap("default/default_1", this._fightScript.onMapLoadComplete, this._fightScript);
    }

    /**
     * 从技能池中随机两个技能返回
     */
    public getRandAbilityNameFromPool(): [string, string] {
        let rand_1 = Math.floor(Math.random() * (this._abilityPool.length));
        let rand_2 = (rand_1 + Math.floor(Math.random() * (this._abilityPool.length - 1)) + 1) % this._abilityPool.length;
        return [this._abilityPool[rand_1].abilityName, this._abilityPool[rand_2].abilityName];
    }

    /**
     * 减少技能池中某个技能的持有数量
     * @param abilityName 
     */
    public decrementCountOfAbilityFromPool(abilityName: string): void {
        let removeIndex = -1;
        for (let index in this._abilityPool) {
            if (abilityName === this._abilityPool[index].abilityName) {
                this._abilityPool[index].count--;
                if (this._abilityPool[index].count <= 0) {
                    removeIndex = Number(index);
                }
                break;
            }
        }
        if (removeIndex > -1) {
            this._abilityPool.splice(removeIndex, 1);
        }
    }
}

/**
 * 战斗场景的主体管理实例，用来加载地图等。
 */
let GameMode: _GameMode = new _GameMode();
export default GameMode;
import Fight from "../fight/Fight";
import BaseNpc_Hero from "../entity/BaseNpc_Hero";
import UIManager from "./UiManager";
import * as MACRO from "../common/MACRO"; import BaseAbility from "modifier/BaseAbility";

