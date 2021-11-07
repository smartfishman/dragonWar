import BaseAbility from "../BaseAbility";

export class Ability_chanceOfSeckillBonus extends BaseAbility {
    public getModifierName(): string {
        return "Ability_chanceOfSeckillBonus";
    }
    public getModifierChanceOfSeckillBonus() {
        return 1 * this.getStackCount();
    }
}
