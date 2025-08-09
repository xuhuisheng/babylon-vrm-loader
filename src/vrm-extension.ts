import type { Material } from '@babylonjs/core/Materials/material';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Nullable } from '@babylonjs/core/types';
import type { IGLTFLoaderExtension, IMaterial, IMeshPrimitive } from '@babylonjs/loaders/glTF/2.0';
import { GLTFLoader } from '@babylonjs/loaders/glTF/2.0';
import { VRMManager } from './vrm-manager';
import { VRMManager10 } from './vrm-manager10';
import { VRMAnimationManager10 } from './vrm-animation-manager10';
import { VRMMaterialGenerator } from './vrm-material-generator';

/**
 * `extensions` に入る拡張キー
 */
const NAME = 'VRM';

/**
 * VRM 拡張を処理する
 * [Specification](https://github.com/vrm-c/vrm-specification/tree/master/specification/0.0)
 */
export class VRM implements IGLTFLoaderExtension {
    /**
     * @inheritdoc
     */
    public readonly name = NAME;
    /**
     * @inheritdoc
     */
    public enabled = true;
    /**
     * この Mesh index 以降が読み込み対象
     */
    private meshesFrom = 0;
    /**
     * この TransformNode index 以降が読み込み対象
     */
    private transformNodesFrom = 0;
    /**
     * この Material index 以降が読み込み対象
     */
    private materialsFrom = 0;

    /**
     * @inheritdoc
     */
    public constructor(private loader: GLTFLoader) {
        // GLTFLoader has already added rootMesh as __root__ before load extension
        // @see glTFLoader._loadData
        this.meshesFrom = this.loader.babylonScene.meshes.length - 1;
        this.transformNodesFrom = this.loader.babylonScene.transformNodes.length;
        this.materialsFrom = this.loader.babylonScene.materials.length;
    }

    /**
     * @inheritdoc
     */
    public dispose(): void {
        (this.loader as any) = null;
    }

    /**
     * @inheritdoc
     */
    public onReady() {
        if (!this.loader.gltf.extensions || (!this.loader.gltf.extensions[NAME] && !this.loader.gltf.extensions["VRMC_vrm"] && !this.loader.gltf.extensions["VRMC_vrm_animation"])) {
            return;
        }
        const scene = this.loader.babylonScene;
        // const vrmExtension = this.loader.gltf.extensions[NAME] || this.loader.gltf.extensions["VRMC_vrm"]
        // const manager = new VRMManager(vrmExtension, this.loader.babylonScene, this.meshesFrom, this.transformNodesFrom, this.materialsFrom);
        if (this.loader.gltf.extensions[NAME]) {
            // 0.x
            let manager = new VRMManager(this.loader.gltf.extensions[NAME], this.loader.babylonScene, this.meshesFrom, this.transformNodesFrom, this.materialsFrom);

            scene.metadata = scene.metadata || {};
            scene.metadata.vrmManagers = scene.metadata.vrmManagers || [];
            scene.metadata.vrmManagers.push(manager);
            this.loader.babylonScene.onDisposeObservable.add(() => {
                // Scene dispose 時に Manager も破棄する
                manager.dispose();
                this.loader.babylonScene.metadata.vrmManagers = [];
            });
        } else if (this.loader.gltf.extensions["VRMC_vrm"]) {
            // 1.0
            let manager = new VRMManager10(this.loader.gltf.extensions["VRMC_vrm"], this.loader.gltf.extensions["VRMC_springBone"], this.loader.babylonScene, this.meshesFrom, this.transformNodesFrom, this.materialsFrom);

            scene.metadata = scene.metadata || {};
            scene.metadata.vrmManagers = scene.metadata.vrmManagers || [];
            scene.metadata.vrmManagers.push(manager);
            this.loader.babylonScene.onDisposeObservable.add(() => {
                // Scene dispose 時に Manager も破棄する
                manager.dispose();
                this.loader.babylonScene.metadata.vrmManagers = [];
            });
        } else if (this.loader.gltf.extensions["VRMC_vrm_animation"]) {
            // animation has no vrtManager, now
            let vrmAnimationManager = new VRMAnimationManager10(this.loader.gltf.extensions["VRMC_vrm_animation"], this.loader, this.loader.babylonScene);
            scene.metadata = scene.metadata || {};
            scene.metadata.vrmAnimationManagers = scene.metadata.vrtAnimationManagers || [];
            scene.metadata.vrmAnimationManagers.push(vrmAnimationManager);
            return;
        }
    }

    /**
     * @inheritdoc
     */
    public _loadVertexDataAsync(context: string, primitive: IMeshPrimitive, babylonMesh: Mesh) {
        if (!primitive.extras || !primitive.extras.targetNames) {
            return null;
        }
        // まだ MorphTarget が生成されていないので、メタ情報にモーフターゲット情報を入れておく
        babylonMesh.metadata = babylonMesh.metadata || {};
        babylonMesh.metadata.vrmTargetNames = primitive.extras.targetNames;
        return null;
    }

    /**
     * @inheritdoc
     */
    public _loadMaterialAsync(context: string, material: IMaterial, mesh: Mesh, babylonDrawMode: number, assign: (babylonMaterial: Material) => void): Nullable<Promise<Material>> {
        // ジェネレータでマテリアルを生成する
        return new VRMMaterialGenerator(this.loader).generate(context, material, mesh, babylonDrawMode, assign);
    }
}

// ローダーに登録する
GLTFLoader.RegisterExtension(NAME, (loader) => new VRM(loader));
