const { ccclass, property } = cc._decorator;

/**
 * 基础实体类，包含一个实体最基本的移动动作、攻击动作、死亡、模型渲染等接口
 */
@ccclass
export default abstract class BaseEntity extends cc.Component {
    @property(dragonBones.ArmatureDisplay)
    armatureDisplay: dragonBones.ArmatureDisplay = null;
    @property(cc.Prefab)
    bulletPrefab: cc.Prefab = null;
    @property({
        displayName: "单位移动时的速率",
        type: cc.Float,
    })
    velocity: number = 350;


    armature: dragonBones.Armature = null;
    rigidbody: cc.RigidBody = null;
    /**
     * 当前角色应该面向的角度
     */
    rotationOfExpect: number = 0;
    /**
     * 实体当前的动画状态
     */
    curStateOfAnimation: MACRO.ANIMATION_STATE = null;
    /**
     * 用于缓存子弹实体
     */
    bulletPool: cc.NodePool = new cc.NodePool();
    /**
     * 控制攻击时机
     */
    countTimeForIntervalOfAttack: number = 0;
    /**
     * 调整转向后攻击才能准备就绪。
     */
    isReadyToAttack: Boolean = false;
    /**
     * 当前准备攻击位置的世界坐标
     */
    protected targetPos: cc.Vec2 = null;
    /**
     * 当前正在攻击的目标
     */
    protected curTargetToAttack: BaseEntity = null;

