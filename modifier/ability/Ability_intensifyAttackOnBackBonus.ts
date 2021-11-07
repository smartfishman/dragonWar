import BaseAbility from "../BaseAbility";

export class Ability_intensifyAttackOnBackBonus extends BaseAbility {
    public getModifierName(): string {
        return "Ability_intensifyAttackOnBackBonus";
    }
    
    public getModifierIntensifyAttackOnBackBonus() {
        return 1 * this.getStackCount();
    }
}
