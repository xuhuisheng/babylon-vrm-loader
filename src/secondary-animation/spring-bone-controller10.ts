import { Vector3 } from '@babylonjs/core/Maths/math';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Nullable } from '@babylonjs/core/types';
import type { IVRMSecondaryAnimation, IVRMSecondaryAnimationSpringJoint } from '../vrm-interfaces10';
import { ColliderGroup10 } from './collider-group10';
import { VRMSpringBone10 } from './vrm-spring-bone10';
import { VRMSpringBoneJoint10 } from './vrm-spring-bone-joint10'
import { VRMSpringBoneJointSetting10 } from './vrm-spring-bone-joint-setting10'

/**
 * function to get bone from nodeIndex
 */
type getBone = (nodeIndex: number) => Nullable<TransformNode>;

type getBoneByName = (nodeIndex: string) => Nullable<TransformNode>;

/**
 * VRM SpringBone Controller
 */
export class SpringBoneController10 {
    /**
     * Spring Bone List
     */
    private springs: VRMSpringBone10[];

    /**
     * @param ext SecondaryAnimation Object
     * @param getBone
     */
    public constructor(public readonly ext: IVRMSecondaryAnimation, getBone: getBone, getBoneByName: getBoneByName) {
        const colliderGroups = this.constructColliderGroups(getBone, getBoneByName);
        this.springs = this.constructSprings(getBone, getBoneByName, colliderGroups);
    }

    public dispose() {
        this.springs = [];
    }

    /**
     * Update all SpringBones
     *
     * @param deltaTime Elapsed sec from previous frame
     * @see https://docs.unity3d.com/ScriptReference/Time-deltaTime.html
     */
    public async update(deltaTime: number): Promise<void> {
        // ポーズ後のあらぶり防止のため clamp
        deltaTime = Math.max(0.0, Math.min(16.666, deltaTime)) / 1000;
        const promises = this.springs.map<Promise<void>>((spring) => {
            return spring.update(deltaTime);
        });
        return Promise.all(promises).then(() => {
            /* Do nothing */
        });
    }

    private constructColliderGroups(getBone: getBone, getBoneByName: getBoneByName) {
        if (!this.ext || !this.ext.colliderGroups || !this.ext.colliderGroups.length) {
            return [];
        }
        const colliderGroups: ColliderGroup10[] = [];
        this.ext.colliderGroups.forEach((colliderGroup) => {
            // let name = colliderGroup.name
            // name = name.substring(0, 1).toLowerCase() + name.substring(1)
            // const bone = getBoneByName(name) as TransformNode;
            const g = new ColliderGroup10();
            colliderGroup.colliders.forEach((colliderIndex) => {
                let colliderElement = this.ext.colliders[colliderIndex]
                // console.log(colliderElement)

                const bone = getBone(colliderElement.node) as TransformNode;
                let offset = null;
                let tail = null;
                let collider = colliderElement.shape.sphere
                if (!collider) {
                    collider = colliderElement.shape.capsule
                    if (!collider) {
                        return
                    } else {
                        offset = new Vector3(collider.offset[0], collider.offset[1], collider.offset[2])
                        tail = new Vector3(collider.tail[0], collider.tail[1], collider.tail[2])
                    }
                } else {
                    offset = new Vector3(collider.offset[0], collider.offset[1], collider.offset[2])
                }
                // if (collider.offset[1] < 0) {
                //     offset = new Vector3(-collider.offset[1], collider.offset[0], collider.offset[2])
                // }
                g.addCollider(
                    // VRM 右手系Y_UP, -Z_Front から Babylon.js 左手系Y_UP, +Z_Front にする
                    // new Vector3(-collider.offset.x, collider.offset.y, -collider.offset.z),
                    offset,
                    tail,
                    collider.radius,
                    bone
                );
            });
            colliderGroups.push(g);
        });
        return colliderGroups;
    }

