// import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
// import type { MorphTarget } from '@babylonjs/core/Morph/morphTarget';
// import type { Scene } from '@babylonjs/core/scene';
// import type { AssetContainer } from '@babylonjs/core/assetContainer';
import { Quaternion } from '@babylonjs/core/Maths/math';
import { Vector3 } from '@babylonjs/core/Maths/math';
// import { Matrix } from '@babylonjs/core/Maths/math';
// import type { Nullable } from '@babylonjs/core/types';
import { GLTFLoader } from '@babylonjs/loaders/glTF/2.0';
import { VRMManager10 } from './vrm-manager10'
import { VRMNodeConstraintAim } from './vrm-node-constraint-aim';

export class VRMNodeConstraint {

    public nodeConstraintItems: Array<VRMNodeConstraintAim> = [];

    public constructor(
        public readonly vrmManager: VRMManager10,
        public readonly gltfLoader: GLTFLoader
    ) {
        this.constructNodeConstraints();
    }

    public constructNodeConstraints() {
        if (!this.gltfLoader || !this.gltfLoader.gltf || !this.gltfLoader.gltf.nodes || this.gltfLoader.gltf.nodes.length <= 0) {
            return;
        }
        let nodes = this.gltfLoader.gltf.nodes;
        nodes.forEach((node: any, nodeIndex: number) => {
            if (!node.extensions || !node.extensions.VRMC_node_constraint || !node.extensions.VRMC_node_constraint.constraint) {
                return;
            }
            // console.log(this.vrmManager.findTransformNode(nodeIndex));

            let constraint = node.extensions.VRMC_node_constraint.constraint;
            if (constraint.aim) {
                // console.log('aim', constraint.aim);
                let item = new VRMNodeConstraintAim();
                item.type = 'aim';
                item.node = nodeIndex;
                item.source = constraint.aim.source;
                item.weight = constraint.aim.weight;
                item.aimAxis = constraint.aim.aimAxis;
                this.nodeConstraintItems.push(item);
            } else if (constraint.roll) {
                // console.log('roll', constraint.roll);
                let item = new VRMNodeConstraintAim();
                item.type = 'roll';
                item.node = nodeIndex;
                item.source = constraint.roll.source;
                item.weight = constraint.roll.weight;
                item.rollAxis = constraint.roll.rollAxis;
                this.nodeConstraintItems.push(item);
            }
        })
    }

    public update(deltaTime: number) {
        // console.log('vrm-node-constraints update', this.nodeConstraintItems)
        this.nodeConstraintItems.forEach((nodeConstraint) => {
        // console.log('vrm-node-constraints update', nodeConstraint)
            try {
                if (nodeConstraint.type == 'aim') {
                    let node = this.vrmManager.findTransformNode(nodeConstraint.node);
                    if (!node) {
                        console.log('skip constraint node', nodeConstraint.node);
                        return;
                    }
                    let source = this.vrmManager.findTransformNode(nodeConstraint.source);
                    if (!source) {
                        console.log('skip constraint source', nodeConstraint.source);
                        return;
                    }
                    // console.log('vrm-node-constraints update aim', node, source)
                    // node.rotationQuaternion = source.rotationQuaternion;
                    this.processAim(nodeConstraint, node, source);
                } else if (nodeConstraint.type == 'roll') {
                    let node = this.vrmManager.findTransformNode(nodeConstraint.node);
                    if (!node) {
                        console.log('skip constraint node', nodeConstraint.node);
                        return;
                    }
                    let source = this.vrmManager.findTransformNode(nodeConstraint.source);
                    if (!source) {
                        console.log('skip constraint source', nodeConstraint.source);
                        return;
                    }
                    // node.rotationQuaternion = source.rotationQuaternion;
                    // this.processRoll(nodeConstraint, node, source);
                }
            } catch (e) {
                console.error(e)
            }
        });
    }

