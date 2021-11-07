import BaseAbility from "../BaseAbility";

export class Ability_intensifyAttackOnForwardBonus extends BaseAbility {
    public getModifierName(): string {
        return "Ability_intensifyAttackOnForwardBonus";
    }

    public getModifierIntensifyAttackOnForwardDirectionBonus() {
        return 1 * this.getStackCount();
    }

    public getModifierExtraAttackPercentageBonus() {
        return -9 * this.getStackCount();
    }
}
