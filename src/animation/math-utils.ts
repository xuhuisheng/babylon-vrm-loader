
import { Vector3 } from '@babylonjs/core/Maths/math';
import { Quaternion } from '@babylonjs/core/Maths/math';

export class MathUtils {
  public static DEG2RAD: number = Math.PI / 180;
  
  public static euclideanModulo(a: any, b: any): number {
    return 0;
  }

}

export interface VRM {
  humanoid: any;
  scene: any;
}

export class NumberKeyframeTrack {
  constructor(srcName: any, times: any, values: any) {
  }
}

export class VectorKeyframeTrack {
  constructor(srcName: any, times: any, values: any) {
  }
}

export class QuaternionKeyframeTrack {
  constructor(srcName: any, times: any, values: any) {
  }
}

export class AnimationClip {
  constructor(srcName: any, times: any, values: any) {
  }
}

export class KeyframeTrack {

}

export class Object3D {
  public name:string;
  public matrixWorld: any;
  public add(v: any): void {
  }
}

export class Bone {
  public name:string;
  public parent: Bone;
  public matrixWorld: any;
  public rotation: Vector3;
  public quaternion: Quaternion;
  public updateMatrixWorld(force: boolean): void {
  }
  public add(v: any): void {
  }
}

export declare const VRMHumanBoneName: {
    readonly Hips: "hips";
    readonly Spine: "spine";
    readonly Chest: "chest";
    readonly UpperChest: "upperChest";
    readonly Neck: "neck";
    readonly Head: "head";
    readonly LeftEye: "leftEye";
    readonly RightEye: "rightEye";
    readonly Jaw: "jaw";
    readonly LeftUpperLeg: "leftUpperLeg";
    readonly LeftLowerLeg: "leftLowerLeg";
    readonly LeftFoot: "leftFoot";
    readonly LeftToes: "leftToes";
    readonly RightUpperLeg: "rightUpperLeg";
    readonly RightLowerLeg: "rightLowerLeg";
    readonly RightFoot: "rightFoot";
    readonly RightToes: "rightToes";
    readonly LeftShoulder: "leftShoulder";
    readonly LeftUpperArm: "leftUpperArm";
    readonly LeftLowerArm: "leftLowerArm";
    readonly LeftHand: "leftHand";
    readonly RightShoulder: "rightShoulder";
    readonly RightUpperArm: "rightUpperArm";
    readonly RightLowerArm: "rightLowerArm";
    readonly RightHand: "rightHand";
    readonly LeftThumbMetacarpal: "leftThumbMetacarpal";
    readonly LeftThumbProximal: "leftThumbProximal";
    readonly LeftThumbDistal: "leftThumbDistal";
    readonly LeftIndexProximal: "leftIndexProximal";
    readonly LeftIndexIntermediate: "leftIndexIntermediate";
    readonly LeftIndexDistal: "leftIndexDistal";
    readonly LeftMiddleProximal: "leftMiddleProximal";
    readonly LeftMiddleIntermediate: "leftMiddleIntermediate";
    readonly LeftMiddleDistal: "leftMiddleDistal";
    readonly LeftRingProximal: "leftRingProximal";
    readonly LeftRingIntermediate: "leftRingIntermediate";
    readonly LeftRingDistal: "leftRingDistal";
    readonly LeftLittleProximal: "leftLittleProximal";
    readonly LeftLittleIntermediate: "leftLittleIntermediate";
    readonly LeftLittleDistal: "leftLittleDistal";
    readonly RightThumbMetacarpal: "rightThumbMetacarpal";
    readonly RightThumbProximal: "rightThumbProximal";
    readonly RightThumbDistal: "rightThumbDistal";
    readonly RightIndexProximal: "rightIndexProximal";
    readonly RightIndexIntermediate: "rightIndexIntermediate";
    readonly RightIndexDistal: "rightIndexDistal";
    readonly RightMiddleProximal: "rightMiddleProximal";
    readonly RightMiddleIntermediate: "rightMiddleIntermediate";
    readonly RightMiddleDistal: "rightMiddleDistal";
    readonly RightRingProximal: "rightRingProximal";
    readonly RightRingIntermediate: "rightRingIntermediate";
    readonly RightRingDistal: "rightRingDistal";
    readonly RightLittleProximal: "rightLittleProximal";
    readonly RightLittleIntermediate: "rightLittleIntermediate";
    readonly RightLittleDistal: "rightLittleDistal";
};
export type VRMHumanBoneName = (typeof VRMHumanBoneName)[keyof typeof VRMHumanBoneName];

