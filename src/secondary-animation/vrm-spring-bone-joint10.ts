// import { Matrix, Quaternion, Vector3 } from '@babylonjs/core/Maths/math';
// import { Vector3 } from '@babylonjs/core/Maths/math';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Nullable } from '@babylonjs/core/types';
import type { ColliderGroup10 } from './collider-group10';
import { VRMSpringBoneJointSetting10 } from './vrm-spring-bone-joint-setting10'
// based on
// http://rocketjump.skr.jp/unity3d/109/
// https://github.com/dwango/UniVRM/blob/master/Scripts/SpringBone/VRMSpringBone.cs
// https://github.com/pixiv/three-vrm/blob/aad551e041fad553c19d2091e5f5eaff1eb8faa8/packages/three-vrm/src/springbone/VRMSpringBone.ts


/**
 * Verlet Spring Bone join
 */
export class VRMSpringBoneJoint10 {
    // public node: number;

    // public hitRadius: number;

    // public dragForce: number;

    // public gravityPower: number;

    // public stiffness: number;

    // public gravityDir: Vector3;

    public center: TransformNode;

    public constructor(public node: Nullable<TransformNode>, public child: TransformNode | null, public setting: VRMSpringBoneJointSetting10, public colliderGroupsForSpring: ColliderGroup10[]) {
    }

}
