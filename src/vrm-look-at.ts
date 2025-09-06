// import type { Mesh } from '@babylonjs/core/Meshes/mesh';
// import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
// import type { MorphTarget } from '@babylonjs/core/Morph/morphTarget';
// import type { Scene } from '@babylonjs/core/scene';
// import type { AssetContainer } from '@babylonjs/core/assetContainer';
import { Quaternion } from '@babylonjs/core/Maths/math';
import { Vector3 } from '@babylonjs/core/Maths/math';
// import { Matrix } from '@babylonjs/core/Maths/math';
// import type { Nullable } from '@babylonjs/core/types';
import { GLTFLoader } from '@babylonjs/loaders/glTF/2.0';
import { VRMManager10 } from './vrm-manager10'

const VEC3_POSITIVE_Z = new Vector3(0.0, 0.0, 1.0);
const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

export class VRMLookAt {

    public offsetFromHeadBone: Vector3 = new Vector3(0, 0.06, 0);
    public faceFront = new Vector3(0.0, 0.0, 1.0);
    protected _yaw: number;
    protected _pitch: number;
    public target?: Vector3 | null;
    public _restHeadWorldQuaternion: Quaternion = Quaternion.Identity();
    public _needsUpdate: boolean = false;
    public autoUpdate: boolean = false;

    public _restQuatLeftEye: Quaternion;
    public _restQuatRightEye: Quaternion;
    public _restLeftEyeParentWorldQuat: Quaternion;
    public _restRightEyeParentWorldQuat: Quaternion;

    public constructor(
        public readonly vrmManager: VRMManager10,
        public readonly gltfLoader: GLTFLoader
    ) {
        this.constructLookAt();
    }

    public constructLookAt() {
        if (!this.gltfLoader || !this.gltfLoader.gltf || !this.gltfLoader.gltf.nodes || this.gltfLoader.gltf.nodes.length <= 0) {
            return;
        }
        // let nodes = this.gltfLoader.gltf.nodes;
        // this._restHeadWorldQuaternion = this.getLookAtWorldQuaternion(new THREE.Quaternion());
        this._restHeadWorldQuaternion = this.getLookAtWorldQuaternion(Quaternion.Identity());

        this._restQuatLeftEye = Quaternion.Identity();
        if (this.vrmManager && this.vrmManager.humanoidBone && this.vrmManager.humanoidBone.leftEye && this.vrmManager.humanoidBone.leftEye.rotationQuaternion) {
            this._restQuatLeftEye = this.vrmManager.humanoidBone.leftEye.rotationQuaternion.clone();
        }
        this._restQuatRightEye = Quaternion.Identity();
        if (this.vrmManager && this.vrmManager.humanoidBone && this.vrmManager.humanoidBone.rightEye && this.vrmManager.humanoidBone.rightEye.rotationQuaternion) {
            this._restQuatRightEye = this.vrmManager.humanoidBone.rightEye.rotationQuaternion.clone();
        }
        this._restLeftEyeParentWorldQuat = this.getLookAtWorldQuaternion(Quaternion.Zero()).clone() ?? Quaternion.Identity();
        this._restRightEyeParentWorldQuat = this.getLookAtWorldQuaternion(Quaternion.Zero()).clone() ?? Quaternion.Identity();
    }