export function clampVector3ByRadian(
  // v: Vector3 | Euler,
  v: Vector3,
  min?: Vector3,
  max?: Vector3
) {
  return v.set(
    clampByRadian(v.x, min?.x, max?.x),
    clampByRadian(v.y, min?.y, max?.y),
    clampByRadian(v.z, min?.z, max?.z)
  );
}

export function clampByRadian(
  v: number,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY
) {
  const hasMin = Number.isFinite(min);
  const hasMax = Number.isFinite(max);
  if (hasMin && hasMax && min === max) return min;
  if (hasMin) min = MathUtils.euclideanModulo(min, PI2);
  if (hasMax) max = MathUtils.euclideanModulo(max, PI2);
  v = MathUtils.euclideanModulo(v, PI2);
  if (hasMin && hasMax && min >= max) {
    max += PI2;
    if (v < Math.PI) v += PI2;
  }
  if (hasMax && v > max) v = max;
  else if (hasMin && v < min) v = min;
  return MathUtils.euclideanModulo(v, PI2);
}

const PI2 = Math.PI * 2;

export const enum VMDBoneNames {
  Root = '全ての親',
  Center = 'センター',
  Hips = '下半身',
  Spine = '上半身',
  Chest = '上半身2',
  Neck = '首',
  Head = '頭',
  LeftEye = '左目',
  LeftShoulder = '左肩',
  LeftUpperArm = '左腕',
  LeftLowerArm = '左ひじ',
  LeftHand = '左手首',
  LeftThumbProximal = '左親指０',
  LeftThumbIntermediate = '左親指１',
  LeftThumbDistal = '左親指２',
  LeftIndexProximal = '左人指１',
  LeftIndexIntermediate = '左人指２',
  LeftIndexDistal = '左人指３',
  LeftMiddleProximal = '左中指１',
  LeftMiddleIntermediate = '左中指２',
  LeftMiddleDistal = '左中指３',
  LeftRingProximal = '左薬指１',
  LeftRingIntermediate = '左薬指２',
  LeftRingDistal = '左薬指３',
  LeftLittleProximal = '左小指１',
  LeftLittleIntermediate = '左小指２',
  LeftLittleDistal = '左小指３',
  LeftUpperLeg = '左足',
  LeftLowerLeg = '左ひざ',
  LeftFoot = '左足首',
  LeftFootIK = '左足ＩＫ',
  LeftToes = '左つま先',
  LeftToeIK = '左つま先ＩＫ',
  RightEye = '右目',
  RightShoulder = '右肩',
  RightUpperArm = '右腕',
  RightLowerArm = '右ひじ',
  RightHand = '右手首',
  RightThumbProximal = '右親指０',
  RightThumbIntermediate = '右親指１',
  RightThumbDistal = '右親指２',
  RightIndexProximal = '右人指１',
  RightIndexIntermediate = '右人指２',
  RightIndexDistal = '右人指３',
  RightMiddleProximal = '右中指１',
  RightMiddleIntermediate = '右中指２',
  RightMiddleDistal = '右中指３',
  RightRingProximal = '右薬指１',
  RightRingIntermediate = '右薬指２',
  RightRingDistal = '右薬指３',
  RightLittleProximal = '右小指１',
  RightLittleIntermediate = '右小指２',
  RightLittleDistal = '右小指３',
  RightUpperLeg = '右足',
  RightLowerLeg = '右ひざ',
  RightFoot = '右足首',
  RightFootIK = '右足ＩＫ',
  RightToes = '右つま先',
  RightToeIK = '右つま先ＩＫ',
}

export const enum VMDMorphNames {
  Blink = 'まばたき',
  BlinkR = 'ウィンク',
  BlinkL = 'ウィンク右',
  A = 'あ',
  I = 'い',
  U = 'う',
  E = 'え',
  O = 'お',
}