    private constructSprings(getBone: getBone, getBoneByName: getBoneByName, colliderGroups: ColliderGroup10[]) {
        if (!this.ext || !this.ext.springs || !this.ext.springs.length) {
            return [];
        }
        const springs: VRMSpringBone10[] = [];
        this.ext.springs.forEach((spring) => {
            // const rootBones = (spring.joints || []).map((joint) => {
            //     return getBone(joint.node) as TransformNode;
            // });
            const springColliders = (spring.colliderGroups || []).map<ColliderGroup10>((g) => {
                return colliderGroups[g];
            });

            let schemaSpring = spring
            let schemeJoints = spring.joints
            let colliderGroupsForSpring = springColliders
            const center = schemaSpring.center != null ? getBone(schemaSpring.center) : undefined;

            let joints : VRMSpringBoneJoint10[] = []

            let prevSchemaJoint: IVRMSecondaryAnimationSpringJoint | undefined;
            schemeJoints.forEach((schemaJoint) => {
                if (prevSchemaJoint) {
                    // prepare node
                    const nodeIndex = prevSchemaJoint.node;
                    const node = getBone(nodeIndex);
                    const childIndex = schemaJoint.node;
                    const child = getBone(childIndex);

                    // prepare setting
                    // const setting: VRMSpringBoneJointSetting10 = {
                    //     hitRadius: prevSchemaJoint.hitRadius,
                    //     dragForce: prevSchemaJoint.dragForce,
                    //     gravityPower: prevSchemaJoint.gravityPower,
                    //     stiffness: prevSchemaJoint.stiffness,
                    //     gravityDir:
                    //       prevSchemaJoint.gravityDir != null
                    //         ? new BABYLON.Vector3().fromArray(prevSchemaJoint.gravityDir)
                    //         : undefined,
                    // };
                    const setting: VRMSpringBoneJointSetting10 = new VRMSpringBoneJointSetting10(
                        prevSchemaJoint.hitRadius != null ? prevSchemaJoint.hitRadius : 0.5,
                        prevSchemaJoint.dragForce != null ? prevSchemaJoint.dragForce : 0.5,
                        prevSchemaJoint.gravityPower != null ? prevSchemaJoint.gravityPower : 1,
                        prevSchemaJoint.stiffness != null ? prevSchemaJoint.stiffness : 0.5,
                          prevSchemaJoint.gravityDir != null
                            ? Vector3.FromArray(prevSchemaJoint.gravityDir)
                            : new Vector3(0, -1, 0),
                    );

                    // create spring bones
                    const joint = this._importJoint(node, child, setting, colliderGroupsForSpring);
                    if (center) {
                        joint.center = center;
                    }

                    // manager.addJoint(joint);
                    joints.push(joint)
                }

                prevSchemaJoint = schemaJoint;
            });

            springs.push(
                // new VRMSpringBone10(
                //     spring.comment,
                //     spring.stiffiness,
                //     spring.gravityPower,
                //     new Vector3(
                //         // VRM 右手系Y_UP, -Z_Front から Babylon.js 左手系Y_UP, +Z_Front にする
                //         -spring.gravityDir.x,
                //         spring.gravityDir.y,
                //         -spring.gravityDir.z
                //     ).normalize(),
                //     spring.dragForce,
                //     getBone(spring.center),
                //     spring.hitRadius,
                //     rootBones,
                //     springColliders
                // )

                // new VRMSpringBone10(
                //     spring.name,
                //     2,
                //     0,
                //     new Vector3(
                //         // VRM 右手系Y_UP, -Z_Front から Babylon.js 左手系Y_UP, +Z_Front にする
                //         -0,
                //         -1,
                //         0
                //     ).normalize(),
                //     0.7,
                //     getBone(-1),
                //     spring.joints[0].hitRadius,
                //     rootBones,
                //     springColliders
                // )

                new VRMSpringBone10(
                    spring.name,
                    center,
                    joints,
                    springColliders
                )
            );
        });
        return springs;
    }

    private _importJoint(node: TransformNode | null, child: TransformNode | null, setting: VRMSpringBoneJointSetting10, colliderGroupsForSpring: ColliderGroup10[]): VRMSpringBoneJoint10 {
        let joint = new VRMSpringBoneJoint10(node, child, setting, colliderGroupsForSpring)
        return joint;
    }
}
