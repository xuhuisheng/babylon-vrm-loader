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
import { VRMNodeRestPostTree } from './vrm-node-rest-post-tree';

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
    public matrixMap: Map<string, Matrix> = new Map<string, Matrix>();

    public nodeRestPostTree: VRMNodeRestPostTree;
    public nodeRestPostTreeMap: Map<string, VRMNodeRestPostTree> = new Map<string, VRMNodeRestPostTree>();

    public constructor(
        public readonly ext: IVRMAnimation,
        public readonly loader: GLTFLoader,
        public readonly scene: Scene,
    ) {
        this.constructIndex();

        this.constructAnimation();

        // console.log(loader);
        // console.log(scene);

        this.constructNodeRestPostTree();
        this.constructKeyFrames();
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

    public constructNodeRestPostTree() {
        let root = this.buildNodeRestPostTree(0, true, undefined);
        if (root) {
            this.nodeRestPostTree = root
        }
    }

    public buildNodeRestPostTree(nodeIndex: number, root: boolean, parentNode: VRMNodeRestPostTree | undefined): VRMNodeRestPostTree | undefined {
        if (!this.loader || !this.loader.gltf || !this.loader.gltf.nodes) {
            return undefined;
        }

        let node = this.loader.gltf.nodes[nodeIndex];
        if (!node) {
            return undefined;
        }

        let t = Vector3.Zero();
        if (node.translation) {
            t = Vector3.FromArray(node.translation as number[]);
        }
        if (!t) {
            t = Vector3.Zero();
        } else {
            // TODO: blender
            // t = new Vector3(t.x, -t.z, t.y);
        }

        let r = new Quaternion(0, 0, 0, 1);
        if (node.rotation) {
            r = Quaternion.FromArray(node.rotation as number[]);
        }
        if (!r) {
            r = new Quaternion(0, 0, 0, 1);
        } else {
            // TODO: blender
            // r = new Quaternion(r.x, -r.z, r.y, r.w);
        }
        if (parentNode) {
            let parentMatrix = parentNode.localMatrix;
            let parentRotation = Quaternion.Zero();
            parentMatrix.decompose(undefined, parentRotation, undefined);
            r = r.multiply(parentRotation);
        }

        let s = new Vector3(1, 1, 1);
        if (node.scale) {
            s = Vector3.FromArray(node.scale as number[]);
        }
        if (!s) {
            s = new Vector3(1, 1, 1);
        } else {
            // TODO: blender
            // s = new Vector3(s.x, s.z, s.y);
        }

        // console.log(this.dumpQuaternion(r), r);
        let matrix = Matrix.Compose(s, r, t);
        // console.log(this.dumpMatrix(matrix));

        let nodeRestPostTree = new VRMNodeRestPostTree(nodeIndex, true);
        nodeRestPostTree.localMatrix = matrix;

        if (node.children) {            
            for (let childNodeIndex of node.children) {
                let childNode = this.buildNodeRestPostTree(childNodeIndex, false, nodeRestPostTree);
                if (childNode) {
                    nodeRestPostTree.children.push(childNode);
                }
            }
        }

        let nodeName = this.humanoidMap.get(nodeIndex);
        if (!nodeName) {
            nodeName = '' + nodeIndex;
        }
        nodeRestPostTree.nodeName = nodeName;
        this.nodeRestPostTreeMap.set(nodeName, nodeRestPostTree);

        return nodeRestPostTree;
    }

    public constructKeyFrames() {
        // let root = this.nodeRestPostTree;
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
                let matrix = this.findMatrix(assetContainer, value.node, key);
                if (matrix) {
                    let translation = Vector3.Zero();
                    let quaternion = Quaternion.Zero();
                    let scale = Vector3.Zero();
                    matrix.decompose(scale, quaternion, translation);
                    this.rotationMap.set(key, quaternion);
                }
            }

            if (node.translation) {
                let matrix = this.findMatrix(assetContainer, value.node, key);
                if (matrix) {
                    let translation = Vector3.Zero();
                    let quaternion = Quaternion.Zero();
                    let scale = Vector3.Zero();
                    matrix.decompose(scale, quaternion, translation);
                    this.translationMap.set(key, translation);
                }
            }
            // test end
        });
    }

    public findMatrix(assetContainer: AssetContainer, nodeIndex: number, nodeName: string): Matrix | undefined {
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
        
        matrix = matrix.clone();
        
        // let array = matrix.toArray();
        // array[0] = -array[0];
        // array[4] = -array[4];
        // array[8] = -array[8];
        // array[12] = -array[12];
        // matrix = Matrix.FromArray(array);
        
        // matrix.toggleModelMatrixHandInPlace();
        // matrix.toggleProjectionMatrixHandInPlace();
        
        this.matrixMap.set(nodeName, matrix);
        return matrix;
    }

    public dumpMatrix(matrix: Matrix): string {
        let t = Vector3.Zero();
        let r = Quaternion.Zero();
        let s = Vector3.Zero();
        matrix.decompose(s, r, t);
        let euler = r.toEulerAngles();

        let text = 'T=(';
        text += t.x.toFixed(2) + ',' + t.y.toFixed(2) + ',' + t.z.toFixed(2)
        text += '),R=(' + (euler.x / Math.PI * 180).toFixed(2) + ',' + (euler.y / Math.PI * 180).toFixed(2) + ',' + (euler.z / Math.PI * 180).toFixed(2)
        // text += r.x.toFixed(2) + ',' + r.y.toFixed(2) + ',' + r.z.toFixed(2) + ',' + r.w.toFixed(2)
        text += '),S=('
        text += s.x.toFixed(2) + ',' + s.y.toFixed(2) + ',' + s.z.toFixed(2)
        text += ')';
        return text;
    }

    public dumpQuaternion(r: Quaternion): string {
        let euler = r.toEulerAngles();
        return (euler.x / Math.PI * 180).toFixed(2) + ',' + (euler.y / Math.PI * 180).toFixed(2) + ',' + (euler.z / Math.PI * 180).toFixed(2)
    }

}
