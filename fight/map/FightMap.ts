const { ccclass, property } = cc._decorator;

@ccclass
export default class FightMap extends cc.Component {

    @property(cc.Node)
    blockForNextWave: cc.Node = null;

    @property(cc.Node)
    doorForNextWave: cc.Node = null;

    onLoad() {
        this.blockForNextWave.active = true;
        this.doorForNextWave.active = false;
    }

    start() {

    }

    // update (dt) {}
}
