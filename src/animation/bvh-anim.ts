import { Vector3 } from '@babylonjs/core/Maths/math';
import { Quaternion } from '@babylonjs/core/Maths/math';
import { Skeleton } from '@babylonjs/core/Bones/skeleton';
// import { Bone } from '@babylonjs/core/Bones/bone';
// import { Node } from '@babylonjs/core/node';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import type { Scene } from '@babylonjs/core/scene';
// import type { Nullable } from '@babylonjs/core/types';
// import { Animation } from '@babylonjs/core/Animations/animation';
import { AnimationGroup } from '@babylonjs/core/Animations/animationGroup';

// import { AnimationData } from './math-utils';
import { HumanoidBoneName, VRMOffsets } from './math-utils';
import { ReadBvh } from './bvhLoader';

// const matcher = /^\.bones\[(.+)\]\.(position|quaternion)$/;

// const tempQ = new Quaternion();
// const tempV3 = new Vector3();

export class BvhAnim {
  public init(scene: Scene): void {
    console.log('start')

    const self = this

    const filePath = './0018_Moonwalk001.bvh'
    const xhrFile = new XMLHttpRequest()
    xhrFile.open('GET', filePath, true)
    xhrFile.responseType = "arraybuffer";
    xhrFile.onload = function() {
      self.onLoad(xhrFile.response, scene)
    }
    xhrFile.send()

    console.log('end')
  }

  public onLoad(response: any, scene: Scene): any {
    // console.log(response)
    // const byteArray = new Uint8Array(response);
    // console.log(byteArray.buffer)

    const animationGroup = this.convert(response, scene)
    // console.log('animationGroup', animationGroup)

    animationGroup.start(true, 1.0, animationGroup.from, animationGroup.to, true)

    // const vrm = {}
    // this.bindToVRM(value, vrm);
  }

  public convert(
      buffer: ArrayBufferLike,
      scene: Scene,
      vrmOffset?: VRMOffsets
  ): AnimationGroup {

    const textDecoder = new TextDecoder();
    // const { clip, skeleton } = new BVHLoader().parse(textDecoder.decode(data));
    const skeleton = ReadBvh(textDecoder.decode(buffer), scene, null, {loopMode: 1});
    // console.log('skeleton', skeleton)
    // for (let bone of skeleton.bones){
    //     console.log(bone.name)
    // }

    const vrmManager = scene.metadata.vrmManagers[0];
    // console.log('vrmManager', vrmManager)
    const humanoid = vrmManager.humanoidBone;

    const skeletonMap = detectSkeleton(skeleton);
    // console.log('skeletonMap', skeletonMap)

    const newAnimationGroup = new AnimationGroup("new-animation-group");

    // skeleton.bones.forEach((bone, indexBone) => {
    skeletonMap.forEach((boneValue, boneKey) => {
    	  const boneName = boneValue[0]
    	  const bone = boneValue[1]
    		// console.log(bone, boneName, boneKey)
        bone.animations.forEach((animation, indexAnimation) => {
            const targetProperty = animation.targetProperty;
            // const boneName = bone.name.toLowerCase();
            // console.log('before', boneName, targetProperty, animation)

            if (boneName != HumanoidBoneName.Hips && targetProperty != 'rotationQuaternion') {
                return;
            }

            const boneNode = humanoid[boneName];
            // console.log('previous', boneName, boneNode)

            if (!boneNode) {
                return;
            }
            // if (targetProperty == 'position') {
            // 	return;
            // }

            if (targetProperty == 'rotationQuaternion') {


                    let childQuaternion = new Quaternion(0, 0, 0, 1)
                    {
                    		// console.log(bone)
                    }

                    if (!childQuaternion) {
                        childQuaternion = new Quaternion(0, 0, 0, 1)
                    }

                    let parentQuaternion = new Quaternion(0, 0, 0, 1)

                    childQuaternion = childQuaternion.invert()

                    animation.getKeys().forEach((keyFrame) => {
                        let quaternion = keyFrame.value

                        if (boneName == 'leftUpperLeg') {
	                        // console.log('quaternion before', keyFrame, quaternion)
                        }

                        {
                            quaternion = parentQuaternion.multiply(quaternion).multiply(childQuaternion)

                            let matrix = humanoid.matrixMap.get(boneName)
                            if (matrix) {                                
                                let rotate = Quaternion.Zero()
                                matrix.decompose(null, rotate, null)
                                // quaternion = quaternion.multiply(rotate)
                            }
                        }

                        if (boneName == 'leftUpperLeg') {
	                        // console.log('quaternion after', quaternion)
                        }

                        // keyFrame.value = quaternion
                        // keyFrame.value = new Quaternion(-quaternion.x, quaternion.y, quaternion.z, quaternion.w);

                    })
            } else if (targetProperty == 'position') {
                    animation.getKeys().forEach((keyFrame) => {
                        let position = keyFrame.value
                        keyFrame.value = position.scale(0.02)
                    });
            }

            newAnimationGroup.addTargetedAnimation(animation, boneNode);
        });
    });

    return newAnimationGroup;

    // const keepTracks = new Set<KeyframeTrack>();
    // const skeletonMap = detectSkeleton(skeleton);
    // for (const track of clip.tracks) {
    //   const m = track.name.match(matcher);
    //   if (!m || !skeletonMap.has(m[1])) continue;
    //   const [boneName, bone] = skeletonMap.get(m[1])!;
    //   if (boneName !== HumanoidBoneName.Hips && m[2] !== 'quaternion')
    //     continue;
    //   const boneNode = vrm.humanoid?.getNormalizedBoneNode(boneName);
    //   if (!boneNode) continue;

    //   if (!bone || !bone.rotationQuaternion) continue;

    //   switch (m[2]) {
    //     case 'quaternion':
    //       for(let i = 0; i < track.times.length; i++)
    //         // tempQ
    //         // .fromArray(track.values, i * 4)
    //         // .premultiply(bone.quaternion)
    //         // .toArray(track.values, i * 4);
    //         bone.rotationQuaternion
    //           .multiplyToRef(tempQ.fromArray(track.values, i * 4), tempQ)
    //           .toArray(track.values, i * 4);
    //       break;
    //     case 'position':
    //       for(let i = 0; i < track.times.length; i++)
    //         tempV3
    //         .fromArray(track.values, i * 3)
    //         .add(bone.position)
    //         .toArray(track.values, i * 3);
    //       break;
    //   }
    //   track.name = `${boneNode.name}.${m[2]}`;
    //   keepTracks.add(track);
    // }
    // if (keepTracks.size !== clip.tracks.length)
    //   clip.tracks = Array.from(keepTracks);
    
    // return clip.resetDuration();

  }
}

