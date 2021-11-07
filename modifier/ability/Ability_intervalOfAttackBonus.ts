import BaseAbility from "../BaseAbility";

export class Ability_intervalOfAttackBonus extends BaseAbility {
    public getModifierName(): string {
        return "Ability_intervalOfAttackBonus";
    }
    public getModifierExtraIntervalOfAttackPercentageBonus() {
        return 20 * this.getStackCount();
    }
}
