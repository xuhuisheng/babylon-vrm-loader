import { Vector3 } from '@babylonjs/core/Maths/math';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Nullable } from '@babylonjs/core/types';
import type { IVRMSecondaryAnimation } from '../vrm-interfaces10';
import { ColliderGroup10 } from './collider-group10';
import { VRMSpringBone10 } from './vrm-spring-bone10';

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
            let name = colliderGroup.name
            name = name.substring(0, 1).toLowerCase() + name.substring(1)
            const bone = getBoneByName(name) as TransformNode;
            const g = new ColliderGroup10();
            colliderGroup.colliders.forEach((colliderIndex) => {
                let colliderElement = this.ext.colliders[colliderIndex]
                // console.log(colliderElement)
                let collider = colliderElement.shape.sphere
                if (!collider) {
                    collider = colliderElement.shape.capsule
                }
                if (!collider) {
                    return
                }
                // const bone = getBone(colliderElement.node) as TransformNode;
                g.addCollider(
                    // VRM 右手系Y_UP, -Z_Front から Babylon.js 左手系Y_UP, +Z_Front にする
                    new Vector3(-collider.offset.x, collider.offset.y, -collider.offset.z),
                    collider.radius,
                    bone
                );
            });
            colliderGroups.push(g);
        });
        return colliderGroups;
    }

    private constructSprings(getBone: getBone, getBoneByName: getBoneByName, colliderGroups: ColliderGroup10[]) {
        if (!this.ext || !this.ext.colliderGroups || !this.ext.colliderGroups.length) {
            return [];
        }
        const springs: VRMSpringBone10[] = [];
        this.ext.colliderGroups.forEach((spring, index) => {
            // const rootBones = (spring.bones || []).map((bone) => {
            //     return getBone(bone) as TransformNode;
            // });
            const rootBones = [getBoneByName(spring.name) as TransformNode];
            // const springColliders: ColliderGroup10[] = (spring.colliderGroups || []).map<ColliderGroup10>((g) => {
            //     return colliderGroups[g];
            // });
            const springColliders = [colliderGroups[index]];
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
                new VRMSpringBone10(
                    "",
                    2,
                    0,
                    new Vector3(
                        // VRM 右手系Y_UP, -Z_Front から Babylon.js 左手系Y_UP, +Z_Front にする
                        -0,
                        -1,
                        -0
                    ).normalize(),
                    0.7,
                    getBone(-1),
                    0.02,
                    rootBones,
                    springColliders
                )
            );
        });
        return springs;
    }
}