    public lookAt(position: Vector3): void {
        console.log('look at', 'position', position);
        let _quatA = Quaternion.Identity();
        let _quatB = Quaternion.Identity();
        let _v3B = Vector3.Zero();
        let _v3C = Vector3.Zero();

        // console.log('look at', 'this._restHeadWorldQuaternion', this._restHeadWorldQuaternion);
        // console.log('look at', 'this.getLookAtWorldQuaternion(_quatB)', this.getLookAtWorldQuaternion(_quatB));
        // console.log('look at', 'this.quatInvertCompat(this.getLookAtWorldQuaternion(_quatB))', this.quatInvertCompat(this.getLookAtWorldQuaternion(_quatB)));

        // Look at direction in local coordinate
        const headRotDiffInv = _quatA
          .copyFrom(this._restHeadWorldQuaternion)
          .multiply(this.quatInvertCompat(this.getLookAtWorldQuaternion(_quatB)));

          // console.log('_quatA', _quatA)
          // console.log('this._restHeadWorldQuaternion', this._restHeadWorldQuaternion)
          // console.log('_quatB', _quatB)
          // console.log('this.getLookAtWorldQuaternion(_quatB)', this.getLookAtWorldQuaternion(_quatB))
          // console.log('this.quatInvertCompat(this.getLookAtWorldQuaternion(_quatB))', this.quatInvertCompat(this.getLookAtWorldQuaternion(_quatB)))
          // console.log('headRotDiffInv', headRotDiffInv)

          // headRotDiffInv.x = 0
          // headRotDiffInv.y = 0
          // headRotDiffInv.z = 0
          // headRotDiffInv.w = 1

        // console.log('look at', 'headRotDiffInv', this.dumpQuaternion(headRotDiffInv), headRotDiffInv);

        const headPos = this.getLookAtWorldPosition(_v3B);

        // console.log('look at', 'headPos', headPos);

        // const lookAtDir = _v3C.copy(position).sub(headPos).applyQuaternion(headRotDiffInv).normalize();
        const lookAtDir = _v3C.copyFrom(position).subtract(headPos).applyRotationQuaternion(headRotDiffInv).normalize();

        // console.log('look at', 'lookAtDir', lookAtDir);

        // calculate angles
        let [azimuthFrom, altitudeFrom] = this.calcAzimuthAltitude(this.faceFront);
        let [azimuthTo, altitudeTo] = this.calcAzimuthAltitude(lookAtDir);

        // azimuthTo = 0

        // console.log('look at', 'azimuthFrom', azimuthFrom);
        // console.log('look at', 'altitudeFrom', altitudeFrom);
        // console.log('look at', 'azimuthTo', azimuthTo);
        // console.log('look at', 'altitudeTo', altitudeTo);

        const yaw = this.sanitizeAngle(azimuthTo - azimuthFrom);
        const pitch = this.sanitizeAngle(altitudeFrom - altitudeTo); // spinning (1, 0, 0) CCW around Z axis makes the vector look up, while spinning (0, 0, 1) CCW around X axis makes the vector look down


        // apply angles
        this._yaw = -RAD2DEG * yaw;
        this._pitch = RAD2DEG * pitch;

        // console.log('look at', 'RAD2DEG', RAD2DEG);

        console.log('look at', 'yaw', yaw, 'pitch', pitch);

        console.log('look at', 'yaw', this._yaw, 'pitch', this._pitch);

        // // yaw 沿 y 轴旋转，左手坐标系（感觉又不是左手坐标系？）从第一视角，正数向左看，负数向右看
        // this._yaw = -10;
        // // pitch 沿 x 轴旋转，左手坐标系（正数向下看，负数向上看）
        // this._pitch = 0;

        this._needsUpdate = true;
    }

    public update(deltaTime: number) {
        if (this.target != null && this.autoUpdate) {
          // this.lookAt(this.target.getWorldPosition(_v3A));
          this.lookAt(this.target);
        }

        if (this._needsUpdate) {
          this._needsUpdate = false;

          // this.applier.applyYawPitch(this._yaw, this._pitch);
          this.applyYawPitch(this._yaw, this._pitch);
        }
    }

    public applyYawPitch(yaw: number, pitch: number) {
        console.log('yaw', yaw, 'pitch', pitch);

        let leftEye = this.vrmManager.humanoidBone.leftEye;
        // let rightEye = this.vrmManager.humanoidBone.rightEye;

        // left
        if (leftEye) {
            let x = 0;
            let y = 0;
          if (pitch < 0.0) {
            // _eulerA.x = -this.DEG2RAD * this.rangeMapVerticalDown.map(-pitch);
            x = -DEG2RAD * (-pitch);
          } else {
            // _eulerA.x = this.DEG2RAD * this.rangeMapVerticalUp.map(pitch);
            x = DEG2RAD * (pitch);
          }

          if (yaw < 0.0) {
            // _eulerA.y = -this.DEG2RAD * this.rangeMapHorizontalInner.map(-yaw);
            y = -DEG2RAD * (-yaw);
          } else {
            // _eulerA.y = this.DEG2RAD * this.rangeMapHorizontalOuter.map(yaw);
            y = DEG2RAD * (yaw);
          }

          // _quatA.setFromEuler(_eulerA);
          // let _quatA = Quaternion.RotationYawPitchRoll(x, y, 0);
          let _quatA = Quaternion.RotationYawPitchRoll(y, x, 0);
        
            console.log('look at', '_quatA', this.dumpQuaternion(_quatA), _quatA);

          let _quatB = Quaternion.Identity();
          this._getWorldFaceFrontQuat(_quatB);

          // _quatB * _quatA * _quatB^-1
          // where _quatA is LookAt rotation
          // and _quatB is worldFaceFrontQuat
          // leftEyeNormalized!.quaternion.copy(_quatB).multiply(_quatA).multiply(_quatB.invert());
          let leftEyeNormalized = _quatB.multiply(_quatA).multiply(_quatB.invert());

          // _quatA.copy(this._restLeftEyeParentWorldQuat);
          _quatA.copyFrom(this._restLeftEyeParentWorldQuat);

          // _quatA^-1 * leftEyeNormalized.quaternion * _quatA * restQuatLeftEye
          // where _quatA is restLeftEyeParentWorldQuat
          // leftEye.quaternion
          //   .copy(leftEyeNormalized!.quaternion)
          //   .multiply(_quatA)
          //   .premultiply(_quatA.invert())
          //   .multiply(this._restQuatLeftEye);
          leftEye.rotationQuaternion = 
            _quatA.invert().multiply(
                leftEyeNormalized
                .multiply(_quatA)
            )
            .multiply(this._restQuatLeftEye);
        
            console.log('look at', 'this._restQuatLeftEye', this.dumpQuaternion(this._restQuatLeftEye), this._restQuatLeftEye);
            console.log('look at', 'leftEye.rotationQuaternion', this.dumpQuaternion(leftEye.rotationQuaternion), leftEye.rotationQuaternion);
        }
    }

