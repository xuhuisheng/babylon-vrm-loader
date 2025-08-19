
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { MorphTarget } from '@babylonjs/core/Morph/morphTarget';
import { MaterialValueBindingMerger } from './material-value-binding-merger';

export interface IsBinaryMap {
    [morphName: string]: boolean;
}

export interface MorphTargetSetting {
    target: MorphTarget;
    weight: number;
}

export interface MorphTargetMap {
    [morphName: string]: MorphTargetSetting[];
}

export interface MaterialValueBindingMergerMap {
    [morphName: string]: MaterialValueBindingMerger;
}

export interface TransformNodeMap {
    [humanBoneName: string]: TransformNode;
}

export interface TransformNodeCache {
    [nodeIndex: number]: TransformNode;
}

export interface MeshCache {
    [meshIndex: number]: Mesh[];
}

/**
 * Unity Humanoid Bone 名
 */
export type HumanBoneName =
    | 'hips'
    | 'leftUpperLeg'
    | 'rightUpperLeg'
    | 'leftLowerLeg'
    | 'rightLowerLeg'
    | 'leftFoot'
    | 'rightFoot'
    | 'spine'
    | 'chest'
    | 'neck'
    | 'head'
    | 'leftShoulder'
    | 'rightShoulder'
    | 'leftUpperArm'
    | 'rightUpperArm'
    | 'leftLowerArm'
    | 'rightLowerArm'
    | 'leftHand'
    | 'rightHand'
    | 'leftToes'
    | 'rightToes'
    | 'leftEye'
    | 'rightEye'
    | 'jaw'
    | 'leftThumbMetacarpal'
    | 'leftThumbProximal'
    | 'leftThumbIntermediate'
    | 'leftThumbDistal'
    | 'leftIndexProximal'
    | 'leftIndexIntermediate'
    | 'leftIndexDistal'
    | 'leftMiddleProximal'
    | 'leftMiddleIntermediate'
    | 'leftMiddleDistal'
    | 'leftRingProximal'
    | 'leftRingIntermediate'
    | 'leftRingDistal'
    | 'leftLittleProximal'
    | 'leftLittleIntermediate'
    | 'leftLittleDistal'
    | 'rightThumbMetacarpal'
    | 'rightThumbProximal'
    | 'rightThumbIntermediate'
    | 'rightThumbDistal'
    | 'rightIndexProximal'
    | 'rightIndexIntermediate'
    | 'rightIndexDistal'
    | 'rightMiddleProximal'
    | 'rightMiddleIntermediate'
    | 'rightMiddleDistal'
    | 'rightRingProximal'
    | 'rightRingIntermediate'
    | 'rightRingDistal'
    | 'rightLittleProximal'
    | 'rightLittleIntermediate'
    | 'rightLittleDistal'
    | 'upperChest'
    | string;

export function findHumanoidChildrenBones(boneName: string): Array<string> {
    if (boneName == 'hips') {
        return ['spine', 'leftUpperLeg', 'rightUpperLeg'];
    } else if (boneName == 'spine') {
        return ['chest'];
    } else if (boneName == 'chest') {
        return ['upperChest'];
    } else if (boneName == 'upperChest') {
        return ['neck'];
    } else if (boneName == 'neck') {
        return ['head', 'leftShoulder', 'rightShoulder'];
    } else if (boneName == 'head') {
        return ['leftEye', 'rightEye', 'jaw'];
    } else if (boneName == 'leftShoulder') {
        return ['leftUpperArm'];
    } else if (boneName == 'leftUpperArm') {
        return ['leftLowerArm'];
    } else if (boneName == 'leftLowerArm') {
        return ['leftHand'];
    } else if (boneName == 'leftHand') {
        return ['leftThumbMetacarpal', 'leftIndexProximal', 'leftMiddleProximal', 'leftRingProximal', 'leftLittleProximal'];
    } else if (boneName == 'leftThumbMetacarpal') {
        return ['leftThumbProximal'];
    } else if (boneName == 'leftThumbProximal') {
        return ['leftThumbDistal'];
    } else if (boneName == 'leftIndexProximal') {
        return ['leftIndexIntermediate'];
    } else if (boneName == 'leftIndexIntermediate') {
        return ['leftIndexDistal'];
    } else if (boneName == 'leftMiddleProximal') {
        return ['leftMiddleIntermediate'];
    } else if (boneName == 'leftMiddleIntermediate') {
        return ['leftMiddleDistal'];
    } else if (boneName == 'leftRingProximal') {
        return ['leftRingIntermediate'];
    } else if (boneName == 'leftRingIntermediate') {
        return ['leftRingDistal'];
    } else if (boneName == 'leftLittleProximal') {
        return ['leftLittleIntermediate'];
    } else if (boneName == 'leftLittleIntermediate') {
        return ['leftLittleDistal'];
    } else if (boneName == 'rightShoulder') {
        return ['rightUpperArm'];
    } else if (boneName == 'rightUpperArm') {
        return ['rightLowerArm'];
    } else if (boneName == 'rightLowerArm') {
        return ['rightHand'];
    } else if (boneName == 'rightHand') {
        return ['rightThumbMetacarpal', 'rightIndexProximal', 'rightMiddleProximal', 'rightRingProximal', 'rightLittleProximal'];
    } else if (boneName == 'rightThumbMetacarpal') {
        return ['rightThumbProximal'];
    } else if (boneName == 'rightThumbProximal') {
        return ['rightThumbDistal'];
    } else if (boneName == 'rightIndexProximal') {
        return ['rightIndexIntermediate'];
    } else if (boneName == 'rightIndexIntermediate') {
        return ['rightIndexDistal'];
    } else if (boneName == 'rightMiddleProximal') {
        return ['rightMiddleIntermediate'];
    } else if (boneName == 'rightMiddleIntermediate') {
        return ['rightMiddleDistal'];
    } else if (boneName == 'rightRingProximal') {
        return ['rightRingIntermediate'];
    } else if (boneName == 'rightRingIntermediate') {
        return ['rightRingDistal'];
    } else if (boneName == 'rightLittleProximal') {
        return ['rightLittleIntermediate'];
    } else if (boneName == 'rightLittleIntermediate') {
        return ['rightLittleDistal'];
    } else if (boneName == 'leftUpperLeg') {
        return ['leftLowerLeg'];
    } else if (boneName == 'leftLowerLeg') {
        return ['leftFoot'];
    } else if (boneName == 'leftFoot') {
        return ['leftToes'];
    } else if (boneName == 'rightUpperLeg') {
        return ['rightLowerLeg'];
    } else if (boneName == 'rightLowerLeg') {
        return ['rightFoot'];
    } else if (boneName == 'rightFoot') {
        return ['rightToes'];
    } else {
        return [];
    }

}
