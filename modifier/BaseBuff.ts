import BaseModifier from "./BaseModifier";

export default abstract class BaseBuff extends BaseModifier {
    public isBuff(): boolean {
        return true;
    }
}