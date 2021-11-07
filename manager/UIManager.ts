class _UIManager {
    public newUI(path: MACRO.UI_PATH_STRUCT, parent: cc.Node, callBack: (ui: cc.Node) => void, caller: any = null): void {
        cc.loader.loadRes(path.url, function (err, prefab: cc.Prefab) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            let ui = cc.instantiate(prefab);
            parent.addChild(ui,path.zIndex);
            callBack.call(caller,ui);
        });
    }
}

let UIManager:_UIManager = new _UIManager();
export default UIManager;
import * as MACRO from "../common/MACRO";