export interface Keyframe {
  boneName: string;
  frameNum: number;
  position: Vector3;
  rotation: Quaternion;
}

export interface LerpKeyframe extends Keyframe {
  isNew?: boolean;
}

export interface IKOffsetInit {
  /** Default X */ x: number;
  /** Default Y */ y: number;
  /** Default Z */ z: number;
  /** Scale (All axis) */ s?: number;
  /** Scale X */ sx?: number;
  /** Scale Y */ sy?: number;
  /** Scale Z */ sz?: number;
  /** Offset (All axis) */ o?: number;
  /** Offset X */ ox?: number;
  /** Offset Y */ oy?: number;
  /** Offset Z */ oz?: number;
  /** Force override X value? */ dx?: boolean;
  /** Force override Y value? */ dy?: boolean;
  /** Force override Z value? */ dz?: boolean;
}

export interface AnimationData {
  duration: number;
  timelines: Timeline[];
}

export interface Timeline {
  // name: VRMHumanBoneName | VRMExpressionPresetName;
  name: string;
  type: string;
  isIK?: boolean;
  times: number[];
  values: number[];
}

export interface VRMOffsets {
  hipsOffset?: number[];
  leftFootOffset?: number[];
  rightFootOffset?: number[];
  leftToeOffset?: number[];
  rightToeOffset?: number[];
}

