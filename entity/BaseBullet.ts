import BaseEntity from "./BaseEntity";
import BaseNpc from "./BaseNpc";
import GameMode from "../manager/GameMode";
import Entities from "../manager/Entities";

const { ccclass, property } = cc._decorator;

/**
 * 所有子弹应继承的父类,
 * 注意：每一个预制体最多只能包含一个继承至BaseBullet的脚本组件，因为单位在访问组件时使用了newBullet.getComponent(BaseBullet)
 */
@ccclass
export default abstract class BaseBullet extends cc.Component {
    @property(dragonBones.ArmatureDisplay)
    armatureDisplay: dragonBones.ArmatureDisplay = null;

    /**
     * 子弹的拥有者
     */
    private owner: BaseNpc = null;
    /**
     * 回收工厂
     */
    private bulletFactory: cc.NodePool = null;
    /**
     * 控制变更方向的时机
     */
    private stateOfUpdateDirection: boolean = false;
    /**
     * 记录当前剩余的可碰撞次数
     */
    private curCountsOfRebound: number = 0;
    /**
     * 渲染该模型的armature
     */
    private armature: any = null;
    /**
     * 该节点刚体
     */
    protected rigidbody: cc.RigidBody = null;
    /**
     * 子弹的初始位置
     */
    protected startPos: cc.Vec2 = null;
    /**
     * 子弹将要打击的目标位置
     */
    protected targetPos: cc.Vec2 = null;
    /**
     * 当前剩余可弹射攻击的次数
     */
    protected curCountsOfEjectionAttack: number = 0;
    /**
     * 该子弹不与该列表中的实体产生交互，主要用于处理一些碰撞分组无法覆盖的情况
     */
    protected targetListForExclude: BaseEntity[] = [];


    //----------------------------------抽象函数---------------------------------start
    /**
     * 子类实现该方法，完成各种样式子弹飞行路径初始化
     */
    protected abstract _init(): void;
    //----------------------------------抽象函数---------------------------------end


    /**
     * 创建该子弹的单位会提供一个工厂用于回收此子弹节点,以及子弹起始位置的世界坐标，目标所在位置的世界坐标
     * @param owner 子弹的拥有者
     * @param factory 回收子弹的工厂实例
     * @param isEctypeOfIntensifyAttack 是否是攻击增强复制的副本，部分子弹会在创建时复制自身，这些已是复制体的子弹不再继续复制。
     * @param isEctypeOfExtraAttack 是否是连续攻击复制的副本，部分子弹会在创建时复制自身，这些已是复制体的子弹不再继续复制。
     */
    public init(owner: BaseEntity, factory: cc.NodePool, startPos: cc.Vec2, targetPos: cc.Vec2, isEctypeOfIntensifyAttack: boolean = false, isEctypeOfExtraAttack: boolean = false) {
        this.owner = owner as BaseNpc;
        this.bulletFactory = factory;
        this.startPos = startPos;
        this.targetPos = targetPos;
        this.stateOfUpdateDirection = true;
        this.curCountsOfRebound = this.owner._countsOfRebound;
        this.curCountsOfEjectionAttack = this.owner._ejectionAttack;
        this.targetListForExclude = [];
        if (!isEctypeOfExtraAttack) {
            this.checkExtraCountsOfAttack();
        }
        if (!isEctypeOfIntensifyAttack) {
            this.checkIntensifyAttack();
        }
        //子类完成初始化
        this._init();
    }

    /**
     * 克隆一个该子弹的副本，赋值新的开始位置和目标位置
     */
    private createNewCloneBullet(startPos: cc.Vec2, endPos: cc.Vec2, isEctypeOfIntensifyAttack: boolean = true): BaseBullet {
        let newBullet: cc.Node = null;
        if (this.bulletFactory.size() > 0) {
            newBullet = this.bulletFactory.get();
        } else {
            newBullet = cc.instantiate(this.owner.bulletPrefab);
        }
        newBullet.active = true;
        newBullet.parent = GameMode.getFightScript().node;
        let newBulletScript = newBullet.getComponent(BaseBullet);
        newBulletScript.init(this.owner, this.bulletFactory, startPos, endPos, isEctypeOfIntensifyAttack, true);
        return newBulletScript;
    }