function getRoot(bones: TransformNode[]) {
  const hips = bones.filter((x) => x.parent == null);
  if (hips.length !== 1) throw new TypeError('Requires unique root.');
  return hips[0];
}

function selectBone(
  selector: (l: TransformNode, r: TransformNode) => TransformNode,
  bones: TransformNode[]
) {
  if (!bones || !bones.length) throw new TypeError('No bones.');
  let current = bones[0];
  for (let i = 1; i < bones.length; i++) current = selector(current, bones[i]);
  return current;
}

function getSpineAndHips(
  hips: TransformNode,
  map: Map<HumanoidBoneName, TransformNode>
) {
  if (hips.getChildren().length !== 3)
    throw new TypeError('Hips require 3 children.');
  map.set(
    HumanoidBoneName.Hips,
    hips
  );
  map.set(
    HumanoidBoneName.Spine,
    selectBone(
      (l, r) => (centerOfDescendant(l).y > centerOfDescendant(r).y ? l : r),
      hips.getChildren()
    )
  );
  map.set(
    HumanoidBoneName.LeftUpperLeg,
    selectBone(
      (l, r) => {
      	const diff = centerOfDescendant(l).x - centerOfDescendant(r).x;
      	if (diff < 0) {
      		return l;
      	} if (diff > 0) {
      		return r;
      	} else if (l.name.toLowerCase().indexOf('left') != -1) {
    			return l;
      	} else if (r.name.toLowerCase().indexOf('left') != -1) {
      		return r;
      	} else {
      		console.log('cannot find left upper leg', l, r)
      		return l
      	}
      },
      hips.getChildren()
    )
  );
  map.set(
    HumanoidBoneName.RightUpperLeg,
    selectBone(
      (l, r) => {
      	const diff = centerOfDescendant(l).x - centerOfDescendant(r).x;
      	if (diff > 0) {
      		return l;
      	} if (diff < 0) {
      		return r;
      	} else if (l.name.toLowerCase().indexOf('right') != -1) {
    			return l;
      	} else if (r.name.toLowerCase().indexOf('right') != -1) {
      		return r;
      	} else {
      		console.log('cannot find right upper leg', l, r)
      		return r
      	}
      },
      hips.getChildren()
    )
  );
}

