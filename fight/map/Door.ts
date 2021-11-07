import BaseNpc_Hero from "../../entity/BaseNpc_Hero";
import GameMode from "../../manager/GameMode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Door extends cc.Component {
    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        contact.disabled = true;
        if (otherCollider.getComponent(BaseNpc_Hero)) {
            GameMode.nextWaveStart();
        }
    }

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