export const VRM_VMD_BONE_MAP = new Map<VMDBoneNames, HumanoidBoneName>([
  [VMDBoneNames.Hips, HumanoidBoneName.Hips],
  [VMDBoneNames.Spine, HumanoidBoneName.Spine],
  [VMDBoneNames.Chest, HumanoidBoneName.Chest],
  [VMDBoneNames.Neck, HumanoidBoneName.Neck],
  [VMDBoneNames.Head, HumanoidBoneName.Head],
  [VMDBoneNames.LeftEye, HumanoidBoneName.LeftEye],
  [VMDBoneNames.LeftShoulder, HumanoidBoneName.LeftShoulder],
  [VMDBoneNames.LeftUpperArm, HumanoidBoneName.LeftUpperArm],
  [VMDBoneNames.LeftLowerArm, HumanoidBoneName.LeftLowerArm],
  [VMDBoneNames.LeftHand, HumanoidBoneName.LeftHand],
  [VMDBoneNames.LeftThumbProximal, HumanoidBoneName.LeftThumbProximal],
  [VMDBoneNames.LeftThumbIntermediate, HumanoidBoneName.LeftThumbMetacarpal],
  [VMDBoneNames.LeftThumbDistal, HumanoidBoneName.LeftThumbDistal],
  [VMDBoneNames.LeftIndexProximal, HumanoidBoneName.LeftIndexProximal],
  [VMDBoneNames.LeftIndexIntermediate, HumanoidBoneName.LeftIndexIntermediate],
  [VMDBoneNames.LeftIndexDistal, HumanoidBoneName.LeftIndexDistal],
  [VMDBoneNames.LeftMiddleProximal, HumanoidBoneName.LeftMiddleProximal],
  [
    VMDBoneNames.LeftMiddleIntermediate,
    HumanoidBoneName.LeftMiddleIntermediate,
  ],
  [VMDBoneNames.LeftMiddleDistal, HumanoidBoneName.LeftMiddleDistal],
  [VMDBoneNames.LeftRingProximal, HumanoidBoneName.LeftRingProximal],
  [VMDBoneNames.LeftRingIntermediate, HumanoidBoneName.LeftRingIntermediate],
  [VMDBoneNames.LeftRingDistal, HumanoidBoneName.LeftRingDistal],
  [VMDBoneNames.LeftLittleProximal, HumanoidBoneName.LeftLittleProximal],
  [
    VMDBoneNames.LeftLittleIntermediate,
    HumanoidBoneName.LeftLittleIntermediate,
  ],
  [VMDBoneNames.LeftLittleDistal, HumanoidBoneName.LeftLittleDistal],
  [VMDBoneNames.LeftUpperLeg, HumanoidBoneName.LeftUpperLeg],
  [VMDBoneNames.LeftLowerLeg, HumanoidBoneName.LeftLowerLeg],
  [VMDBoneNames.LeftFoot, HumanoidBoneName.LeftFoot],
  [VMDBoneNames.LeftToes, HumanoidBoneName.LeftToes],
  [VMDBoneNames.RightEye, HumanoidBoneName.RightEye],
  [VMDBoneNames.RightShoulder, HumanoidBoneName.RightShoulder],
  [VMDBoneNames.RightUpperArm, HumanoidBoneName.RightUpperArm],
  [VMDBoneNames.RightLowerArm, HumanoidBoneName.RightLowerArm],
  [VMDBoneNames.RightHand, HumanoidBoneName.RightHand],
  [VMDBoneNames.RightThumbProximal, HumanoidBoneName.RightThumbProximal],
  [
    VMDBoneNames.RightThumbIntermediate,
    HumanoidBoneName.RightThumbMetacarpal,
  ],
  [VMDBoneNames.RightThumbDistal, HumanoidBoneName.RightThumbDistal],
  [VMDBoneNames.RightIndexProximal, HumanoidBoneName.RightIndexProximal],
  [
    VMDBoneNames.RightIndexIntermediate,
    HumanoidBoneName.RightIndexIntermediate,
  ],
  [VMDBoneNames.RightIndexDistal, HumanoidBoneName.RightIndexDistal],
  [VMDBoneNames.RightMiddleProximal, HumanoidBoneName.RightMiddleProximal],
  [
    VMDBoneNames.RightMiddleIntermediate,
    HumanoidBoneName.RightMiddleIntermediate,
  ],
  [VMDBoneNames.RightMiddleDistal, HumanoidBoneName.RightMiddleDistal],
  [VMDBoneNames.RightRingProximal, HumanoidBoneName.RightRingProximal],
  [VMDBoneNames.RightRingIntermediate, HumanoidBoneName.RightRingIntermediate],
  [VMDBoneNames.RightRingDistal, HumanoidBoneName.RightRingDistal],
  [VMDBoneNames.RightLittleProximal, HumanoidBoneName.RightLittleProximal],
  [
    VMDBoneNames.RightLittleIntermediate,
    HumanoidBoneName.RightLittleIntermediate,
  ],
  [VMDBoneNames.RightLittleDistal, HumanoidBoneName.RightLittleDistal],
  [VMDBoneNames.RightUpperLeg, HumanoidBoneName.RightUpperLeg],
  [VMDBoneNames.RightLowerLeg, HumanoidBoneName.RightLowerLeg],
  [VMDBoneNames.RightFoot, HumanoidBoneName.RightFoot],
  [VMDBoneNames.RightToes, HumanoidBoneName.RightToes],
]);
export const VMD_VRM_IK_MAP = new Map<VMDBoneNames, HumanoidBoneName>([
  [VMDBoneNames.LeftFootIK, HumanoidBoneName.LeftFoot],
  [VMDBoneNames.LeftToeIK, HumanoidBoneName.LeftToes],
  [VMDBoneNames.RightFootIK, HumanoidBoneName.RightFoot],
  [VMDBoneNames.RightToeIK, HumanoidBoneName.RightToes],
]);
export const VMD_BONE_NAMES = new Set<VMDBoneNames>(VRM_VMD_BONE_MAP.keys());
Array.from(VMD_VRM_IK_MAP.keys()).forEach(VMD_BONE_NAMES.add, VMD_BONE_NAMES);
VMD_BONE_NAMES.add(VMDBoneNames.Root);
VMD_BONE_NAMES.add(VMDBoneNames.Center);
export const VMD_VRM_MORTH_MAP = new Map<VMDMorphNames, BlendShapePresetName>([
  [VMDMorphNames.Blink, BlendShapePresetName.Blink],
  [VMDMorphNames.BlinkL, BlendShapePresetName.BlinkLeft],
  [VMDMorphNames.BlinkR, BlendShapePresetName.BlinkRight],
  [VMDMorphNames.A, BlendShapePresetName.Aa],
  [VMDMorphNames.I, BlendShapePresetName.Ih],
  [VMDMorphNames.U, BlendShapePresetName.Ou],
  [VMDMorphNames.E, BlendShapePresetName.Ee],
  [VMDMorphNames.O, BlendShapePresetName.Oh],
]);

