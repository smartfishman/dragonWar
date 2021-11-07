import BaseAbility from "../BaseAbility";

export class Ability_intensifyAttackOnAngel90Bonus extends BaseAbility {
    public getModifierName(): string {
        return "Ability_intensifyAttackOnAngel90Bonus";
    }
    
    public getModifierIntensifyAttackOnAngel90Bonus() {
        return 1 * this.getStackCount();
    }
}
