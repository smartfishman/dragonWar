/**
 * creator的脚本加载顺序是按照ASCII码排序的，此文件将会始终第一个被加载
 * 此文件中可以通过依次导入脚本来决定其他脚本的加载顺序，以此解决一些加载顺序导致的循环引用问题。
 */
import BaseEntity from "./entity/BaseEntity";
let a = BaseEntity;