import type { Vector3 } from '@babylonjs/core/Maths/math';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { SphereBuilder } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { Collider10 } from './collider10';

/**
 * VRM SpringBone ColliderGroup
 */
export class ColliderGroup10 {
    public readonly colliders: Collider10[] = [];

    /**
     * @param transform The node of the collider group for setting up collision detections.
     */
    // public constructor(public readonly transform: TransformNode) {}

    /**
     * Add offsetted collider
     *
     * @param offset The local coordinate from the node of the collider group.
     * @param radius The radius of the collider.
     */
    public addCollider(offset: Vector3, tail: Vector3 | null, radius: number, transform: TransformNode) {
        const sphere = SphereBuilder.CreateSphere(
            `${transform.name}_ColliderSphere`,
            {
                segments: 6,
                diameter: radius * 2.0,
                updatable: true,
            },
            transform.getScene()
        );
        sphere.setParent(transform);
        sphere.setPositionWithLocalVector(offset);
        sphere.setEnabled(false);

        let sphereTail = null
        if (tail) {
            sphereTail = SphereBuilder.CreateSphere(
                `${transform.name}_ColliderSphereTail`,
                {
                    segments: 6,
                    diameter: radius * 2.0,
                    updatable: true,
                },
                transform.getScene()
            );
            sphere.setParent(transform);
            sphere.setPositionWithLocalVector(tail);
            sphere.setEnabled(false);
        }

        this.colliders.push(new Collider10(offset, tail, radius, sphere, sphereTail, transform));
    }
}
