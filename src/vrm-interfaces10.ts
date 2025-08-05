export interface IVRMVector3 {
    x: number;
    y: number;
    z: number;
}

/**
 * extensions.VRMC_vrm
 */
export interface IVRM10 {
    exporterVersion: string;
    specVersion: string;
    meta: IVRMMeta;
    humanoid: IVRMHumanoid;
    expressions: IVRMExpression;
    firstPerson: IVRMFirstPerson;
    blendShapeMaster: IVRMBlendShapeMaster;
    secondaryAnimation: IVRMSecondaryAnimation;
    materialProperties: IVRMMaterialProperty[];
}

/**
 * extensions.VRMC_vrm.meta
 */
export interface IVRMMeta {
    title: string;
    version: string;
    author: string;
    contactInformation?: string;
    reference?: string;
    texture?: number;
}

/**
 * extensions.VRMC_vrm.humanoid
 */
export interface IVRMHumanoid {
    humanBones: IVRMHumanoidBoneProperties;
    armStretch?: number;
    legStretch?: number;
    upperArmTwist?: number;
    lowerArmTwist?: number;
    upperLegTwist?: number;
    lowerLegTwist?: number;
    feetSpacing?: number;
    hasTranslationDoF?: boolean;
}

export interface IVRMHumanoidBoneProperties {
    [prop: string]: IVRMHumanoidBone | undefined;
}

export interface IVRMHumanoidBone {
    bone: string;
    node: number;
    useDefaultValues: boolean;
    min?: IVRMVector3;
    max?: IVRMVector3;
    center?: IVRMVector3;
    axisLength?: number;
}

/**
 * extensions.VRMC_vrm.expressions
 */
export interface IVRMExpression {
    preset: IVRMExpressionPresetProperties;
}

export interface IVRMExpressionPresetProperties {
    [prop: string]: IVRMExpressionMap | undefined;
}

export interface IVRMExpressionMap {
    isBinary: boolean;
    morphTargetBinds: IVRMExpressionMorphTargetBind[];
}

export interface IVRMExpressionMorphTargetBind {
    index: number;
    node: number;
    weight: number;
}

export interface IVRMFirstPersonMeshAnnotation {
    mesh: number;
    firstPersonFlag: string;
}

export interface IVRMFirstPersonDegreeMap {
    curve: number[];
    xRange: number;
    yRange: number;
}

/**
 * extensions.VRMC_vrm.firstPerson
 */
export interface IVRMFirstPerson {
    firstPersonBone: number;
    firstPersonBoneOffset: IVRMVector3;
    meshAnnotations: IVRMFirstPersonMeshAnnotation[];
    lookAtTypeName: 'Bone' | 'BlendShape';
    lookAtHorizontalInner: IVRMFirstPersonDegreeMap;
    lookAtHorizontalOuter: IVRMFirstPersonDegreeMap;
    lookAtVerticalDown: IVRMFirstPersonDegreeMap;
    lookAtVerticalUp: IVRMFirstPersonDegreeMap;
}

/**
 * extensions.VRMC_vrm.blendShapeMaster
 */
export interface IVRMBlendShapeMaster {
    blendShapeGroups: IVRMBlendShapeGroup[];
}

export interface IVRMBlendShapeGroup {
    name: string;
    presetName: string;
    binds: IVRMBlendShapeBind[];
    materialValues: IVRMBlendShapeMaterialBind[];
    isBinary: boolean;
}

export interface IVRMBlendShapeBind {
    mesh: number;
    index: number;
    weight: number;
}

export interface IVRMBlendShapeMaterialBind {
    materialName: string;
    propertyName: string;
    targetValue: number[];
}

export interface IVRMSecondaryAnimationSpring {
    name: string;
    colliderGroups: number[];
    joints: IVRMSecondaryAnimationSpringJoint[];
}

export interface IVRMSecondaryAnimationSpringJoint {
    dragForce: number;
    gravityPower: number;
    hitRadius: number;
    node: number;
    stiffiness: number;
}

export interface IVRMSecondaryAnimationCollider {
    offset: IVRMVector3;
    radius: number;
    node: number;
    shape: IVRMSecondaryAnimationColliderShape;
}

export interface IVRMSecondaryAnimationColliderShape {
    sphere: IVRMSecondaryAnimationColliderShapeSphere;
    capsule: IVRMSecondaryAnimationColliderShapeSphere
}

