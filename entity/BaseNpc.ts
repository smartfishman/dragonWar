/// <reference path="BaseEntity.ts" />
import BaseEntity from "./BaseEntity";
const { ccclass, property } = cc._decorator;

/**
 * 大部分npc单位需要继承的直接父类，包含了攻击力，生命值等数值属性，以及技能招式释放，以及装备接口。
 */
@ccclass
export default abstract class BaseNpc extends BaseEntity {
    @property(cc.Prefab)
    healthBarPrefab: cc.Prefab = null;

    private _healthBar: cc.ProgressBar = null;
    /**
     * 自动更新攻击目标的间隔时间，除此之外，每一次移动也会自动更新攻击目标。
     * 对玩家操控的英雄无效
     */
    private _intervalOfUpdateTarget: number = 3;
    private _countTimeForUpdateTarget: number = 0;
    /**
     * 技能列表
     */
    private _abilityList: { [key: string]: BaseAbility } = {};
    /**
     * BUFF列表
     */
    private _buffList: { [key: string]: BaseBuff } = {};
    /**
     * 装备列表
     */
    private _equipmentList: { [key: string]: BaseEquipment } = {};
    /**
     * 缓存modifier的属性值
     */
    private _modifierPorperty_cache: number[] = [];


    //----------------------------------抽象函数---------------------------------start
    /**
     * 对单位的攻击力，攻击间隔，生命值等完成定制的初始化(大部分已在编辑器里配置)
     */
    protected abstract initProps(): void;
    /**
     * 设置模型动作为受到攻击时的状态
     */
    public abstract setAnimationToBeAttacked(): void;
    //----------------------------------抽象函数---------------------------------end


