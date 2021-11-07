import BaseAbility from "../BaseAbility";

export class Ability_piercingAttackBonus extends BaseAbility {
    public getModifierName(): string {
        return "Ability_piercingAttackBonus";
    }
    public getModifierPiercingAttackBonus() {
        return 1 * this.getStackCount();
    }
}
