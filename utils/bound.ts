const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    onLoad() {
        let width = this.node.width;
        let height = this.node.height;

        let node = new cc.Node();
        node.group = "block";
        let body = node.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;


        this._addBound(node, 0, height / 2, width, 20);
        this._addBound(node, 0, -height / 2, width, 20);
        this._addBound(node, -width / 2, 0, 20, height);
        this._addBound(node, width / 2, 0, 20, height);

        node.parent = this.node;
        node.group = "block";
    }

    start() {

    }

    init() {

    }

    _addBound(node: cc.Node, x: number, y: number, width: number, height: number) {
        let collider = node.addComponent(cc.PhysicsBoxCollider);
        collider.restitution = 0;
        collider.friction = 0;
        collider.offset.x = x;
        collider.offset.y = y;
        collider.size.width = width;
        collider.size.height = height;
    }

    // update (dt) {}
}
