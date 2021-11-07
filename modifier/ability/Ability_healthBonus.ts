import BaseAbility from "../BaseAbility";
export class Ability_healthBonus extends BaseAbility {
    public getModifierName(): string {
        return "Ability_healthBonus";
    }
    public getModifierExtraHealthPercentageBonus() {
        return 20 * this.getStackCount();
    }
}
