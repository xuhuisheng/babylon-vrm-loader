import type { Vector3 } from '@babylonjs/core/Maths/math';

/**
 * Collider
 */
export class VRMSpringBoneJointSetting10 {

    /**
     * @param offset The local coordinate from the node of the collider group.
     * @param radius The radius of the collider.
     * @param sphere The spehere mesh for worldMatrix and gizmo.
     */
    public constructor(
        public readonly hitRadius: number | null,
        public readonly dragForce: number | null,
        public readonly gravityPower: number | null,
        public readonly stiffness: number | null,
        public readonly gravityDir: Vector3 | undefined) {}
}

