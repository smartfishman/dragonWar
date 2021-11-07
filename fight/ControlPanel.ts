import BaseNpc_Hero from "../entity/BaseNpc_Hero";
import GameMode from "../manager/GameMode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ControlPanel extends cc.Component {
    @property(cc.Node)
    center: cc.Node = null;

    /**
     * 每次用户点击屏幕时都以起始点为中心计算偏移。
     */
    private centerPoint: cc.Vec2 = null;
    /**
     * center节点偏离中心的最大距离
     */
    private radiusOfOffset: number = 0;
    /**
     * 控制角色的移动方向
     */
    private directionOfMove: cc.Vec2 = cc.v2(0, 0);
    /**
     * 玩家操控的单位
     */
    private assignedHero: BaseNpc_Hero = null;

    onLoad() {
        this.radiusOfOffset = this.node.width / 2 - (this.center.width / 2);
    }

    start() {

    }

    /**
     * 每次创建英雄后都要重新获取控制器控制的英雄
     */
    init(mapNode: cc.Node) {
        mapNode.getChildByName("mainMap").on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        mapNode.getChildByName("mainMap").on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        mapNode.getChildByName("mainMap").on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        mapNode.getChildByName("mainMap").on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.assignedHero = GameMode.getAssignedHero();
        this.updateMapCamera();
        this.onTouchEnd();
    }

    onTouchStart(event: cc.Event.EventTouch) {
        this.centerPoint = event.getLocation();
    }

    onTouchMove(event: cc.Event.EventTouch) {
        let curPoint = event.getLocation();
        this.directionOfMove = curPoint.subSelf(this.centerPoint).normalize();
        this.updateCenterPosition(this.directionOfMove);
    }

    onTouchEnd() {
        this.center.position = cc.v2(0, 0);
        this.directionOfMove = cc.v2(0, 0);
    }

    onTouchCancel() {
        this.onTouchEnd();
    }


    updateCenterPosition(direction: cc.Vec2) {
        this.center.position = direction.mul(this.radiusOfOffset);
    }

    /**
     * 随着人物的移动，更新摄像机位置
     */
    updateMapCamera() {
        let mapCamera: cc.Camera = GameMode.getCameraOfMap();
        mapCamera.node.position = cc.v2(0, this.assignedHero.node.position.y);
    }

    update(dt: number) {
        if (this.assignedHero && !this.assignedHero.isKilled()) {
            this.assignedHero.move(this.directionOfMove);
            if (this.directionOfMove.y !== 0) {
                this.updateMapCamera();
            }
        }
    }
}
