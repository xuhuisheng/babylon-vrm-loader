import type { Mesh } from '@babylonjs/core';
import type { Vector3 } from '@babylonjs/core/Maths/math';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';

/**
 * Collider
 */
export class Collider10 {
    /**
     * @param offset The local coordinate from the node of the collider group.
     * @param radius The radius of the collider.
     * @param sphere The spehere mesh for worldMatrix and gizmo.
     */
    public constructor(public readonly offset: Vector3, public readonly radius: number, public readonly sphere: Mesh, public readonly transform: TransformNode) {}
}
