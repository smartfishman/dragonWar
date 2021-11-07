import BaseAbility from "../BaseAbility";

export class Ability_countsOfReboundBonus extends BaseAbility {
    public getModifierName(): string {
        return "Ability_countsOfReboundBonus";
    }
    public getModifierCountsOfReboundBonus() {
        return 1 * this.getStackCount();
    }
}
