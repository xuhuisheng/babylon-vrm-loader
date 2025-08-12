// import { Vector3 } from '@babylonjs/core/Maths/math';
// import type { Mesh } from '@babylonjs/core/Meshes/mesh';
// import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
// import type { MorphTarget } from '@babylonjs/core/Morph/morphTarget';
// import type { Scene } from '@babylonjs/core/scene';
// import type { AssetContainer } from '@babylonjs/core/assetContainer';
// import { Quaternion } from '@babylonjs/core/Maths/math';
// import { Vector3 } from '@babylonjs/core/Maths/math';
import { Matrix } from '@babylonjs/core/Maths/math';
// import type { Nullable } from '@babylonjs/core/types';
// import { SpringBoneController10 } from './secondary-animation/spring-bone-controller10';
// import { HumanoidBone } from './humanoid-bone';
// import { IVRMAnimation } from './vrm-interfaces';
// import type { IVRMAnimation } from './vrm-interfaces10';
// import { MaterialValueBindingMerger } from './material-value-binding-merger';
// import { VRMManager } from './vrm-manager'
// import { IsBinaryMap, MorphTargetMap, MaterialValueBindingMergerMap, TransformNodeMap, TransformNodeCache, MeshCache, HumanBoneName } from './vrm-interfaces-defines';
// import { GLTFLoader } from '@babylonjs/loaders/glTF/2.0';

/**
 * VRM キャラクターを動作させるためのマネージャ
 */
export class VRMNodeRestPostTree {
    public nodeName: string;
    public localMatrix: Matrix;
    public children: Array<VRMNodeRestPostTree> = new Array<VRMNodeRestPostTree>();

    public constructor(
        public readonly nodeIndex: number,
        public readonly root: boolean,
    ) {
    }

}