    /**
     * 批量克隆副本,赋值新的开始位置和目标位置
     * @param positions
     */
    private createNewCloneBullets(positions: posOfSAndE[]): void {
        for (let index in positions) {
            let position: posOfSAndE = positions[index];
            this.createNewCloneBullet(position.startPos, position.endPos);
        }
    }

    /**
     * 检查该子弹拥有者是否持有攻击加强,然后复制对应加强方向上的子弹
     */
    private checkIntensifyAttack() {
        let positions: posOfSAndE[] = [];
        //斜向加强
        if (this.owner._intensifyAttackOnAngle45 > 0) {
            positions = this.countPosOfAttackOnAngelX(45, this.owner._intensifyAttackOnAngle45);
            this.createNewCloneBullets(positions);
        }

        //两侧加强
        if (this.owner._intensifyAttackOnAngle90 > 0) {
            positions = this.countPosOfAttackOnAngelX(90, this.owner._intensifyAttackOnAngle90);
            this.createNewCloneBullets(positions);
        }

        //背后加强
        if (this.owner._intensifyAttackOnBack > 0) {
            positions = this.countPosOfAttackOnBack(this.owner._intensifyAttackOnBack);
            this.createNewCloneBullets(positions);
        }

        //正向加强
        switch (this.owner._intensifyAttackOnForwardDirection) {
            case 1:
                positions = this.countPosOfAttackOnForward(10, this.startPos, this.targetPos);
                this.createNewCloneBullet(positions[0].startPos, positions[0].endPos);
                this.startPos = positions[1].startPos;
                this.targetPos = positions[1].endPos;
                break;
            case 2:
                positions = this.countPosOfAttackOnForward(20, this.startPos, this.targetPos);
                this.createNewCloneBullets(positions);
                break;
            default:
                break;
        }
    }

    /**
     * 检查子弹拥有者是否持有连续攻击，然后复制一枚新的子弹延时发射
     */
    private checkExtraCountsOfAttack() {
        //连续攻击+1
        if (this.owner._extraCountsOfAttack > 0) {
            let counts = this.owner._extraCountsOfAttack;
            let startPos = this.startPos;
            let targetPos = this.targetPos;
            let timer = setInterval(() => {
                if (counts > 0) {
                    counts--;
                    this.createNewCloneBullet(startPos, targetPos, false);
                } else {
                    clearInterval(timer);
                }
            }, 50);
        }
    }

    /**
     * 检查该子弹的当前剩余可弹射次数，然后完成弹射逻辑
     */
    private checkCurCountsOfEjectionAttack(unit: BaseNpc) {
        if (this.curCountsOfEjectionAttack > 0) {
            let nearEnemy = Entities.findNearestEnemy(unit.rigidbody.getWorldCenter(), 300, [unit]);
            if (Entities.isValid(nearEnemy)) {
                let newBulletScript: BaseBullet = this.createNewCloneBullet(unit.rigidbody.getWorldCenter(), nearEnemy.rigidbody.getWorldCenter(), true);
                newBulletScript.curCountsOfEjectionAttack = this.curCountsOfEjectionAttack - 1;
                newBulletScript.targetListForExclude.push(unit);
            }
        }
    }

    /**
     * 计算正向攻击加强的起止位置
     */
    private countPosOfAttackOnForward(spacingDistance: number, startPos: cc.Vec2, targetPos: cc.Vec2): posOfSAndE[] {
        let leftPos = {} as posOfSAndE;
        let rightPos = {} as posOfSAndE;
        let radian: number = 90 * Math.PI / 180;
        let offSetV2: cc.Vec2 = targetPos.sub(startPos).rotateSelf(radian).normalizeSelf().mulSelf(spacingDistance);
        rightPos.startPos = startPos.add(offSetV2);
        rightPos.endPos = targetPos.add(offSetV2);
        offSetV2.negSelf();
        leftPos.startPos = startPos.add(offSetV2);
        leftPos.endPos = targetPos.add(offSetV2);
        return [leftPos, rightPos];
    }