    @property({
        displayName: "基础攻击间隔",
        type: cc.Float,
    })
    protected intervalOfAttack = 0.8;
    /**
     * 攻击间隔，单位为秒
     */
    protected get _intervalOfAttack(): number {
        return this.intervalOfAttack + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.BASE_INTERVAL_OF_ATTACK_BONUS);
    }
    protected set _intervalOfAttack(value: number) {
        this._intervalOfAttackWA_cache = null;
        this.intervalOfAttack = value;
    }
    private _intervalOfAttack_addition: number = 100;
    private _intervalOfAttackWA_cache: number = null;
    /**
     * 攻击间隔加成，百分比加成，基础值100。
     * @example this._intervalOfAttack_addition_cache = 1 / ((1 / this.intervalOfAttack) * (this.additionForIntervalOfAttack / 100))
     */
    public get additionForIntervalOfAttack(): number {
        return this._intervalOfAttack_addition + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.EXTRA_INTERVAL_OF_ATTACK_PERCENTAGE_BONUS);
    }
    public set additionForIntervalOfAttack(value: number) {
        this._intervalOfAttackWA_cache = null;
        this._intervalOfAttack_addition = value;
    }
    public getIntervalOfAttackWA(): number {
        if (this._intervalOfAttackWA_cache !== null) {
            return this._intervalOfAttackWA_cache;
        } else {
            this._intervalOfAttackWA_cache = 1 / ((1 / this._intervalOfAttack) * (this.additionForIntervalOfAttack / 100))
            return this._intervalOfAttackWA_cache;
        }
    }



    @property({
        displayName: "基础生命值",
    })
    protected baseHp: number = 1000;
    /**
     * 基础生命值
     */
    protected get _baseHp(): number {
        return this.baseHp + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.BASE_HEALTH_BONUS);
    }
    protected set _baseHp(value: number) {
        this._baseHpWA_cache = null;
        this.baseHp = value;
    }
    private _baseHp_addition: number = 100;
    private _baseHpWA_cache: number = null;
    /**
     * 生命值加成，百分比加成，基础值100。
     * 最终生命值 = 基础生命值*生命值加成/100
     */
    public get additionForBaseHp(): number {
        return this._baseHp_addition + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.EXTRA_HEALTH_PERCENTAGE_BONUS);
    }
    public set additionForBaseHp(value: number) {
        this._baseHpWA_cache = null;
        this._baseHp_addition = value;
    }
    /**
     * 获取计算加成数值后的生命值上限
     */
    public getBaseHpWA(): number {
        if (this._baseHpWA_cache !== null) {
            return this._baseHpWA_cache;
        } else {
            this._baseHpWA_cache = this._baseHp * this.additionForBaseHp / 100;
            return this._baseHpWA_cache;
        }
    }


    /**
     * 当前生命值
     */
    public get currentHp(): number {
        return this.getBaseHpWA() * this._currentHpPercentage;
    }
    private _currentHpPercentage = 1;
    public set currentHp(value) {
        let currentHp = value > this.getBaseHpWA() ? this.getBaseHpWA() : value;
        this._currentHpPercentage = currentHp / this.getBaseHpWA();
        this.updateHealthBar();
    }



    @property({
        displayName: "基础攻击力",
    })
    protected baseAttack = 200;
    /**
     * 基础攻击力
     */
    protected get _baseAttack(): number {
        return this.baseAttack + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.BASE_ATTACK_BONUS);
    }
    protected set _baseAttack(value: number) {
        this._baseAttackWA_cache = null;
        this.baseAttack = value;
    }

    private _baseAttack_addition: number = 100;
    private _baseAttackWA_cache: number = null;
    /**
     * 攻击力加成，百分比加成，基础值100
     */
    public get additionForBaseAttack(): number {
        return this._baseAttack_addition + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.EXTRA_ATTACK_PERCENTAGE_BONUS);
    }
    public set additionForBaseAttack(value: number) {
        this._baseAttackWA_cache = null;
        this._baseAttack_addition = value;
    }
    /**
     * 获取计算加成数值后的攻击力
     */
    public getBaseAttackWA(): number {
        if (this._baseAttackWA_cache !== null) {
            return this._baseAttackWA_cache;
        } else {
            this._baseAttackWA_cache = this._baseAttack * this.additionForBaseAttack / 100;
            return this._baseAttackWA_cache;
        }
    }



    @property({
        displayName: "基础暴击几率"
    })
    protected chanceOfCriticalStrike: number = 10;
    /**
     * 基础暴击几率，百分比数值
     */
    protected get _chanceOfCriticalStrike(): number {
        return this.chanceOfCriticalStrike + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.CHANCE_OF_CRITICAL_STRIKE_BONUS);
    }
    protected set _chanceOfCriticalStrike(value: number) {
        this._chanceOfCriticalStrikeWA_cache = null;
        this.chanceOfCriticalStrike = value;
    }
    private _chanceOfCriticalStrike_addition: number = 100;
    private _chanceOfCriticalStrikeWA_cache: number = null;
    /**
     * 基于基础暴击几率的加成，百分比加成，基础值100。
     * 最终暴击几率=基础暴击几率*暴击几率加成/100
     */
    public get additionForChanceOfCriticalStrike(): number {
        return this._chanceOfCriticalStrike_addition + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.EXTRA_CHANCE_OF_CRITICAL_STRIKE_PERCENTAGE_BONUS);
    }
    public set additionForChanceOfCriticalStrike(value: number) {
        this._chanceOfCriticalStrikeWA_cache = null;
        this._chanceOfCriticalStrike_addition = value;
    }
    /**
     * 获取计算加成数值后的暴击几率
     */
    public getChanceOfCriticalStrikeWA(): number {
        if (this._chanceOfCriticalStrikeWA_cache !== null) {
            return this._chanceOfCriticalStrikeWA_cache;
        } else {
            this._chanceOfCriticalStrikeWA_cache = this._chanceOfCriticalStrike * this.additionForChanceOfCriticalStrike / 100;
            return this._chanceOfCriticalStrikeWA_cache;
        }
    }



    @property({
        displayName: "基础暴击伤害倍率"
    })
    protected damageOfCriticalStrike: number = 150;
    /**
     * 基础暴击伤害倍率
     */
    protected get _damageOfCriticalStrike(): number {
        return this.damageOfCriticalStrike + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.DAMAGE_OF_CRITICAL_STRIKE_BONUS);
    }
    protected set _damageOfCriticalStrike(value: number) {
        this._damageOfCriticalStrikeWA_cache = null;
        this.damageOfCriticalStrike = value;
    }

    private _damageOfCriticalStrike_addition: number = 100;
    private _damageOfCriticalStrikeWA_cache: number = null;
    /**
     * 暴击伤害加成，基础值100.  最终暴击倍率=基础暴击伤害倍率* 暴击伤害加成/100
     */
    public get additionForDamageOfCriticalStrike(): number {
        return this._damageOfCriticalStrike_addition + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.EXTRA_DAMAGE_OF_CRITICAL_STRIKE_PERCENTAGE_BONUS);
    }
    public set additionForDamageOfCriticalStrike(value) {
        this._damageOfCriticalStrikeWA_cache = null;
        this._damageOfCriticalStrike_addition = value;
    }
    /**
     * 获取计算加成数值后的暴击伤害倍率
     */
    public getDamageOfCriticalStrikeWA() {
        if (this._damageOfCriticalStrikeWA_cache !== null) {
            return this._damageOfCriticalStrikeWA_cache;
        } else {
            this._damageOfCriticalStrikeWA_cache = this._damageOfCriticalStrike * this.additionForDamageOfCriticalStrike / 100;
            return this._damageOfCriticalStrikeWA_cache;
        }
    }


    /**
     * 所有伤害类型都会受到减免
     */
    @property({
        displayName: "伤害减免"
    })
    protected damageReductionOfAll: number = 0;
    protected get _damageReductionOfAll(): number {
        return this.damageReductionOfAll + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.DAMAGE_REDUCTION_OF_ALL_BONUS);
    }


    /**
     * 碰撞减免
     */
    @property({
        displayName: "碰撞减免"
    })
    protected damageReductionOfCrash: number = 0;
    protected get _damageReductionOfCrash(): number {
        return this.damageReductionOfCrash + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.DAMAGE_REDUCTION_OF_CRASH_BONUS);
    }


    /**
     * 子弹减免
     */
    @property({
        displayName: "子弹减免"
    })
    protected damageReductionOfBullet: number = 0;
    protected get _damageReductionOfBullet(): number {
        return this.damageReductionOfBullet + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.DAMAGE_REDUCTION_OF_BULLET_BONUS);
    }


    @property({
        displayName: "正向攻击增强"
    })
    protected intensifyAttackOnForwardDirection = 0;
    /**
     * 正向攻击增强，每增加1则在正面方向多发射一枚子弹
     */
    public get _intensifyAttackOnForwardDirection(): number {
        return this.intensifyAttackOnForwardDirection + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.INTENSIFY_ATTACK_ON_FORWARD_DIRECTION_BONUS);
    }
    public set _intensifyAttackOnForwardDirection(value: number) {
        this.intensifyAttackOnForwardDirection = value;
    }


    @property({
        displayName: "斜向攻击增强"
    })
    protected intensifyAttackOnAngle45 = 0;
    /**
     * 斜向攻击增强，每增加1则在与正向成45度夹角的两边各多发射一枚子弹
     */
    public get _intensifyAttackOnAngle45(): number {
        return this.intensifyAttackOnAngle45 + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.INTENSIFY_ATTACK_ON_ANGEL45_BONUS);
    }
    public set _intensifyAttackOnAngle45(value: number) {
        this.intensifyAttackOnAngle45 = value;
    }


    @property({
        displayName: "两侧攻击增强"
    })
    protected intensifyAttackOnAngle90 = 0;
    /**
     * 斜向攻击增强，每增加1则在与正向成90度夹角的两边各多发射一枚子弹
     */
    public get _intensifyAttackOnAngle90(): number {
        return this.intensifyAttackOnAngle90 + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.INTENSIFY_ATTACK_ON_ANGEL90_BONUS);
    }
    public set _intensifyAttackOnAngle90(value: number) {
        this.intensifyAttackOnAngle90 = value;
    }


    @property({
        displayName: "背后攻击增强"
    })
    protected intensifyAttackOnBack = 0;
    /**
     * 背后攻击增强，每增加1则在后方多发射一枚子弹
     */
    public get _intensifyAttackOnBack(): number {
        return this.intensifyAttackOnBack + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.INTENSIFY_ATTACK_ON_BACK_BONUS);
    }
    public set _intensifyAttackOnBack(value: number) {
        this.intensifyAttackOnBack = value;
    }


    @property({
        displayName: "连续攻击+1"
    })
    protected extraCountsOfAttack = 0;
    /**
     * 连续攻击，每增加1则在所有方向上多发射一次子弹
     */
    public get _extraCountsOfAttack(): number {
        return this.extraCountsOfAttack + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.EXTRA_COUNTS_OF_ATTACK_BONUS);
    }


    @property({
        displayName: "障碍折射"
    })
    protected countsOfRebound = 0;
    /**
     * 障碍折射，每增加1则子弹遇到障碍物时反弹次数+1
     */
    public get _countsOfRebound(): number {
        return this.countsOfRebound + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.COUNTS_OF_REBOUND_BONUS);
    }


    @property({
        displayName: "穿透攻击"
    })
    protected piercingAttack = 0;
    /**
     * 穿透攻击，当数值大于0时，子弹可穿透所有敌方单位
     */
    public get _piercingAttack(): number {
        return this.piercingAttack + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.PIERCING_ATTACK_BONUS);
    }


    @property({
        displayName: "弹射攻击"
    })
    protected ejectionAttack = 0;
    /**
     * 弹射攻击，每增加1，子弹弹射次数+1
     */
    public get _ejectionAttack(): number {
        return this.ejectionAttack + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.EJECTION_ATTACK_BONUS);
    }


    @property({
        displayName: "秒杀普通单位几率"
    })
    protected chanceOfSeckill = 0;
    /**
     * 秒杀普通单位几率，取值0-100
     */
    public get _chanceOfSeckill(): number {
        return this.chanceOfSeckill + this.getModifierPropertyByType(MACRO.MODIFIER_PROPERTY_TYPE.CHANCE_OF_SECKILL_BONUS);
    }


    /**
     * 对该单位施加伤害
     */
    public applyDamage(attacker: BaseNpc, damage: number, damageType: MACRO.DAMAGE_TYPE) {
        if (this.isKilled()) {
            return;
        }
        switch (damageType) {
            case MACRO.DAMAGE_TYPE.NORMAL:
                damage -= this._damageReductionOfAll;
                break;
            case MACRO.DAMAGE_TYPE.BULLET:
                damage -= (this._damageReductionOfAll + this._damageReductionOfBullet);
                break;
            case MACRO.DAMAGE_TYPE.CRASH:
                damage -= (this._damageReductionOfAll + this._damageReductionOfCrash);
                break;
            case MACRO.DAMAGE_TYPE.PURE:
                break;
            default:
                break;
        }
        if (!this.isBOSS() && damageType === MACRO.DAMAGE_TYPE.BULLET) {
            let isSeckill: boolean = Math.random() * 100 < attacker._chanceOfSeckill;
            if (isSeckill) {
                damage = 999999;
            }
        }
        if (damage <= 0) {
            return;
        }
        if (this.currentHp > damage) {
            this.currentHp -= damage;
            this.setAnimationToBeAttacked();
        } else {
            this.currentHp = 0;
            let events: MACRO.EVENTDATA_KILL = {
                killer: attacker,
                killedEntity: this,
                damage: damage,
            }
            this.killed(events);
            attacker.onKill(events);
        }
    }

    protected onCrashWithBullet(bullet: BaseBullet, contact: cc.PhysicsContact): void {
        contact.disabled = true;
        if (!Entities.isValid(bullet.getOwner())) {
            return;
        }
        this.applyDamage(bullet.getOwner(), bullet.getDamage(), MACRO.DAMAGE_TYPE.BULLET);
        bullet.onCrashWithUnit(this);
    }

    protected onCrashWithUnit(unit: BaseEntity, contact: cc.PhysicsContact): void {
        //英雄才处理与敌人的碰撞结果,已在BaseNpc_Hero中实现
    }


    public isNPC(): boolean {
        return true;
    }

    public isBOSS(): boolean {
        return false;
    }

    /**
     * 是否展示生命条
     * @param flag 
     */
    public setHealthBar(flag: boolean) {
        this._healthBar.node.active = flag;
    }
    /**
     * 生命条跟随刚体
     */
    private updateHealthBarPos(): void {
        this._healthBar.node.position = this.node.position.add(cc.v2(0, this.node.height / 2 + 20));
    }

    /**
     * 更新生命条数值
     */
    private updateHealthBar(): void {
        this._healthBar.progress = this._currentHpPercentage;
    }

    /**
     * 生命条初始化
     */
    private initHealthBar(): void {
        let newNode = cc.instantiate(this.healthBarPrefab);
        newNode.active = true;
        newNode.parent = this.node.parent;
        this._healthBar = newNode.getComponent(cc.ProgressBar);
        this.updateHealthBar();
        this.updateHealthBarPos();
    }

    /**
     * NPC专用接口，会变更当前的攻击目标为离自己较近的英雄，变更频率由_intervalOfUpdateTarget决定
     */
    protected updateTargetOfNPC(): void {
        if (this.isHero()) {
            return;
        }
        let playerCounts = GameMode.getPlayerCounts();
        let target: BaseEntity = null;
        let nearerDistance: number = -1;
        for (let i = 0; i < playerCounts; i++) {
            let hero = GameMode.getHeroByPlayerID(i);
            if (hero.isKilled()) {
                continue;
            }
            let distance = hero.rigidbody.getWorldCenter().sub(this.rigidbody.getWorldCenter()).mag();
            if (nearerDistance < 0 || nearerDistance > distance) {
                nearerDistance = distance;
                target = hero;
            }
        }
        this.curTargetToAttack = target;
    }

    /**
     * 获取一个单位一次普攻造成的伤害
     */
    public getDamageOfNormalAttack(): number {
        let result: number = this.getBaseAttackWA();
        let isCriticalStrike: boolean = Math.random() * 100 < this.getChanceOfCriticalStrikeWA();
        if (isCriticalStrike) {
            result *= this.getDamageOfCriticalStrikeWA() / 100;
        }
        return result;
    }

    /**
     * 添加技能类型的modifier
     */
    public addAbilityByName(abilityName: string): void {
        if (Modifiers[abilityName] === undefined || !(Modifiers[abilityName].prototype instanceof BaseAbility)) {
            cc.error(`不存在 ${abilityName} 对应的技能。`);
            return;
        }
        if (this._abilityList[abilityName]) {
            this._abilityList[abilityName].incrementStackCount();
        } else {
            let ability: BaseAbility = new Modifiers[abilityName](this);
            this._abilityList[abilityName] = ability;
        }
        this.node.emit(MACRO.NPC_EVENTTYPE.ON_MODIFIER_CHANGE);
        return;
    }

    /**
     * 删除技能
     * @param propertyType 
     */
    public removeAbilityByName(abilityName: string): void {
        if (this._abilityList[abilityName]) {
            delete this._abilityList[abilityName];
            this.node.emit(MACRO.NPC_EVENTTYPE.ON_MODIFIER_CHANGE);
        }
    }

    /**
     * 根据属性类型，获取modifier中对应的返回值
     * @param propertyType 
     */
    private getModifierPropertyByType(propertyType: MACRO.MODIFIER_PROPERTY_TYPE): number {
        if (this._modifierPorperty_cache[propertyType] !== undefined) {
            return this._modifierPorperty_cache[propertyType];
        }
        this._modifierPorperty_cache[propertyType] = 0;
        for (let index in this._abilityList) {
            this._modifierPorperty_cache[propertyType] += this._abilityList[index].getPropertyByType(propertyType);
        }
        for (let index in this._buffList) {
            this._modifierPorperty_cache[propertyType] += this._buffList[index].getPropertyByType(propertyType);
        }
        for (let index in this._equipmentList) {
            this._modifierPorperty_cache[propertyType] += this._buffList[index].getPropertyByType(propertyType);
        }
        return this._modifierPorperty_cache[propertyType];
    }

    //----------------------------------事件响应---------------------------------start
    /**
     * 单位身上的modifier已发生变化，下一次取属性值时，重新计算各项属性加成。
     */
    public onModifierChanged(): void {
        this._modifierPorperty_cache = [];
        this._baseHpWA_cache = null;
        this._baseAttackWA_cache = null;
        this._intervalOfAttackWA_cache = null;
        this._chanceOfCriticalStrikeWA_cache = null;
        this._damageOfCriticalStrikeWA_cache = null;
        this.updateHealthBar();
    }

    /**
     * 该单位击杀了另一个单位
     */
    public onKill(events: MACRO.EVENTDATA_KILL): void {
        for (let index in this._abilityList) {
            this._abilityList[index].onKill(events);
        }
        for (let index in this._buffList) {
            this._buffList[index].onKill(events);
        }
        for (let index in this._equipmentList) {
            this._equipmentList[index].onKill(events);
        }
    }

    //----------------------------------事件响应---------------------------------end
    onLoad() {
        super.onLoad();
        this.node.on(MACRO.NPC_EVENTTYPE.ON_MODIFIER_CHANGE, this.onModifierChanged, this);
        this.initProps();
        this.initHealthBar();
    }

    /**
     * 更改该节点的父节点时，需要做一些额外操作
     */
    setNodeParent(NewParent: cc.Node) {
        this.node.parent = NewParent;
        this._healthBar.node.parent = NewParent;
    }

    update(dt: number) {
        super.update(dt);
        if (!this.isHero()) {//非英雄会自动更新攻击目标
            this._countTimeForUpdateTarget += dt;
            if (this._countTimeForUpdateTarget > this._intervalOfUpdateTarget) {
                this.updateTargetOfNPC();
            }
        }
    }

    lateUpdate() {
        super.lateUpdate();
        if (this.rigidbody.linearVelocity.mag() != 0) {
            this.updateHealthBarPos();
        }
    }

    onDestroy() {
        super.onDestroy();
        this._healthBar.node.destroy();
        this.node.off(MACRO.NPC_EVENTTYPE.ON_MODIFIER_CHANGE, this.onModifierChanged, this);
    }
}

import BaseBullet from "./BaseBullet";
import BaseAbility from "../modifier/BaseAbility";
import * as MACRO from "../common/MACRO";
import * as Modifiers from "../utils/Modifiers";
import BaseBuff from "../modifier/BaseBuff";
import BaseEquipment from "../modifier/BaseEquipment";
import GameMode from "../manager/GameMode";
import Entities from "../manager/Entities";
