import GameMode from "../../manager/GameMode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AbilitySelectorPanel extends cc.Component {
    @property([cc.SpriteFrame])
    aAbilitySpriteFrames: cc.SpriteFrame[] = [];

    @property(cc.Sprite)
    ability_1_sprite: cc.Sprite = null;

    @property(cc.Sprite)
    ability_2_sprite: cc.Sprite = null;

    private _abilityList: [string, string] = null;

    onLoad() {
        this.initAbilityList();
    }

    start() {

    }


    initAbilityList() {
        this._abilityList = GameMode.getRandAbilityNameFromPool();
        for (let index in this.aAbilitySpriteFrames) {
            if (this.aAbilitySpriteFrames[index].name === this._abilityList[0]) {
                this.ability_1_sprite.spriteFrame = this.aAbilitySpriteFrames[index];
            } else if (this.aAbilitySpriteFrames[index].name === this._abilityList[1]) {
                this.ability_2_sprite.spriteFrame = this.aAbilitySpriteFrames[index];
            }
        }
    }

    onAbilitySelected(event: cc.Event.EventTouch, abiityIndex: number) {
        let abilityName = this._abilityList[abiityIndex];
        GameMode.getAssignedHero().addAbilityByName(abilityName);
        GameMode.decrementCountOfAbilityFromPool(abilityName);
        this.node.destroy();
    }



    // update (dt) {}
}