    /**
     * 自动寻路的路径
     */
    private _pathForMove: cc.Vec2[] = null;
    /**
     * 寻路路径中正在前往的目标位置
     */
    private _posToNextMove: cc.Vec2 = null;
    /**
     * 是否已死亡
     */
    private _isKill: boolean = false;


    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if (otherCollider.node.getComponent(BaseEntity)) {//单位之间碰撞
            let unit: BaseEntity = otherCollider.node.getComponent(BaseEntity);
            this.onCrashWithUnit(unit, contact);
        } else if (otherCollider.node.getComponent(BaseBullet)) {//被子弹击中
            let bullet: BaseBullet = otherCollider.node.getComponent(BaseBullet);
            if (bullet.isNotContactTheEntity(this)) {
                contact.disabled = true;
            } else {
                this.onCrashWithBullet(bullet, contact);
            }
        }
    }

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {

    }

    private attack() {
        this.isReadyToAttack = false;
        this.createNewBullet();
    }

    private createNewBullet() {
        let newBullet = null;
        if (this.bulletPool.size() > 0) {
            newBullet = this.bulletPool.get();
        } else {
            newBullet = cc.instantiate(this.bulletPrefab);
        }
        newBullet.parent = GameMode.getFightScript().node;
        newBullet.active = true;
        //子弹的初始位置在角色面朝方向的前方30个像素。
        let radianOfRotation = this.rigidbody.getWorldRotation() * (Math.PI / 180);
        let direction = cc.v2(Math.sin(radianOfRotation), Math.cos(radianOfRotation));
        let StartPosition = this.rigidbody.getWorldCenter().add(direction.mul(30));
        let newBulletScript: BaseBullet = newBullet.getComponent(BaseBullet);
        newBulletScript.init(this, this.bulletPool, StartPosition, this.targetPos);
        newBullet.active = true;
        return newBullet;
    }

    private preNextAttack(targetPos: cc.Vec2): void {
        if (targetPos === this.rigidbody.getWorldCenter()) {
            return;
        }
        this.targetPos = targetPos;
        this.rotationOfExpect = targetPos.sub(this.rigidbody.getWorldCenter()).signAngle(cc.v2(0, 1)) * (180 / Math.PI);
        this.isReadyToAttack = true;
    }

    /**
     * 向指定方向移动
     * @param direction 单位向量
     */
    public move(direction: cc.Vec2): void {
        if (this.isKilled()) {
            return;
        }

        this.rigidbody.linearVelocity = direction.mul(this.velocity);
        if (direction.mag() != 0) {
            this.rotationOfExpect = direction.signAngle(cc.v2(0, 1)) * (180 / Math.PI);
            this.setAnimationToMove();
            //每一次移动清空当前攻击目标，并重置攻击间隔可以立即发起攻击
            this.curTargetToAttack = null;
            this.countTimeForIntervalOfAttack = this.getIntervalOfAttackWA();
        } else {
            this.setAnimationToIdle();
        }
    }

    /**
     * 按指定的路径移动
     * @param path TileMap.findPath()的返回值
     */
    public moveByPath(path: cc.Vec2[]): void {
        this._pathForMove = path;
        this._posToNextMove = this._pathForMove.pop();
    }

    /**
     * 自动寻路到指定地点
     * @param worldPos 世界坐标系下的坐标
     */
    public moveToPosition(worldPos: cc.Vec2): void {
        let path = TileMap.findPath(this.rigidbody.getWorldCenter(), worldPos);
        if (path.length > 0) {
            this.moveByPath(path);
        } else {//未找到路径或者已与目标点处于同一tile的情况下，直接朝目标方向移动
            this.move(worldPos.sub(this.rigidbody.getWorldCenter()).normalizeSelf());
        }
    }

    /**
     * 单位被击杀
     */
    public killed(events: MACRO.EVENTDATA_KILL): void {
        this._isKill = true;
        Entities.removeEnemyFromList(events.killedEntity);
        this.node.destroy();
    }

    /**
     * 是否是英雄
     */
    public isHero(): boolean {
        return false;
    }

    /**
     * 是否是NPC
     */
    public isNPC(): boolean {
        return false;
    }

    /**
     * 是否已死亡
     */
    public isKilled(): boolean {
        return !cc.isValid(this.node) || this._isKill;
    }

    /**
     * 获取计算加成数值后的攻击间隔
     */
    protected abstract getIntervalOfAttackWA(): number;
    /**
     * 获取下一次攻击的目标位置,没有返回null
     */
    protected abstract findPosForNextAttack(): cc.Vec2;
    /**
     * 设置模型动作为待命状态
     */
    public abstract setAnimationToIdle(): void;
    /**
     * 设置模型动作为移动状态
     */
    public abstract setAnimationToMove(): void;
    /**
     * 和子弹发生碰撞时
     */
    protected abstract onCrashWithBullet(bullet: BaseBullet, contact: cc.PhysicsContact): void;
    /**
     * 和单位发生碰撞时
     */
    protected abstract onCrashWithUnit(unit: BaseEntity, contact: cc.PhysicsContact): void;


    onLoad(): void {
        this.armature = this.armatureDisplay.armature();
        this.rigidbody = this.getComponent(cc.RigidBody);
        this.setAnimationToIdle();
    }

    update(dt: number): void {
        //根据期望的面向角度，施加角速度。
        let angularRotation = (this.rotationOfExpect - this.rigidbody.getWorldRotation()) % 360;
        if (Math.abs(angularRotation) > 10 && 360 - Math.abs(angularRotation) > 10) {
            if (angularRotation > 0) {
                this.rigidbody.angularVelocity = angularRotation <= 180 ? 1000 : -1000;
            } else {
                this.rigidbody.angularVelocity = angularRotation >= -180 ? -1000 : 1000;
            }
        } else {
            this.rigidbody.angularVelocity = 0;
        }

        //当角色角速度和线速度都为0时,启动攻击步骤：等待攻击间隔，寻找敌人，调整方向，发射子弹
        if (this.rigidbody.linearVelocity.mag() === 0 && this.rigidbody.angularVelocity === 0) {
            this.countTimeForIntervalOfAttack += dt;
            if (this.isReadyToAttack) {
                this.attack();
            } else {
                if (this.countTimeForIntervalOfAttack >= this.getIntervalOfAttackWA()) {
                    let pos = this.findPosForNextAttack();
                    if (pos) {
                        this.countTimeForIntervalOfAttack = 0;
                        this.preNextAttack(pos);
                    }
                }
            }
        }

        //自动寻路
        if (this._posToNextMove) {
            let direction = this._posToNextMove.sub(this.rigidbody.getWorldCenter());
            if (direction.mag() < 10) {
                this._posToNextMove = this._pathForMove.pop();
            } else {
                this.move(this._posToNextMove.sub(this.rigidbody.getWorldCenter()).normalizeSelf());
            }
        }

    }

    lateUpdate(): void {

    }

    start() { }
    onDestroy() { }
}

import Entities from "../manager/Entities";
import * as MACRO from "../common/MACRO";
import BaseBullet from "./BaseBullet";
import TileMap from "../utils/TileMap";
import GameMode from "../manager/GameMode";