    public processAim(nodeConstraint: VRMNodeConstraintAim, destination: TransformNode, source: TransformNode) {
        if (!nodeConstraint.weight) {
            return;
        }

        let dstMatrix = destination.computeWorldMatrix(true);
        let srcMatrix = source.computeWorldMatrix(true);

        let dstParentWorldQuat = Quaternion.Identity();
        let invDstParentWorldQuat = Quaternion.Identity();
        if (destination.parent) {
            let parentMatrix = destination.parent.computeWorldMatrix(true);
            // decomposeRotation(this.destination.parent.matrixWorld, dstParentWorldQuat);
            parentMatrix.decompose(undefined, dstParentWorldQuat, undefined);
            // quatInvertCompat(invDstParentWorldQuat.copy(dstParentWorldQuat));
            invDstParentWorldQuat = dstParentWorldQuat.invert();
        }

        let _v3A = Vector3.Zero();
        let _v3AimAxis = Vector3.FromArray([
            nodeConstraint.aimAxis === 'PositiveX' ? 1.0 : nodeConstraint.aimAxis === 'NegativeX' ? -1.0 : 0.0,
            nodeConstraint.aimAxis === 'PositiveY' ? 1.0 : nodeConstraint.aimAxis === 'NegativeY' ? -1.0 : 0.0,
            nodeConstraint.aimAxis === 'PositiveZ' ? 1.0 : nodeConstraint.aimAxis === 'NegativeZ' ? -1.0 : 0.0,
        ]);
        let _dstRestQuat = Quaternion.Identity();
        // const a0 = _v3A.copy(this._v3AimAxis).applyQuaternion(this._dstRestQuat).applyQuaternion(dstParentWorldQuat);
        const a0 = _v3A.copyFrom(_v3AimAxis).applyRotationQuaternion(_dstRestQuat).applyRotationQuaternion(dstParentWorldQuat);
        // const a1 = decomposePosition(this.source.matrixWorld, _v3B)
        //   .sub(decomposePosition(this.destination.matrixWorld, _v3C))
        //   .normalize();
        let _v3B = Vector3.Zero();
        let _v3C = Vector3.Zero();
        srcMatrix.decompose(undefined, undefined, _v3B);
        dstMatrix.decompose(undefined, undefined, _v3C);
        const a1 = _v3B.subtract(_v3C).normalize();

        // const targetQuat = _quatC
        //   .setFromUnitVectors(a0, a1)
        //   .premultiply(invDstParentWorldQuat)
        //   .multiply(dstParentWorldQuat)
        //   .multiply(this._dstRestQuat);
        let _quatC = Quaternion.Identity();
        Quaternion.FromUnitVectorsToRef(a0, a1, _quatC);
        const targetQuat = invDstParentWorldQuat.multiply(_quatC)
            .multiply(dstParentWorldQuat)
            .multiply(_dstRestQuat);

        console.log('processAim dst', destination.name, 'src', source.name, targetQuat)

        destination.rotationQuaternion = Quaternion.Slerp(_dstRestQuat, targetQuat, nodeConstraint.weight);
    }

    public processRoll(nodeConstraint: VRMNodeConstraintAim, destination: TransformNode, source: TransformNode) {
        if (!nodeConstraint.weight) {
            return;
        }

        let dstMatrix = destination.computeWorldMatrix(true);
        let srcMatrix = source.computeWorldMatrix(true);

        let dstParentWorldQuat = Quaternion.Identity();
        let invDstParentWorldQuat = Quaternion.Identity();
        if (destination.parent) {
            let parentMatrix = destination.parent.computeWorldMatrix(true);
            // decomposeRotation(this.destination.parent.matrixWorld, dstParentWorldQuat);
            parentMatrix.decompose(undefined, dstParentWorldQuat, undefined);
            // quatInvertCompat(invDstParentWorldQuat.copy(dstParentWorldQuat));
            invDstParentWorldQuat = dstParentWorldQuat.invert();
        }

        let _v3A = Vector3.Zero();
        let _v3AimAxis = Vector3.FromArray([
            nodeConstraint.aimAxis === 'PositiveX' ? 1.0 : nodeConstraint.aimAxis === 'NegativeX' ? -1.0 : 0.0,
            nodeConstraint.aimAxis === 'PositiveY' ? 1.0 : nodeConstraint.aimAxis === 'NegativeY' ? -1.0 : 0.0,
            nodeConstraint.aimAxis === 'PositiveZ' ? 1.0 : nodeConstraint.aimAxis === 'NegativeZ' ? -1.0 : 0.0,
        ]);
        let _dstRestQuat = Quaternion.Identity();
        // const a0 = _v3A.copy(this._v3AimAxis).applyQuaternion(this._dstRestQuat).applyQuaternion(dstParentWorldQuat);
        const a0 = _v3A.copyFrom(_v3AimAxis).applyRotationQuaternion(_dstRestQuat).applyRotationQuaternion(dstParentWorldQuat);
        // const a1 = decomposePosition(this.source.matrixWorld, _v3B)
        //   .sub(decomposePosition(this.destination.matrixWorld, _v3C))
        //   .normalize();
        let _v3B = Vector3.Zero();
        let _v3C = Vector3.Zero();
        srcMatrix.decompose(undefined, undefined, _v3B);
        dstMatrix.decompose(undefined, undefined, _v3C);
        const a1 = _v3B.subtract(_v3C).normalize();

        // const targetQuat = _quatC
        //   .setFromUnitVectors(a0, a1)
        //   .premultiply(invDstParentWorldQuat)
        //   .multiply(dstParentWorldQuat)
        //   .multiply(this._dstRestQuat);
        let _quatC = Quaternion.Identity();
        Quaternion.FromUnitVectorsToRef(a1, a0, _quatC);
        const targetQuat = invDstParentWorldQuat.multiply(_quatC)
            .multiply(dstParentWorldQuat)
            .multiply(_dstRestQuat);

        console.log('processAim dst', destination.name, 'src', source.name, targetQuat)

        destination.rotationQuaternion = Quaternion.Slerp(_dstRestQuat, targetQuat, nodeConstraint.weight);
    }

}
