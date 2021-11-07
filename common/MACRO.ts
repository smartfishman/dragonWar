import BaseNpc from "../entity/BaseNpc";

/**
 * 标示模型当前正在执行的动画
 */
export const enum ANIMATION_STATE { IDLE, MOVE, BE_ATTACKED };

/**
 * 单位事件
 */
export const enum NPC_EVENTTYPE {
    ON_MODIFIER_CHANGE = "npc_event_on_modifier_change",
};

/**
 * modifier中属性类型
 */
export const enum MODIFIER_PROPERTY_TYPE {
    BASE_HEALTH_BONUS,
    EXTRA_HEALTH_PERCENTAGE_BONUS,
    BASE_INTERVAL_OF_ATTACK_BONUS,
    EXTRA_INTERVAL_OF_ATTACK_PERCENTAGE_BONUS,
    BASE_ATTACK_BONUS,
    EXTRA_ATTACK_PERCENTAGE_BONUS,
    CHANCE_OF_CRITICAL_STRIKE_BONUS,
    EXTRA_CHANCE_OF_CRITICAL_STRIKE_PERCENTAGE_BONUS,
    DAMAGE_OF_CRITICAL_STRIKE_BONUS,
    EXTRA_DAMAGE_OF_CRITICAL_STRIKE_PERCENTAGE_BONUS,
    DAMAGE_REDUCTION_OF_ALL_BONUS,
    DAMAGE_REDUCTION_OF_CRASH_BONUS,
    DAMAGE_REDUCTION_OF_BULLET_BONUS,
    INTENSIFY_ATTACK_ON_FORWARD_DIRECTION_BONUS,
    INTENSIFY_ATTACK_ON_ANGEL45_BONUS,
    INTENSIFY_ATTACK_ON_ANGEL90_BONUS,
    INTENSIFY_ATTACK_ON_BACK_BONUS,
    EXTRA_COUNTS_OF_ATTACK_BONUS,
    COUNTS_OF_REBOUND_BONUS,
    PIERCING_ATTACK_BONUS,
    EJECTION_ATTACK_BONUS,
    CHANCE_OF_SECKILL_BONUS,
};

/**
 * 伤害类型
 */
export const enum DAMAGE_TYPE {
    /**
     * 受伤害减免影响
     */
    NORMAL,
    /**
     * 受伤害减免和子弹减免影响
     */
    BULLET,
    /**
     * 受伤害减免和碰撞减免影响
     */
    CRASH,
    /**
     * 不受任何减免影响
     */
    PURE,
}

/**
 * 击杀事件传递的数据结构体
 */
export interface EVENTDATA_KILL {
    killer: BaseNpc,
    killedEntity: BaseNpc,
    damage: number,
}

export interface UI_PATH_STRUCT {
    url: string,
    zIndex: number
}
/**
 * UI资源路径
 */
export const UI_PATH: { [key: string]: UI_PATH_STRUCT } = {
    abilitySelectorPanel: { url: "prefab/ui/fight/abilitySelectorPanel", zIndex: 8000 }
}