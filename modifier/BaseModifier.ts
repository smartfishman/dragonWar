import BaseNpc from "../entity/BaseNpc";
import * as MACRO from "../common/MACRO";

export default abstract class BaseModifier {
    //---------------------------基础属性修饰----------------------------start
    /**
     * 务必跟类名相同，区分大小写。
     */
    public abstract getModifierName(): string;

    /**
     * 基础生命值奖励
     */
    public getModifierBaseHealthBonus(): number {
        return 0;
    }

    /**
     * 额外百分比生命值奖励,
     */
    public getModifierExtraHealthPercentageBonus(): number {
        return 0;
    }

    /**
     * 基础攻击间隔奖励，负数为降低攻击间隔
     */
    public getModifierBaseIntervalOfAttackBonus(): number {
        return 0;
    }

    /**
     * 额外百分比攻击间隔奖励，正数为降低攻击间隔
     */
    public getModifierExtraIntervalOfAttackPercentageBonus(): number {
        return 0;
    }

    /**
     * 基础攻击力奖励
     */
    public getModifierBaseAttackBonus(): number {
        return 0;
    }

    /**
     * 额外百分比攻击力奖励
     */
    public getModifierExtraAttackPercentageBonus(): number {
        return 0;
    }

    /**
     * 基础暴击几率奖励
     */
    public getModifierChanceOfCriticalStrikeBonus(): number {
        return 0;
    }

    /**
     * 额外百分比暴击几率奖励
     */
    public getModifierExtraChanceOfCriticalStrikePercentageBonus(): number {
        return 0;
    }

    /**
     * 基础暴击倍率奖励
     */
    public getModifierDamageOfCriticalStrikeBonus(): number {
        return 0;
    }

    /**
     * 额外暴击倍率百分比奖励
     */
    public getModifierExtraDamageOfCriticalStrikePercentageBonus(): number {
        return 0;
    }

    /**
     * 伤害减免
     */
    public getModifierDamageReductionOfAllBonus(): number {
        return 0;
    }

    /**
     * 碰撞减免
     */
    public getModifierDamageReductionOfCrashBonus(): number {
        return 0;
    }

    /**
     * 子弹减免
     */
    public getModifierDamageReductionOfBulletBonus(): number {
        return 0;
    }

    /**
     * 正面攻击加强奖励
     */
    public getModifierIntensifyAttackOnForwardDirectionBonus(): number {
        return 0;
    }

    /**
     * 斜向攻击加强奖励
     */
    public getModifierIntensifyAttackOnAngel45Bonus(): number {
        return 0;
    }

    /**
     * 侧面攻击加强奖励
     */
    public getModifierIntensifyAttackOnAngel90Bonus(): number {
        return 0;
    }

    /**
     * 背后攻击加强奖励
     */
    public getModifierIntensifyAttackOnBackBonus(): number {
        return 0;
    }

    /**
     * 连续攻击+1奖励
     */
    public getModifierExtraCountsOfAttackBonus(): number {
        return 0;
    }

    /**
     * 障碍折射次数
     */
    public getModifierCountsOfReboundBonus(): number {
        return 0;
    }

    /**
     * 穿透攻击奖励
     */
    public getModifierPiercingAttackBonus(): number {
        return 0;
    }

    /**
     * 弹射攻击奖励
     */
    public getModifierEjectionAttackBonus(): number {
        return 0;
    }

    /**
     * 秒杀普通单位几率
     */
    public getModifierChanceOfSeckillBonus(): number {
        return 0;
    }

    //---------------------------基础属性修饰----------------------------end

    /**
     * BUff有持续时间，会有定时器不断核查BUFF的时效
     */
    public isBuff(): boolean {
        return false;
    }

    /**
     * 装备在发生穿戴和卸下事件时会对其响应
     */
    public isEquipment(): boolean {
        return false;
    }

    /**
     * 技能是永久存在的，添加后几乎不会被自动销毁
     */
    public isAbility(): boolean {
        return false;
    }

    /**
     * 标示当前modifier堆叠层数
     */
    private _stackCount: number = 0;
    /**
     * 获取该modifier在此单位上已堆叠的层数
     */
    public getStackCount(): number {
        return this._stackCount;
    }
    /**
     * 设置该modifier在此单位上已堆叠的层数
     */
    public setStackCount(value: number) {
        this._stackCount = value;
    }
    /**
     * 该modifier在此单位上已堆叠的层数+1
     */
    public incrementStackCount() {
        this._stackCount++;
    }