function getNeckAndArms(
  chest: TransformNode,
  map: Map<HumanoidBoneName, TransformNode>
) {
  if (chest.getChildren().length !== 3)
    throw new TypeError('Chest require 3 children.');
  map.set(
    HumanoidBoneName.Neck,
    selectBone(
      (l, r) => (centerOfDescendant(l).y > centerOfDescendant(r).y ? l : r),
      chest.getChildren()
    )
  );
  map.set(
    HumanoidBoneName.LeftShoulder,
    selectBone(
      (l, r) => {
      	const diff = centerOfDescendant(l).x - centerOfDescendant(r).x;
      	if (diff < 0) {
      		return l;
      	} if (diff > 0) {
      		return r;
      	} else if (l.name.toLowerCase().indexOf('left') != -1) {
    			return l;
      	} else if (r.name.toLowerCase().indexOf('left') != -1) {
      		return r;
      	} else {
      		console.log('cannot find left upper arm', l, r)
      		return l
      	}
      },
      chest.getChildren()
    )
  );
  map.set(
    HumanoidBoneName.RightShoulder,
    selectBone(
      (l, r) => {
      	const diff = centerOfDescendant(l).x - centerOfDescendant(r).x;
      	if (diff > 0) {
      		return l;
      	} if (diff < 0) {
      		return r;
      	} else if (l.name.toLowerCase().indexOf('right') != -1) {
    			return l;
      	} else if (r.name.toLowerCase().indexOf('right') != -1) {
      		return r;
      	} else {
      		console.log('cannot find right upper arm', l, r)
      		return r
      	}
      },
      chest.getChildren()
    )
  );
}

function getArm(
  map: Map<HumanoidBoneName, TransformNode>,
  isRight?: boolean
) {
  const bones = Array.from(
    transverse(
      map.get(
        isRight ? HumanoidBoneName.RightShoulder : HumanoidBoneName.LeftShoulder
      )
    )
  );
  // console.log('getArm isRight', isRight, bones)
  switch (bones.length) {
    case 0:
    case 1:
    case 2:
    case 3:
      throw new TypeError(`Not supported (${bones.length})`);
    default:
      map.set(
        isRight
          ? HumanoidBoneName.RightShoulder
          : HumanoidBoneName.LeftShoulder,
        bones[0]
      );
      map.set(
        isRight
          ? HumanoidBoneName.RightUpperArm
          : HumanoidBoneName.LeftUpperArm,
        bones[1]
      );
      map.set(
        isRight
          ? HumanoidBoneName.RightLowerArm
          : HumanoidBoneName.LeftLowerArm,
        bones[2]
      );
      map.set(
        isRight ? HumanoidBoneName.RightHand : HumanoidBoneName.LeftHand,
        bones[3]
      );
      break;
  }
  // console.log('getArm', map)
}

function getLeg(
  map: Map<HumanoidBoneName, TransformNode>,
  isRight?: boolean
) {
  const bones = Array.from(
    transverse(
      map.get(
        isRight ? HumanoidBoneName.RightUpperLeg : HumanoidBoneName.LeftUpperLeg
      )
    )
  );
  // console.log('getLeg isRight', isRight, bones.length, bones)
  switch (bones.length) {
    case 0:
    case 1:
    case 2:
      throw new TypeError(`Not supported (${bones.length})`);
    case 3:
    	// upperLeg, lowerLeg, foot
      map.set(
        isRight
          ? HumanoidBoneName.RightUpperLeg
          : HumanoidBoneName.LeftUpperLeg,
        bones[0]
      );
      map.set(
        isRight
          ? HumanoidBoneName.RightLowerLeg
          : HumanoidBoneName.LeftLowerLeg,
        bones[1]
      );
      map.set(
        isRight ? HumanoidBoneName.RightFoot : HumanoidBoneName.LeftFoot,
        bones[2]
      );
      break;
    case 5:
    	// upperLeg, lowerLeg, foot, toe, ENDSITE
      map.set(
        isRight
          ? HumanoidBoneName.RightUpperLeg
          : HumanoidBoneName.LeftUpperLeg,
        bones[bones.length - 5]
      );
      map.set(
        isRight
          ? HumanoidBoneName.RightLowerLeg
          : HumanoidBoneName.LeftLowerLeg,
        bones[bones.length - 4]
      );
      map.set(
        isRight ? HumanoidBoneName.RightFoot : HumanoidBoneName.LeftFoot,
        bones[bones.length - 3]
      );
      map.set(
        isRight ? HumanoidBoneName.RightToes : HumanoidBoneName.LeftToes,
        bones[bones.length - 2]
      );
      break;
    default:
    	// upperLeg, lowerLeg, foot, toe
      map.set(
        isRight
          ? HumanoidBoneName.RightUpperLeg
          : HumanoidBoneName.LeftUpperLeg,
        bones[bones.length - 4]
      );
      map.set(
        isRight
          ? HumanoidBoneName.RightLowerLeg
          : HumanoidBoneName.LeftLowerLeg,
        bones[bones.length - 3]
      );
      map.set(
        isRight ? HumanoidBoneName.RightFoot : HumanoidBoneName.LeftFoot,
        bones[bones.length - 2]
      );
      map.set(
        isRight ? HumanoidBoneName.RightToes : HumanoidBoneName.LeftToes,
        bones[bones.length - 1]
      );
      break;
  }
}

