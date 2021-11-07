import BaseBullet from "../BaseBullet";

const { ccclass, property } = cc._decorator;

/**
 * 弧形子弹，由起始位置朝目标位置以一定弧度移动，弧度大小，飞行速度可配置。反弹次数固定为0次
 */
@ccclass
export default class Bullet_B extends BaseBullet {
    @property({
        displayName: "可反弹次数",
        visible: false,
        override: true,
    })
    countOfRebound: number = 0;

    @property({
        displayName: "直线飞行速度(决定命中目标的时间)",
    })
    originalLinearVelocity: number = 200;

    @property({
        displayName: "垂直飞行速度(决定飞行路径的弧度大小)",
    })
    originalVeticalVelocity: number = 100;

    @property({
        displayName: "旋转速度"
    })
    originalAngularVelocity: number = 300;

    /**
     * 弧形轨迹的向心力
     */
    extraForce: cc.Vec2 = cc.v2();

    /**
     * 子弹的初始速度为起始点与目标点连线逆时针45度角，两点之间的直线速度Vx固定为100像素/s，垂直线速度Vy与直线速度Vx速率相同。
     * 子弹的飞行时间t为两点之间距离除以直线速度。
     * 应施加的力F=2Vy*m/t
     * TODO:弧形的偏移方向有待优化
     */
    protected _init(): void {
        this.node.position = this.node.parent.convertToNodeSpaceAR(this.startPos);
        let Vx = this.targetPos.sub(this.startPos).normalizeSelf().mul(this.originalLinearVelocity);
        let Vy = Vx.rotate(90 * Math.PI / 180).normalizeSelf().mul(this.originalVeticalVelocity);
        let t = this.targetPos.sub(this.startPos).mag() / this.originalLinearVelocity;
        let mass: number = this.rigidbody.getMass();
        this.extraForce = Vy.neg().mul(2 * mass / t);
        this.rigidbody.linearVelocity = Vx.add(Vy);
        this.rigidbody.angularVelocity = this.originalAngularVelocity;
    }


    update(dt: number) {
        super.update(dt);
        this.rigidbody.applyForce(this.extraForce, this.rigidbody.getWorldCenter(), true);
    }

    start() {
    }
}
