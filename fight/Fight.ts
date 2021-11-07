import GameMode from "../manager/GameMode";
import ControlPanel from "./ControlPanel";
import Entities from "../manager/Entities";
import BaseNpc from "../entity/BaseNpc";
import TileMap from "../utils/TileMap";
import FightMap from "./map/FightMap";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Fight extends cc.Component {
    @property(cc.Camera)
    cameraOfMap: cc.Camera = null;

    @property(cc.Prefab)
    dragon: cc.Prefab = null;

    @property(ControlPanel)
    controlScript: ControlPanel = null;

    /**
     * 当前正在使用的地图的节点
     */
    curMap: cc.Node = null;
    curMapScript: FightMap = null;

    onLoad() {
        this.init();
        GameMode.initMode(this);
        GameMode.loadMap("default/default_1", this.onMapLoadComplete, this);
    }

    start() {

    }

    onMapLoadComplete(mapPrefab: cc.Prefab): void {
        if (cc.isValid(this.curMap)) {
            GameMode.newWaveReset();
            this.curMap.destroy();
        }
        this.curMap = cc.instantiate(mapPrefab);
        this.curMapScript = this.curMap.getComponent(FightMap);
        this.curMap.parent = this.node;
        this.curMap.position = cc.v2();
        this.curMap.active = true;
        this.curMap.zIndex = -1;
        this.controlScript.node.zIndex = 2;
        let enemies = this.curMap.getChildByName("enemyList").children;
        for (let index in enemies) {
            Entities.addEnemyToList(enemies[index].getComponent(BaseNpc));
        }
        GameMode.newWaveInit(this.curMap);
        this.controlScript.init(this.curMap);
        TileMap.init(this.curMap.getChildByName("mainMap"), this.curMap.getChildByName("blockList").children);
    }

    init() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2();
    }

    openDoorOfNextWave() {
        this.curMapScript.blockForNextWave.active = false;
        this.curMapScript.doorForNextWave.active = true;
    }

    update(dt: number) {
    }
}