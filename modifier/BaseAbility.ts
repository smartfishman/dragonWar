import BaseModifier from "./BaseModifier";
import BaseNpc from "../entity/BaseNpc";

export default abstract class BaseAbility extends BaseModifier {
    public isAbility():boolean{
        return true;
    }

    /**
     * 该游戏大部分都是被动技能，只有极少数主动技能。
     * 被动技能是自动激活的，主动技能必须使用以后才会激活
     */
    public isPassive():boolean{
        return true;
    }

    constructor(owner:BaseNpc){
        super(owner);
        this.setActivated(this.isPassive());
    }

}