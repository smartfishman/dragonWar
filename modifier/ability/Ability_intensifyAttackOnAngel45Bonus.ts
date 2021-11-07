import BaseAbility from "../BaseAbility";

export class Ability_intensifyAttackOnAngel45Bonus extends BaseAbility {
    public getModifierName(): string {
        return "Ability_intensifyAttackOnAngel45Bonus";
    }
    
    public getModifierIntensifyAttackOnAngel45Bonus() {
        return 1 * this.getStackCount();
    }
}
