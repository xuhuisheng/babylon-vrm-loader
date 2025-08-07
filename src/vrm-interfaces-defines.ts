
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

