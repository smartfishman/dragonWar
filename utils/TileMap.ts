class _TileMap {
    private _tiles: Tile[][] = null;
    private readonly size: number = 80;
    /**
     * 初始化地图节点为网格长宽80*80的网格地图
     * 并检查各个tile中是否有block类型的刚体
     * @param map 地图背景面板节点，tilemap将个根据此节点的长宽值初始化
     * @param blockList 所有类型为Block的障碍物节点
     */
    public init(map: cc.Node, blockList: cc.Node[]) {
        let size = this.size;
        let xCount = Math.ceil(map.width / size);
        let yCount = Math.ceil(map.height / size);
        this._tiles = new Array<Array<Tile>>();
        for (let i = 0; i < xCount; i++) {
            this._tiles[i] = [];
            for (let j = 0; j < yCount; j++) {
                this._tiles[i][j] = new Tile(i, j, size);
            }
        }
        //为简化计算，所有障碍物都必须为physicsBoxCollider类型。
        //block四个顶点所在的tile，以及被这个四个顶点包围tile都将被设置为Block
        for (let index in blockList) {
            let block = blockList[index];
            let rect: cc.Rect = block.getComponent(cc.PhysicsBoxCollider).getAABB() as unknown as cc.Rect;
            let tile_VertexBL = this.getTileByPoint(cc.v2(rect.xMin, rect.yMin));
            let tile_VertexTR = this.getTileByPoint(cc.v2(rect.xMax, rect.yMax));
            for (let i = tile_VertexBL.x; i <= tile_VertexTR.x; i++) {
                for (let j = tile_VertexBL.y; j <= tile_VertexTR.y; j++) {
                    this._tiles[i][j].isBlock = true;
                }
            }
        }
    }

    /**
     * 查找两点之间的可通行路径(A*寻路:F=G+H)
     * @param startPos 
     * @param endPos 
     * @returns 调用Array.pop()可依次取出路径点,若没有找到有效路径，会返回一个空数组
     */
    public findPath(startPos: cc.Vec2, endPos: cc.Vec2): cc.Vec2[] {
        let startTile: Tile = this.getTileByPoint(startPos);
        let endTile: Tile = this.getTileByPoint(endPos);
        let openList: nodeForAstar[] = [];
        let closedList: nodeForAstar[] = [];
        let _this = this;
        let nodeForAstar_cache = [];
        /**
         * 获取与tile一一对应的节点对象
         */
        function getNodeByTile(tile: Tile): nodeForAstar {
            if (!nodeForAstar_cache[`${tile.x}|${tile.y}`]) {
                nodeForAstar_cache[`${tile.x}|${tile.y}`] = new nodeForAstar(tile);
            }
            return nodeForAstar_cache[`${tile.x}|${tile.y}`];
        }
        function countGHF(node: nodeForAstar, parentNode: nodeForAstar): void {
            let G = parentNode.G + parentNode.tile.rect.center.sub(node.tile.rect.center).mag();
            if (node.parentNode && node.G <= G) {
                return;
            }
            node.G = G;
            node.H = node.H || node.tile.rect.center.sub(endTile.rect.center).mag();
            node.F = node.G + node.H;
            node.parentNode = parentNode;

        }
        /**
         * 获取当前节点周围的可通行节点
         */
        function getTransitableNode(curNode: nodeForAstar): nodeForAstar[] {
            let result: nodeForAstar[] = [];
            for (let i = curNode.x - 1; i <= curNode.x + 1; i++) {
                for (let j = curNode.y - 1; j <= curNode.y + 1; j++) {
                    if (!_this._tiles[i] || !_this._tiles[i][j]) {
                        continue;
                    }
                    let tile = _this._tiles[i][j];
                    let node = getNodeByTile(tile);
                    if (closedList.indexOf(node) !== -1) {
                        continue;
                    }
                    if (tile.x === curNode.x || tile.y === curNode.y) {//正向方向直接判断Block
                        if (!tile.isBlock || tile === endTile) {//目标位置可能处于一个block节点的边缘
                            countGHF(node, curNode);
                            result.push(node);
                        }
                    } else {//斜向方向判断邻近tile都为可通行时才可通行
                        let tileA = _this._tiles[i][curNode.y];
                        let tileB = _this._tiles[curNode.x][j];
                        if (!tileA.isBlock && !tileB.isBlock) {
                            countGHF(node, curNode);
                            result.push(node);
                        }
                    }
                }
            }
            return result;
        }

        //A星寻路实现
        let startNode = getNodeByTile(startTile);
        let endNode = getNodeByTile(endTile);
        openList.push(startNode);
        while (openList.length > 0) {
            let curNode = openList.pop();
            closedList.push(curNode);
            let newOpenNodes = getTransitableNode(curNode);
            if (closedList.indexOf(endNode) != -1) {//找到目标点
                break;
            }
            for (let index in newOpenNodes) {
                let node = newOpenNodes[index];
                if (openList.indexOf(node) === -1) {
                    openList.push(node);
                }
            }
            openList.sort((a: nodeForAstar, b: nodeForAstar) => {
                return b.F - a.F;
            });
        }
        let result: cc.Vec2[] = [];
        if (closedList.indexOf(endNode) != -1) {
            while (endNode.parentNode) {
                result.push(endNode.tile.rect.center);
                endNode = endNode.parentNode;
                // cc.log(endNode.x, endNode.y);
            }
        }
        return result;
    }

    /**
     * 获取当前点处于哪个tile区域内
     * @param pos 此坐标应是刚体世界坐标，原点基于左下角。
     */
    private getTileByPoint(pos: cc.Vec2): Tile {
        let xIndex = Math.floor(pos.x / this.size);
        let yIndex = Math.floor(pos.y / this.size);
        if (!this._tiles[xIndex][yIndex]) {
            cc.error("TileMap.getTileByPoint:pos 不合法", pos);
        }
        return this._tiles[xIndex][yIndex];
    }
}

class Tile {
    x: number = 0;
    y: number = 0;
    rect: cc.Rect = null;
    isBlock: boolean = false; //是否不可通行

    constructor(i: number, j: number, size: number) {
        this.x = i;
        this.y = j;
        let posX = i * size;
        let posY = j * size;
        this.rect = cc.rect(posX, posY, size, size);
        let colliderList = cc.director.getPhysicsManager().testAABB(this.rect);
        for (let index in colliderList) {
            let collider = colliderList[index];
            if (collider.node.group === "block") {
                this.isBlock = true;
                break;
            }
        }
    }
}

/**
 * A星寻路需要用到的介质对象
 */
class nodeForAstar {
    x: number = 0;
    y: number = 0;
    /**
     * 已行进距离
     */
    G: number = 0;
    /**
     * 直线距离
     */
    H: number = 0;
    /**
     * 预估距离
     */
    F: number = 0;
    parentNode: nodeForAstar = null;
    tile: Tile = null;
    constructor(tile: Tile) {
        this.tile = tile;
        this.x = tile.x;
        this.y = tile.y;
    }
}

/**
 * tilemap的简易实现，调用init()完成初始化，findPath获取两点之间的有效路径
 */
let TileMap = new _TileMap();
export default TileMap;