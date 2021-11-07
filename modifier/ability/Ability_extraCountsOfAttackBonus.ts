import BaseAbility from "../BaseAbility";

export class Ability_extraCountsOfAttackBonus extends BaseAbility {
    public getModifierName(): string {
        return "Ability_extraCountsOfAttackBonus";
    }

    public getModifierExtraCountsOfAttackBonus() {
        return 1 * this.getStackCount();
    }

    public getModifierExtraAttackPercentageBonus() {
        return -12 * this.getStackCount();
    }
}
