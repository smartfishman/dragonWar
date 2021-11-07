import BaseAbility from "../BaseAbility";

export class Ability_chanceOfCriticalStrikeBonus extends BaseAbility {
    public getModifierName(): string {
        return "Ability_chanceOfCriticalStrikeBonus";
    }
    public getModifierExtraChanceOfCriticalStrikePercentageBonus() {
        return 20 * this.getStackCount();
    }
}
