import BaseModifier from "./BaseModifier";

export default abstract class BaseEquipment extends BaseModifier {
    public isEquipment(): boolean {
        return true;
    }
}