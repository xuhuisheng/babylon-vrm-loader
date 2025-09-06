// import type { Mesh } from '@babylonjs/core/Meshes/mesh';
// import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
// import type { MorphTarget } from '@babylonjs/core/Morph/morphTarget';
// import type { Scene } from '@babylonjs/core/scene';
// import type { AssetContainer } from '@babylonjs/core/assetContainer';
import { Quaternion } from '@babylonjs/core/Maths/math';
// import { Vector3 } from '@babylonjs/core/Maths/math';
// import { Matrix } from '@babylonjs/core/Maths/math';
// import type { Nullable } from '@babylonjs/core/types';
// import { GLTFLoader } from '@babylonjs/loaders/glTF/2.0';
// import { VRMManager10 } from './vrm-manager10'

export class VRMNodeConstraintAim {
    public type: string;
    public node: number;
    public source: number;
    public weight: number;
    public aimAxis: string;
    public rollAxis: string;
    public _dstRestQuat: Quaternion;

}
