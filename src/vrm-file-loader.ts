import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { GLTFFileLoader } from '@babylonjs/loaders/glTF/glTFFileLoader';

/**
 * VRM/VCI ファイルを読み込めるようにする
 * 拡張子を変更しただけ
 */
export class VRMFileLoader extends GLTFFileLoader {
}

export class VRMFileLoaderPlugin {
    public name = "vrm";
    public extensions = {
        '.vrm': { isBinary: true },
        '.vci': { isBinary: true },
    };

    public createPlugin() {
        return new VRMFileLoader();
    }
}

if (SceneLoader) {
    SceneLoader.RegisterPlugin(new VRMFileLoaderPlugin());
}