    private _disabled: boolean = false;
    /**
     * 该modifier是否已被禁用
     */
    public isDisabled() {
        return this._disabled;
    }
    /**
     * 设置该modifier的禁用的状态
     */
    public setDisabled(flag: boolean) {
        this._disabled = flag;
    }

    private _isActivated = true;
    /**
     * 该Modifier是否已激活，除了主动技能外，其他modifier都是默认已激活
     */
    public isActivated(): boolean {
        return this._isActivated;
    }
    public setActivated(flag: boolean) {
        this._isActivated = flag;
    }

    private _owner: BaseNpc = null;
    public getOwner(): BaseNpc {
        return this._owner;
    }

    constructor(owner: BaseNpc) {
        this._owner = owner;
        this.setStackCount(1);
    }

    /**
     * 持有者击杀某单位时会调用此函数
     * @param events 
     */
    public onKill(events: MACRO.EVENTDATA_KILL): void {
    }

    destroy() {
        this._owner.removeAbilityByName(this.getModifierName());
    }

    /**
     * 获取属性类型对应的值
     * @param propertyType 
     */
    public getPropertyByType(propertyType: MACRO.MODIFIER_PROPERTY_TYPE): number {
        if (this.isDisabled() || !this.isActivated()) {
            return 0;
        }
        switch (propertyType) {
            case MACRO.MODIFIER_PROPERTY_TYPE.BASE_HEALTH_BONUS:
                return this.getModifierBaseHealthBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.EXTRA_HEALTH_PERCENTAGE_BONUS:
                return this.getModifierExtraHealthPercentageBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.BASE_INTERVAL_OF_ATTACK_BONUS:
                return this.getModifierBaseIntervalOfAttackBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.EXTRA_INTERVAL_OF_ATTACK_PERCENTAGE_BONUS:
                return this.getModifierExtraIntervalOfAttackPercentageBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.BASE_ATTACK_BONUS:
                return this.getModifierBaseAttackBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.EXTRA_ATTACK_PERCENTAGE_BONUS:
                return this.getModifierExtraAttackPercentageBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.CHANCE_OF_CRITICAL_STRIKE_BONUS:
                return this.getModifierChanceOfCriticalStrikeBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.EXTRA_CHANCE_OF_CRITICAL_STRIKE_PERCENTAGE_BONUS:
                return this.getModifierExtraChanceOfCriticalStrikePercentageBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.DAMAGE_OF_CRITICAL_STRIKE_BONUS:
                return this.getModifierDamageOfCriticalStrikeBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.EXTRA_DAMAGE_OF_CRITICAL_STRIKE_PERCENTAGE_BONUS:
                return this.getModifierExtraDamageOfCriticalStrikePercentageBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.DAMAGE_REDUCTION_OF_ALL_BONUS:
                return this.getModifierDamageReductionOfAllBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.DAMAGE_REDUCTION_OF_CRASH_BONUS:
                return this.getModifierDamageReductionOfCrashBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.DAMAGE_REDUCTION_OF_BULLET_BONUS:
                return this.getModifierDamageReductionOfBulletBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.INTENSIFY_ATTACK_ON_FORWARD_DIRECTION_BONUS:
                return this.getModifierIntensifyAttackOnForwardDirectionBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.INTENSIFY_ATTACK_ON_ANGEL45_BONUS:
                return this.getModifierIntensifyAttackOnAngel45Bonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.INTENSIFY_ATTACK_ON_ANGEL90_BONUS:
                return this.getModifierIntensifyAttackOnAngel90Bonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.INTENSIFY_ATTACK_ON_BACK_BONUS:
                return this.getModifierIntensifyAttackOnBackBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.EXTRA_COUNTS_OF_ATTACK_BONUS:
                return this.getModifierExtraCountsOfAttackBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.COUNTS_OF_REBOUND_BONUS:
                return this.getModifierCountsOfReboundBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.PIERCING_ATTACK_BONUS:
                return this.getModifierPiercingAttackBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.EJECTION_ATTACK_BONUS:
                return this.getModifierEjectionAttackBonus();
            case MACRO.MODIFIER_PROPERTY_TYPE.CHANCE_OF_SECKILL_BONUS:
                return this.getModifierChanceOfSeckillBonus();
            default:
                cc.error("propertyType 值不合法:", propertyType, MACRO.MODIFIER_PROPERTY_TYPE[propertyType]);
                return 0;
        }
    }
}
