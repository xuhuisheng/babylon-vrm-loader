// import { Vector3 } from '@babylonjs/core/Maths/math';
// import type { Mesh } from '@babylonjs/core/Meshes/mesh';
// import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
// import type { MorphTarget } from '@babylonjs/core/Morph/morphTarget';
import type { Scene } from '@babylonjs/core/scene';
import type { AssetContainer } from '@babylonjs/core/assetContainer';
import { Quaternion } from '@babylonjs/core/Maths/math';
import { Vector3 } from '@babylonjs/core/Maths/math';
import { Matrix } from '@babylonjs/core/Maths/math';
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
    public translationMap: Map<string, Vector3> = new Map<string, Vector3>();
    public rotationMap: Map<string, Quaternion> = new Map<string, Quaternion>();
    public parentMap: Map<string, string> = new Map<string, string>();

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
                if (!value) {
                    return;
                }
                this.humanoidMap.set(value.node, key as string);

            });

            Object.keys(this.ext.humanoid.humanBones).forEach((key) => {
                let value = this.ext.humanoid.humanBones[key];
                if (!value) {
                    return;
                }

                if (!this.loader.gltf || !this.loader.gltf.nodes) {
                    return;
                }

                let node = this.loader.gltf.nodes[value.node];
                if (!node) {
                    return;
                }
                if (node.children) {
                    node.children.forEach((nodeIndex) => {
                        let childNodeName = this.humanoidMap.get(nodeIndex);
                        if (!childNodeName) {
                            console.log('unexists child', key, node, nodeIndex);
                            return;
                        }
                        this.parentMap.set(childNodeName, key);
                    });
                }

                // old start
                // if (node.rotation) {
                //     let quaternion = Quaternion.FromArray(node.rotation);
                //     this.rotationMap.set(key, quaternion);
                // }

                // if (node.translation) {
                //     let vector = Vector3.FromArray(node.translation);
                //     this.translationMap.set(key, vector);
                // }
                // old end

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

    public updateMatrix(assetContainer: AssetContainer) {
        Object.keys(this.ext.humanoid.humanBones).forEach((key) => {
            let value = this.ext.humanoid.humanBones[key];
            if (!value) {
                return;
            }

            if (!this.loader.gltf || !this.loader.gltf.nodes) {
                return;
            }

            let node = this.loader.gltf.nodes[value.node];
            if (!node) {
                return;
            }
            // test start
            if (node.rotation) {
                let matrix = this.findMatrix(assetContainer, value.node);
                if (matrix) {
                    let translation = Vector3.Zero();
                    let quaternion = Quaternion.Zero();
                    let scale = Vector3.Zero();
                    matrix.decompose(translation, quaternion, scale);
                    this.rotationMap.set(key, quaternion);
                }
            }

            if (node.translation) {
                let matrix = this.findMatrix(assetContainer, value.node);
                if (matrix) {
                    let translation = Vector3.Zero();
                    let quaternion = Quaternion.Zero();
                    let scale = Vector3.Zero();
                    matrix.decompose(translation, quaternion, scale);
                    this.translationMap.set(key, translation);
                }
            }
            // test end
        });
    }

    public findMatrix(assetContainer: AssetContainer, nodeIndex: number): Matrix | undefined {
        if (!assetContainer || !assetContainer.transformNodes) {
            return undefined;
        }
        let transformNode = assetContainer.transformNodes[nodeIndex];
        if (!transformNode) {
            return undefined;
        }
        let matrix = transformNode.computeWorldMatrix(true);
        if (!matrix) {
            return undefined;
        }
        // matrix.toggleModelMatrixHandInPlace();
        matrix.toggleProjectionMatrixHandInPlace();
        return matrix;
    }

}