function detectSkeleton(skeleton: Skeleton) {

  const bones = skeleton.bones as unknown as TransformNode[];

  const root = getRoot(bones);
  let hips: TransformNode | null | undefined;
  for (const x of transverse(root))
    if (x.getChildren().length === 3) {
      hips = x;
      break;
    }
  if (!hips) throw new TypeError('Hips not found');
  const map = new Map<HumanoidBoneName, TransformNode>();
  getSpineAndHips(hips, map);
  // console.log('after getSpineAndHips', map);
  getLeg(map, false);
  getLeg(map, true);
  const spineToChest: TransformNode[] = [];
  for (const x of transverse(map.get(HumanoidBoneName.Spine))) {
    spineToChest.push(x);
    if (x.getChildren().length === 3) break;
  }
  // console.log('after spineToChest', spineToChest)
  getNeckAndArms(spineToChest[spineToChest.length - 1], map);
  // console.log('after getNeckAndArms', map)
  // if (1) {
  // 	const finalMap = new Map<string, [HumanoidBoneName, TransformNode]>();
	//   return finalMap;
  // }
  // console.log('before getArm', map);
  getArm(map, false);
  getArm(map, true);
  const necktoHead = Array.from(transverse(map.get(HumanoidBoneName.Neck)));
  switch (spineToChest.length) {
    case 0:
      throw new TypeError(`Not supported (${spineToChest.length})`);
    case 1:
      map.set(HumanoidBoneName.Spine, spineToChest[0]);
      break;
    case 2:
      map.set(HumanoidBoneName.Spine, spineToChest[0]);
      map.set(HumanoidBoneName.Chest, spineToChest[1]);
      break;
    default:
      map.set(HumanoidBoneName.Spine, spineToChest[0]);
      map.set(HumanoidBoneName.Chest, spineToChest[1]);
      map.set(
        HumanoidBoneName.UpperChest,
        spineToChest[spineToChest.length - 1]
      );
      break;
  }
  switch (necktoHead.length) {
    case 0:
      throw new TypeError(`Not supported (${necktoHead.length})`);
    case 1:
      map.set(HumanoidBoneName.Head, spineToChest[0]);
      break;
    case 2:
      map.set(HumanoidBoneName.Neck, spineToChest[0]);
      map.set(HumanoidBoneName.Head, spineToChest[1]);
      break;
    default:
      map.set(HumanoidBoneName.Neck, spineToChest[0]);
      let head: TransformNode | null | undefined;
      for (const x of necktoHead) if (x.parent!.getChildren().length === 1) head = x;
      if (!head) throw new TypeError('Head not found');
      map.set(HumanoidBoneName.Head, head);
      break;
  }
  const finalMap = new Map<string, [HumanoidBoneName, TransformNode]>();
  for (const [boneName, bone] of map) {
    finalMap.set(bone.name, [boneName, bone]);
  }
  // console.log('finalMap', map, finalMap)
  return finalMap;
}

export function centerOfDescendant(self: TransformNode) {
  const sum = new Vector3();
  const temp = new Vector3();
  let i = 0;
  for (const current of transverse(self)) {
    // temp.copy(current.position);
    temp.copyFrom(current.position);
    let { parent } = current.parent!;
    while (parent) {

      let transformNode = parent as TransformNode
      if (!transformNode || !transformNode.rotationQuaternion) continue;

      // temp.applyQuaternion(parent.quaternion).add(parent.position);
      temp.applyRotationQuaternionInPlace(transformNode.rotationQuaternion)
        .addInPlace(transformNode.position);
      if (parent === self) break;
      parent = parent.parent as TransformNode;
    }
    sum.add(temp);
    i++;
  }
  // return sum.divideScalar(i);
  return sum.scale(1 / i);
}

export function* transverse(self?: TransformNode | null): IterableIterator<TransformNode> {
  if (!self) return;
  const stack: TransformNode[] = [self];
  const stackIndex = [0];
  yield self;
  while (stack.length) {
    const current = stack.pop()!;
    const currentIndex = stackIndex.pop()!;
    if (current.getChildren().length <= currentIndex)
      continue;
    stack.push(current, current.getChildren()[currentIndex] as TransformNode);
    stackIndex.push(currentIndex + 1, 0);
    yield current.getChildren()[currentIndex] as TransformNode;
  }
}

