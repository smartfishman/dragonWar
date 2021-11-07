import BaseAbility from "../BaseAbility";

export class Ability_ejectionAttackBonus extends BaseAbility {
    public getModifierName(): string {
        return "Ability_ejectionAttackBonus";
    }
    public getModifierEjectionAttackBonus() {
        return 1 * this.getStackCount();
    }
}
