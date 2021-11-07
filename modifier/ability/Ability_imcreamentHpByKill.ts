import BaseAbility from "../BaseAbility";
import * as MACRO from "../../common/MACRO";

export class Ability_imcreamentHpByKill extends BaseAbility {
    public getModifierName(): string {
        return "Ability_imcreamentHpByKill";
    }

    public onKill(events: MACRO.EVENTDATA_KILL): void {
        let hp_regain = events.killedEntity.getBaseHpWA() * 0.01;
        this.getOwner().currentHp = this.getOwner().currentHp + hp_regain;
    }
}
