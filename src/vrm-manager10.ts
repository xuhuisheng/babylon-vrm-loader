// import { Vector3 } from '@babylonjs/core/Maths/math';
// import type { Mesh } from '@babylonjs/core/Meshes/mesh';
// import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
// import type { MorphTarget } from '@babylonjs/core/Morph/morphTarget';
import type { Scene } from '@babylonjs/core/scene';
// import type { Nullable } from '@babylonjs/core/types';
// import { SpringBoneController } from './secondary-animation/spring-bone-controller';
import { HumanoidBone } from './humanoid-bone';
import { IVRM } from './vrm-interfaces';
import type { IVRM10 } from './vrm-interfaces10';
// import { MaterialValueBindingMerger } from './material-value-binding-merger';
import { VRMManager } from './vrm-manager'
// import { IsBinaryMap, MorphTargetMap, MaterialValueBindingMergerMap, TransformNodeMap, TransformNodeCache, MeshCache, HumanBoneName } from './vrm-interfaces-defines';

/**
 * VRM キャラクターを動作させるためのマネージャ
 */
export class VRMManager10 extends VRMManager {
    // protected isBinaryMorphMap: IsBinaryMap = {};
    // protected morphTargetMap: MorphTargetMap = {};
    // protected materialValueBindingMergerMap: MaterialValueBindingMergerMap = {};
    // protected presetMorphTargetMap: MorphTargetMap = {};
    // protected transformNodeMap: TransformNodeMap = {};
    // protected transformNodeCache: TransformNodeCache = {};
    // protected meshCache: MeshCache = {};
    // protected _humanoidBone: HumanoidBone;
    // protected _rootMesh: Mesh;

    // /**
    //  * Secondary Animation として定義されている VRM Spring Bone のコントローラ
    //  */
    // public readonly springBoneController: SpringBoneController;

    /**
     *
     * @param ext glTF.extensions.VRM の中身 json
     * @param scene
     * @param meshesFrom この番号以降のメッシュがこの VRM に該当する
     * @param transformNodesFrom この番号以降の TransformNode がこの VRM に該当する
     * @param materialsNodesFrom この番号以降の Material がこの VRM に該当する
     */
    public constructor(
        public readonly ext10: IVRM10,
        public readonly scene: Scene,
        protected readonly meshesFrom: number,
        protected readonly transformNodesFrom: number,
        protected readonly materialsNodesFrom: number
    ) {
        super(<IVRM>({} as unknown), scene, meshesFrom, transformNodesFrom, materialsNodesFrom)
        // this.meshCache = this.constructMeshCache();
        // this.transformNodeCache = this.constructTransformNodeCache();
        // this.springBoneController = new SpringBoneController(this.ext.secondaryAnimation, this.findTransformNode.bind(this));

        if (this.ext10.expressions && this.ext10.expressions.preset) {
            this.constructIsBinaryMap();
            this.constructMorphTargetMap();
            this.constructMaterialValueBindingMergerMap();
        }
        this.constructTransformNodeMap();

        this._humanoidBone = new HumanoidBone(this.transformNodeMap);
    }

    protected constructIsBinaryMap(): void {
        if (!this.ext10) {
            return
        }
        for (let key of Object.keys(this.ext10.expressions.preset)) {
            let g = this.ext10.expressions.preset[key]
            if (!g) {
                return
            }
            this.isBinaryMorphMap[key] = g.isBinary;
        }
    }

    protected constructMorphTargetMap(): void {
        if (!this.ext10) {
            return
        }
        for (let key of Object.keys(this.ext10.expressions.preset)) {
            let g = this.ext10.expressions.preset[key]
            if (!g) {
                return
            }
            if (!g.morphTargetBinds) {
                return;
            }
            let name = key
            let presetName = key
            // if (key == 'happy') {
            //     name = 'Joy'
            //     presetName = 'joy'
            // } else if (key == 'blink') {
            //     name = 'Blink'
            //     presetName = 'blink'
            // } else if (key == 'aa') {
            //     name = 'A'
            //     presetName = 'a'
            // }
            g.morphTargetBinds.forEach((b) => {
                const meshes = this.findMeshes(b.node);
                if (!meshes) {
                    console.log(`Undefined BlendShapeBind Mesh`, b);
                    return;
                }
                meshes.forEach((mesh) => {
                    const morphTargetManager = mesh.morphTargetManager;
                    if (!morphTargetManager) {
                        console.log(`Undefined morphTargetManager`, b);
                        return;
                    }
                    const target = morphTargetManager.getTarget(b.index);
                    this.morphTargetMap[name] = this.morphTargetMap[name] || [];
                    this.morphTargetMap[name].push({
                        target,
                        weight: b.weight,
                    });
                    if (presetName) {
                        this.presetMorphTargetMap[presetName] = this.presetMorphTargetMap[presetName] || [];
                        this.presetMorphTargetMap[presetName].push({
                            target,
                            weight: b.weight,
                        });
                    }
                });
            });
        }
    }

    protected constructMaterialValueBindingMergerMap() {
        if (!this.ext10) {
            return
        }
        // const materials = this.scene.materials.slice(this.materialsNodesFrom);
        // this.ext.blendShapeMaster.blendShapeGroups.forEach((g) => {
        //     if (!g.materialValues) {
        //         return;
        //     }
        //     this.materialValueBindingMergerMap[g.name] = new MaterialValueBindingMerger(materials, g.materialValues);
        // });
    }

    protected constructTransformNodeMap() {
        if (!this.ext10) {
            return
        }
        for (let key of Object.keys(this.ext10.humanoid.humanBones)) {
            let b = this.ext10.humanoid.humanBones[key]
            // console.log(key, b)
            if (!b) {
                return
            }
            const node = this.findTransformNode(b.node);
            if (!node) {
                return;
            }
            this.transformNodeMap[key] = node;
        }
    }

    public morphingPreset(label: string, value: number): void {
        if (!this.presetMorphTargetMap[label]) {
            return;
        }
        const v = this.calcMorphValue(label, value);
        this.presetMorphTargetMap[label].forEach((setting) => {
            setting.target.influence = v * (setting.weight / 1);
        });
    }
}
