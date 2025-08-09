// import { Vector3 } from '@babylonjs/core/Maths/math';
// import type { Mesh } from '@babylonjs/core/Meshes/mesh';
// import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
// import type { MorphTarget } from '@babylonjs/core/Morph/morphTarget';
import type { Scene } from '@babylonjs/core/scene';
// import type { Nullable } from '@babylonjs/core/types';
// import { SpringBoneController10 } from './secondary-animation/spring-bone-controller10';
// import { HumanoidBone } from './humanoid-bone';
// import { IVRMAnimation } from './vrm-interfaces';
import type { IVRMAnimation } from './vrm-interfaces10';
// import { MaterialValueBindingMerger } from './material-value-binding-merger';
// import { VRMManager } from './vrm-manager'
// import { IsBinaryMap, MorphTargetMap, MaterialValueBindingMergerMap, TransformNodeMap, TransformNodeCache, MeshCache, HumanBoneName } from './vrm-interfaces-defines';
import { GLTFLoader } from '@babylonjs/loaders/glTF/2.0';

/**
 * VRM キャラクターを動作させるためのマネージャ
 */
export class VRMAnimationManager10 {
    public humanoidMap: Map<number, string> = new Map<number, string>();
    public expressionMap: Map<number, string> = new Map<number, string>();
    public lookAtIndex: number = -1;
    public animationMap: Map<number, string> = new Map<number, string>();

    public constructor(
        public readonly ext: IVRMAnimation,
        public readonly loader: GLTFLoader,
        public readonly scene: Scene,
    ) {
        this.constructIndex();

        this.constructAnimation();

        // console.log(loader);
        // console.log(scene);
    }

    public constructIndex() {
        if (this.ext && this.ext.humanoid && this.ext.humanoid.humanBones) {
            Object.keys(this.ext.humanoid.humanBones).forEach((key) => {
                let value = this.ext.humanoid.humanBones[key];
                if (value) {
                    this.humanoidMap.set(value.node, key as string);
                }
            });            
        }

        if (this.ext && this.ext.expressions && this.ext.expressions.preset) {
            Object.keys(this.ext.expressions.preset).forEach((key) => {
                let value = this.ext.expressions.preset[key];
                if (value) {
                    this.expressionMap.set(value.node, key as string);
                }
            });
        }

        if (this.ext.lookAt && (typeof this.ext.lookAt.node != 'undefined')) {
            this.lookAtIndex = this.ext.lookAt.node;
        }

    }

    public constructAnimation() {
        // console.log(this.loader.gltf)
        if (!this.loader.gltf || !this.loader.gltf.animations || this.loader.gltf.animations.length <= 0 || !this.loader.gltf.animations[0].channels) {
            return
        }
        this.loader.gltf.animations[0].channels.forEach((channel) => {
            if (typeof channel.target.node == 'undefined') {
                return;
            }
            let boneName = this.humanoidMap.get(channel.target.node);
            if (!boneName) {
                console.log('skip bone', channel.target.node)
                return;
            }
            this.animationMap.set(channel.index, boneName);
        });
    }

}