export const IK_OFFSET_INIT = new Map<VMDBoneNames, IKOffsetInit>([
  [VMDBoneNames.Center, { x: 0, y: 1, z: 0, s: 10 }],
  [VMDBoneNames.LeftFootIK, { x: 1, y: 1, z: 0, s: 10, dx: true }],
  [VMDBoneNames.RightFootIK, { x: -1, y: 1, z: 0, s: 10, dx: true }],
  [VMDBoneNames.LeftToeIK, { x: 0, y: -1, z: -1, s: 10, oy: 2.5, dx: true, dz: true }],
  [VMDBoneNames.RightToeIK, { x: 0, y: -1, z: -1, s: 10, oy: 2.5, dx: true, dz: true }],
]);

export const enum BlendShapePresetName {
  Blink = 'blink',
  BlinkLeft = 'blink_l',
  BlinkRight = 'blink_r',
  Aa = 'a',
  Ih = 'i',
  Ou = 'u',
  Ee = 'e',
  Oh = 'o',
};

export const enum HumanoidBoneName {
  Chest = 'chest',
  Head = 'head',
  Hips = 'hips',
  Jaw = 'jaw',
  LeftEye = 'leftEye',
  LeftFoot = 'leftFoot',
  LeftHand = 'leftHand',
  LeftIndexDistal = 'leftIndexDistal',
  LeftIndexIntermediate = 'leftIndexIntermediate',
  LeftIndexProximal = 'leftIndexProximal',
  LeftLittleDistal = 'leftLittleDistal',
  LeftLittleIntermediate = 'leftLittleIntermediate',
  LeftLittleProximal = 'leftLittleProximal',
  LeftLowerArm = 'leftLowerArm',
  LeftLowerLeg = 'leftLowerLeg',
  LeftMiddleDistal = 'leftMiddleDistal',
  LeftMiddleIntermediate = 'leftMiddleIntermediate',
  LeftMiddleProximal = 'leftMiddleProximal',
  LeftRingDistal = 'leftRingDistal',
  LeftRingIntermediate = 'leftRingIntermediate',
  LeftRingProximal = 'leftRingProximal',
  LeftShoulder = 'leftShoulder',
  LeftThumbDistal = 'leftThumbDistal',
  LeftThumbIntermediate = 'leftThumbIntermediate',
  LeftThumbProximal = 'leftThumbProximal',
  LeftThumbMetacarpal = 'leftThumbMetacarpal',
  LeftToes = 'leftToes',
  LeftUpperArm = 'leftUpperArm',
  LeftUpperLeg = 'leftUpperLeg',
  Neck = 'neck',
  RightEye = 'rightEye',
  RightFoot = 'rightFoot',
  RightHand = 'rightHand',
  RightIndexDistal = 'rightIndexDistal',
  RightIndexIntermediate = 'rightIndexIntermediate',
  RightIndexProximal = 'rightIndexProximal',
  RightLittleDistal = 'rightLittleDistal',
  RightLittleIntermediate = 'rightLittleIntermediate',
  RightLittleProximal = 'rightLittleProximal',
  RightLowerArm = 'rightLowerArm',
  RightLowerLeg = 'rightLowerLeg',
  RightMiddleDistal = 'rightMiddleDistal',
  RightMiddleIntermediate = 'rightMiddleIntermediate',
  RightMiddleProximal = 'rightMiddleProximal',
  RightRingDistal = 'rightRingDistal',
  RightRingIntermediate = 'rightRingIntermediate',
  RightRingProximal = 'rightRingProximal',
  RightShoulder = 'rightShoulder',
  RightThumbDistal = 'rightThumbDistal',
  RightThumbIntermediate = 'rightThumbIntermediate',
  RightThumbProximal = 'rightThumbProximal',
  RightThumbMetacarpal = 'rightThumbMetacarpal',
  RightToes = 'rightToes',
  RightUpperArm = 'rightUpperArm',
  RightUpperLeg = 'rightUpperLeg',
  Spine = 'spine',
  UpperChest = 'upperChest',
};

export function isTruely<T>(x: T): x is Exclude<T, false | "" | 0 | null | undefined> {
  return !!x;
}