    //
    public quatInvertCompat(q: Quaternion): Quaternion {
        return q.invert();
    }

    public getLookAtWorldQuaternion(target: Quaternion): Quaternion {
        // const head = this.humanoid.getRawBoneNode('head')!;

        // return getWorldQuaternionLite(head, target);

        return this.vrmManager.humanoidBone.head.rotationQuaternion ?? Quaternion.Identity();
    }

    public getLookAtWorldPosition(target: Vector3): Vector3 {
        let head = this.vrmManager.humanoidBone.head;
        let matrix = head.computeWorldMatrix(true);
        let rotate = Quaternion.Identity();
        let position = Vector3.Zero();
        matrix.decompose(undefined, rotate, position);


          // rotate.x = -0.5
          // rotate.y = -0.5
          // rotate.z = -0.5
          // rotate.w = 0.5

        // const head = this.humanoid.getRawBoneNode('head')!;
        // return target.copy(this.offsetFromHeadBone).applyMatrix4(head.matrixWorld);

        const v1 = this.offsetFromHeadBone.applyRotationQuaternion(rotate ?? Quaternion.Identity());

        const v2 = v1.add(position);

        // console.log('head', 'head', head)
        // console.log('head', 'head.position', position)

        return v2;
    }

    // public getWorldQuaternionLite(object: THREE.Object3D, out: THREE.Quaternion): THREE.Quaternion {
    //   object.matrixWorld.decompose(_position, out, _scale);
    //   return out;
    // }

    public calcAzimuthAltitude(vector: Vector3): [azimuth: number, altitude: number] {
      return [Math.atan2(-vector.z, vector.x), Math.atan2(vector.y, Math.sqrt(vector.x * vector.x + vector.z * vector.z))];
    }

    public sanitizeAngle(angle: number): number {
      const roundTurn = Math.round(angle / 2.0 / Math.PI);
      return angle - 2.0 * Math.PI * roundTurn;
    }

  private _getWorldFaceFrontQuat(target: Quaternion): Quaternion {
    // if (this.faceFront.distanceToSquared(VEC3_POSITIVE_Z) < 0.01) {
    if (Vector3.DistanceSquared(this.faceFront, VEC3_POSITIVE_Z) < 0.01) {
      // return target.identity();
        return target;
    }

    const [faceFrontAzimuth, faceFrontAltitude] = this.calcAzimuthAltitude(this.faceFront);
    // _eulerA.set(0.0, 0.5 * Math.PI + faceFrontAzimuth, faceFrontAltitude, 'YZX');

    // return target.setFromEuler(_eulerA);
    return Quaternion.RotationYawPitchRoll(0.0, 0.5 * Math.PI + faceFrontAzimuth, faceFrontAltitude);
  }

    public dumpQuaternion(r: Quaternion): string {
        let euler = r.toEulerAngles();
        return (euler.x / Math.PI * 180).toFixed(2) + ',' + (euler.y / Math.PI * 180).toFixed(2) + ',' + (euler.z / Math.PI * 180).toFixed(2)
    }

}
