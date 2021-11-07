import BaseAbility from "../BaseAbility";

export class Ability_attackBonus extends BaseAbility {
    public getModifierName(): string {
        return "Ability_attackBonus";
    }
    public getModifierExtraAttackPercentageBonus() {
        return 20 * this.getStackCount();
    }
}
