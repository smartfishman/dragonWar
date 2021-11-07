import BaseBullet from "../BaseBullet";

const { ccclass, property } = cc._decorator;

/**
 * 普通子弹，直线飞行，遇到障碍物可进行弹射，弹射次数，飞行速度可配置
 */
@ccclass
export default class Bullet_A extends BaseBullet {
    @property({
        displayName: "飞行速度",
    })
    velocity: number = 1000;

    protected _init(): void {
        this.node.position = this.node.parent.convertToNodeSpaceAR(this.startPos);
        this.rigidbody.linearVelocity = this.targetPos.sub(this.startPos).normalizeSelf().mul(this.velocity);
        this.rigidbody.angularVelocity = 0;
    }
}