export interface IVRMSecondaryAnimationColliderShapeSphere {
    offset: number[];
    radius: number;
    tail: IVRMVector3;
}

export interface IVRMSecondaryAnimationColliderGroup {
    name: string;
    colliders: number[];
}

/**
 * extensions.VRMC_springBone
 */
export interface IVRMSecondaryAnimation {
    specVersion: string;
    colliderGroups: IVRMSecondaryAnimationColliderGroup[];
    colliders: IVRMSecondaryAnimationCollider[];
    springs: IVRMSecondaryAnimationSpring[];
}

export enum IVRMMaterialPropertyShader {
    VRM_USE_GLTFSHADER = 'VRM_USE_GLTFSHADER',
    VRMMToon = 'VRM/MToon',
    VRMUnlitTransparentZWrite = 'VRM/UnlitTransparentZWrite',
}

export interface IVRMMaterialPropertyFloatProperties {
    _Cutoff?: number;
    _BumpScale?: number;
    _ReceiveShadowRate?: number;
    _ShadingGradeRate?: number;
    _ShadeShift?: number;
    _ShadeToony?: number;
    _LightColorAttenuation?: number;
    _IndirectLightIntensity?: number;
    _RimLightingMix?: number;
    _RimFresnelPower?: number;
    _RimLift?: number;
    _OutlineWidth?: number;
    _OutlineScaledMaxDistance?: number;
    _OutlineLightingMix?: number;
    _UvAnimScrollX?: number;
    _UvAnimScrollY?: number;
    _UvAnimRotation?: number;
    _DebugMode?: number;
    _BlendMode?: number;
    _OutlineWidthMode?: number;
    _OutlineColorMode?: number;
    _CullMode?: number;
    _OutlineCullMode?: number;
    _SrcBlend?: number;
    _DstBlend?: number;
    _ZWrite?: number;
    [prop: string]: number | undefined;
}

export type IVRMVectorMaterialProperty = [number, number, number, number];

export interface IVRMMaterialPropertyVectorProperties {
    _Color?: IVRMVectorMaterialProperty;
    _ShadeColor?: IVRMVectorMaterialProperty;
    _MainTex?: IVRMVectorMaterialProperty;
    _ShadeTexture?: IVRMVectorMaterialProperty;
    _BumpMap?: IVRMVectorMaterialProperty;
    _ReceiveShadowTexture?: IVRMVectorMaterialProperty;
    _ShadingGradeTexture?: IVRMVectorMaterialProperty;
    _RimColor?: IVRMVectorMaterialProperty;
    _RimTexture?: IVRMVectorMaterialProperty;
    _SphereAdd?: IVRMVectorMaterialProperty;
    _EmissionColor?: IVRMVectorMaterialProperty;
    _EmissionMap?: IVRMVectorMaterialProperty;
    _OutlineWidthTexture?: IVRMVectorMaterialProperty;
    _OutlineColor?: IVRMVectorMaterialProperty;
    _UvAnimMaskTexture?: IVRMVectorMaterialProperty;
    [prop: string]: IVRMVectorMaterialProperty | undefined;
}

export interface IVRMMaterialPropertyTextureProperties {
    _MainTex?: number;
    _ShadeTexture?: number;
    _BumpMap?: number;
    _ReceiveShadowTexture?: number;
    _ShadingGradeTexture?: number;
    _RimTexture?: number;
    _SphereAdd?: number;
    _EmissionMap?: number;
    _OutlineWidthTexture?: number;
    _UvAnimMaskTexture?: number;
    [prop: string]: number | undefined;
}

export interface IVRMMaterialPropertyKeywordMap {
    _NORMALMAP?: boolean;
    _ALPHATEST_ON?: boolean;
    _ALPHABLEND_ON?: boolean;
    _ALPHAPREMULTIPLY_ON?: boolean;
}

export interface IVRMMaterialPropertyTagMap {
    RenderType?: 'Opaque' | 'TransparentCutout' | 'Transparent';
}

/**
 * extensions.VRMC_vrm.materialProperties
 */
export interface IVRMMaterialProperty {
    name: string;
    shader: IVRMMaterialPropertyShader;
    renderQueue: number;
    floatProperties: IVRMMaterialPropertyFloatProperties;
    vectorProperties: IVRMMaterialPropertyVectorProperties;
    textureProperties: IVRMMaterialPropertyTextureProperties;
    keywordMap: IVRMMaterialPropertyKeywordMap;
    tagMap: IVRMMaterialPropertyTagMap;
}