    /**
     * 计算斜向攻击加强的起止位置
     * @param angel 偏移的角度
     * @param count 加强的数量
     */
    private countPosOfAttackOnAngelX(angel: number, count: number): posOfSAndE[] {
        let leftPos: posOfSAndE = {} as posOfSAndE;
        let rightPos: posOfSAndE = {} as posOfSAndE;
        let radian: number = angel * Math.PI / 180;
        rightPos.startPos = this.startPos.sub(this.owner.rigidbody.getWorldCenter()).rotateSelf(radian).addSelf(this.owner.rigidbody.getWorldCenter());
        leftPos.startPos = this.startPos.sub(this.owner.rigidbody.getWorldCenter()).rotateSelf(-radian).addSelf(this.owner.rigidbody.getWorldCenter());
        rightPos.endPos = this.targetPos.sub(this.owner.rigidbody.getWorldCenter()).rotateSelf(radian).addSelf(this.owner.rigidbody.getWorldCenter());
        leftPos.endPos = this.targetPos.sub(this.owner.rigidbody.getWorldCenter()).rotateSelf(-radian).addSelf(this.owner.rigidbody.getWorldCenter());
        if (count > 1) {
            let leftPositions = this.countPosOfAttackOnForward(10, leftPos.startPos, leftPos.endPos);
            let rightPositions = this.countPosOfAttackOnForward(10, rightPos.startPos, rightPos.endPos);
            return [leftPositions[0], leftPositions[1], rightPositions[0], rightPositions[1]];
        } else {
            return [leftPos, rightPos];
        }
    }


    /**
     * 计算背后攻击加强的起止位置
     * @param count 加强的数量
     */
    private countPosOfAttackOnBack(count: number): posOfSAndE[] {
        let newPos: posOfSAndE = {} as posOfSAndE;
        newPos.startPos = this.startPos.sub(this.owner.rigidbody.getWorldCenter()).negSelf().addSelf(this.owner.rigidbody.getWorldCenter());
        newPos.endPos = this.targetPos.sub(this.owner.rigidbody.getWorldCenter()).negSelf().addSelf(this.owner.rigidbody.getWorldCenter());
        if (count > 1) {
            return this.countPosOfAttackOnForward(10, newPos.startPos, newPos.endPos);
        } else {
            return [newPos];
        }
    }


    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if (!otherCollider.getComponent(BaseNpc)) {
            if (this.curCountsOfRebound < 1) {
                this.rigidbody.linearVelocity = cc.v2(0, 0);
                contact.disabled = true;
                this.killSelf();
                return;
            }
            this.curCountsOfRebound--;
        }
    }

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        this.updateDirectionOfBody();
    }

    /**
     * 更新刚体的旋转角度为线速度方向。
     */
    protected updateDirectionOfBody(): void {
        this.stateOfUpdateDirection = true;
    }

    /**
     * 获取该子弹造成的伤害值,默认的伤害值为拥有者的普通攻击力。 特殊子弹需要在子类中重写该方法
     */
    public getDamage(): number {
        if (!Entities.isValid(this.owner)) {
            return 0;
        }
        return this.owner.getDamageOfNormalAttack();
    }

    /**
     * 获取该子弹的拥有者
     */
    public getOwner(): BaseNpc {
        return this.owner;
    }

    /**
     * 当子弹击中单位后会调用此函数，在这里设置子弹穿透和子弹弹射逻辑
     */
    public onCrashWithUnit(unit: BaseNpc) {
        //弹射攻击
        this.checkCurCountsOfEjectionAttack(unit);
        //穿透攻击
        if (this.owner._piercingAttack <= 0) {
            this.killSelf();
        }
    }

    /**
     * 检查该单位是否可以与该子弹产生碰撞交互
     * @param unit 
     */
    public isNotContactTheEntity(unit: BaseEntity): boolean {
        if (this.targetListForExclude.indexOf(unit) > -1) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 销毁该子弹（实际是被回收了）
     */
    public killSelf(): void {
        this.node.active = false;
        setTimeout(() => {
            //刚体节点不能在碰撞处理过程中修改属性值
            //延迟回收可以解决碰撞过程中被回收又被立即创建，重新初始化时修改节点属性会报错的问题。
            this.bulletFactory.put(this.node);
        }, 0);
    }

    onLoad() {
        this.armature = this.armatureDisplay.armature();
        this.rigidbody = this.getComponent(cc.RigidBody);
    }

    update(dt: number) {
        if (this.stateOfUpdateDirection) {
            this.node.rotation = this.rigidbody.linearVelocity.signAngle(cc.v2(0, 1)) * (180 / Math.PI);
            this.stateOfUpdateDirection = false;
        }
    }
}

interface posOfSAndE {
    startPos: cc.Vec2,
    endPos: cc.Vec2,
}