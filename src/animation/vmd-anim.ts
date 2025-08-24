import { Vector3 } from '@babylonjs/core/Maths/math';
import { Quaternion } from '@babylonjs/core/Maths/math';
// import type { TransformNode } from '@babylonjs/core/Meshes/transformNode';
// import type { Nullable } from '@babylonjs/core/types';
// import { Parser, VmdFile, CharsetEncoder } from 'mmd-parser';
import { Parser, CharsetEncoder } from 'mmd-parser';
import { VRMIKHandler } from './vrm-ik-handler';
import { NumberKeyframeTrack, VectorKeyframeTrack, QuaternionKeyframeTrack, AnimationClip, KeyframeTrack, VRMHumanBoneName, LerpKeyframe } from './math-utils';
import { VMD_VRM_MORTH_MAP, IK_OFFSET_INIT, VRM_VMD_BONE_MAP, MathUtils, VMD_VRM_IK_MAP, HumanoidBoneName, isTruely } from './math-utils';
import { VRMOffsets, VMDBoneNames, AnimationData, Timeline, VMDMorphNames, VMD_BONE_NAMES, Keyframe } from './math-utils';

// Hot patch Charset Encoder in MMD-Parser to forgive invalid charcodes.
{
  const { s2u } = CharsetEncoder.prototype;
  CharsetEncoder.prototype.s2u = function(array: any) {
    try {
      return s2u.call(this, array);
    } catch (e) {
      if (typeof e === 'string') {
        console.warn(`Charset encoder: ${e}`);
        return '';
      }
      throw e;
    }
  }
}

const tempV3 = new Vector3();
const tempQ = new Quaternion();
const V3_ZERO = new Vector3();
const Q_IDENTITY = new Quaternion();
// const Z_30_DEG_CW = new Quaternion().setFromAxisAngle(tempV3.set(0, 0, 1), 30 * MathUtils.DEG2RAD);
const Z_30_DEG_CW = Quaternion.RotationAxis(tempV3.set(0, 0, 1), 30 * MathUtils.DEG2RAD);
const Z_30_DEG_CCW = Z_30_DEG_CW.clone().invert();

export class VmdAnim {
	public init(): void {
		console.log('start')

		const self = this

		const filePath = './KX-YAO.vmd'
		const xhrFile = new XMLHttpRequest()
		xhrFile.open('GET', filePath, true)
		xhrFile.responseType = "arraybuffer";
		xhrFile.onload = function() {
			self.onLoad(xhrFile.response)
		}
		xhrFile.send()

		console.log('end')
	}

	public onLoad(response: any): any {
		// console.log(response)
		// const byteArray = new Uint8Array(response);
		// console.log(byteArray.buffer)

		const value = this.convert(response)
		// console.log(v)

		const vrm = {}
		this.bindToVRM(value, vrm);
	}

	public convert(
  		buffer: ArrayBufferLike,
  		vrmOffset?: VRMOffsets
	): AnimationData {
  		const vmd = new Parser().parseVmd(buffer);
  		const morphs = this.convertMorphs(vmd);
  		const motions = this.convertMotions(vmd, vrmOffset);
  		return {
  			duration: Math.max(morphs.duration, motions.duration),
  			timelines: Array.prototype.concat(morphs.timelines, motions.timelines),
		};
	}

	public convertMorphs({ morphs }: any): any {
  		this.sortFrames(morphs);
  		// console.log(morphs)
  		const timelines = new Map<string, Timeline>();

		  for (const { morphName, weight, frameNum } of morphs) {
		    const name = VMD_VRM_MORTH_MAP.get(morphName as VMDMorphNames);
		    if (!name) continue;
		    let timeline = timelines.get(name);
		    if (!timeline)
		      timelines.set(
		        name,
		        (timeline = {
		          name,
		          type: 'morph',
		          times: [],
		          values: [],
		        })
		      );
		    const { times, values } = timeline;
		    const time = frameNum / 30;
		    const timeIndex = times.findIndex((t) => t === time);
		    if (timeIndex < 0) {
		      times.push(time);
		      values.push(weight);
		    } else {
		      values[timeIndex] = Math.max(values[timeIndex], weight);
		    }
		  }
		  return {
		    timelines: Array.from(timelines.values()),
		    duration: this.getLastFrameNum(morphs) / 30,
		  };
	}

	public convertMotions(
  			{ motions }: any,
  			vrmOffset?: VRMOffsets
		): AnimationData {

  		this.sortFrames(motions);
	  	const timelines: Timeline[] = [];
	  	const boneTlMap = new Map<VMDBoneNames, Keyframe[]>();
	  	for (const name of VMD_BONE_NAMES) boneTlMap.set(name, []);
	  	for (const { boneName, frameNum, position, rotation } of motions)
	    	boneTlMap.get(boneName as VMDBoneNames)?.push({
	      		boneName,
	      		frameNum,
	      		position: new Vector3().fromArray(position),
	      		rotation: new Quaternion().fromArray(rotation),
	    });
  		this.fixPositions(boneTlMap, vrmOffset);

  		for (const [boneName, timeline] of boneTlMap) {
    		let name = VRM_VMD_BONE_MAP.get(boneName);
    		let isIK = false;
    		if (!name) {
    			isIK = VMD_VRM_IK_MAP.has(boneName);
    			name = VMD_VRM_IK_MAP.get(boneName);
    		}
    		if (name) {
    			const times: number[] = [];
    			const positions: number[] = [];
    			const rotations: number[] = [];
    			for (const f of timeline) {
    				const i = times.push(f.frameNum / 30) - 1;
    				f.position.toArray(positions, i * 3);
    				f.rotation.toArray(rotations, i * 4);
				}
				if (times.length) {
					timelines.push({
						name,
						type: 'rotation',
						isIK,
						times,
						values: rotations,
					});
					if (isIK || name === HumanoidBoneName.Hips)
						timelines.push({
							name,
							type: 'position',
							isIK,
							times,
							values: positions,
						});
				}
			}
		}

  		return { timelines, duration: this.getLastFrameNum(motions) / 30 };
	}

	public fixPositions(
  		tls: Map<string, Keyframe[]>,
  		vrmOffset: VRMOffsets = {}
	) {
  		const centerOffset = this.mergeTimelines(
    		tls,
    		VMDBoneNames.Center,
    		this.offsetToTimeline(VMDBoneNames.Center, vrmOffset.hipsOffset)
  		);
  
  		const hipsTl = this.mergeTimelines(
    		tls,
		    VMDBoneNames.Root,
		    centerOffset,
		    VMDBoneNames.Hips
  		);

  		tls.set(
		    VMDBoneNames.Spine,
		    this.localizeTimeline(
		      	hipsTl,
		      	this.mergeTimelines(tls, VMDBoneNames.Root, centerOffset, VMDBoneNames.Hips)
		    )
  		);
  		tls.set(VMDBoneNames.Hips, hipsTl);
		const leftFootOffset = this.offsetToTimeline(
		    VMDBoneNames.LeftFootIK,
		    vrmOffset.leftFootOffset
		);
	  	const rightFootOffset = this.offsetToTimeline(
		    VMDBoneNames.RightFootIK,
		    vrmOffset.rightFootOffset
	  	);
	  	if (tls.has(VMDBoneNames.LeftToeIK))
		    tls.set(
		      	VMDBoneNames.LeftToeIK,
		      	this.mergeTimelines(
			        tls,
			        VMDBoneNames.Root,
			        leftFootOffset,
			        VMDBoneNames.LeftFootIK,
			        this.offsetToTimeline(VMDBoneNames.RightToeIK, vrmOffset.leftToeOffset),
			        VMDBoneNames.LeftToeIK
		      	)
		    );
  		if (tls.has(VMDBoneNames.RightToeIK))
    		tls.set(
      			VMDBoneNames.RightToeIK,
      			this.mergeTimelines(
	        		tls,
			        VMDBoneNames.Root,
			        rightFootOffset,
			        VMDBoneNames.RightFootIK,
			        this.offsetToTimeline(VMDBoneNames.RightToeIK, vrmOffset.rightToeOffset),
			        VMDBoneNames.RightToeIK
      			)
    		);
	  	if (tls.has(VMDBoneNames.LeftFootIK))
	    	tls.set(
		      	VMDBoneNames.LeftFootIK,
		      	this.mergeTimelines(
			        tls,
			        VMDBoneNames.Root,
			        leftFootOffset,
			        VMDBoneNames.LeftFootIK
		    	)
	    	);
  		if (tls.has(VMDBoneNames.RightFootIK))
    		tls.set(
      			VMDBoneNames.RightFootIK,
      			this.mergeTimelines(
        			tls,
			        VMDBoneNames.Root,
			        rightFootOffset,
			        VMDBoneNames.RightFootIK
      			)
    		);
  		tls.delete(VMDBoneNames.Center);
  		tls.delete(VMDBoneNames.Root);

	  	for (const tl of tls.values())
    		for (const f of tl) {
      			f.position.x *= -1;
      			f.rotation.x *= -1;
      			f.rotation.w *= -1;
      			switch (f.boneName) {
        			case VMDBoneNames.LeftUpperArm:
        				f.rotation.multiply(Z_30_DEG_CW);
        				break;
        			case VMDBoneNames.RightUpperArm:
          				f.rotation.multiply(Z_30_DEG_CCW);
          				break;
			        case VMDBoneNames.LeftLowerArm:
			        case VMDBoneNames.LeftHand:
			        case VMDBoneNames.LeftThumbProximal:
			        case VMDBoneNames.LeftThumbIntermediate:
			        case VMDBoneNames.LeftThumbDistal:
			        case VMDBoneNames.LeftIndexProximal:
			        case VMDBoneNames.LeftIndexIntermediate:
			        case VMDBoneNames.LeftIndexDistal:
			        case VMDBoneNames.LeftMiddleProximal:
			        case VMDBoneNames.LeftMiddleIntermediate:
			        case VMDBoneNames.LeftMiddleDistal:
			        case VMDBoneNames.LeftRingProximal:
			        case VMDBoneNames.LeftRingIntermediate:
			        case VMDBoneNames.LeftRingDistal:
			        case VMDBoneNames.LeftLittleProximal:
			        case VMDBoneNames.LeftLittleIntermediate:
			        case VMDBoneNames.LeftLittleDistal:
			          	// f.rotation.premultiply(Z_30_DEG_CCW).multiply(Z_30_DEG_CW);
			          	Z_30_DEG_CCW.multiplyToRef(f.rotation, f.rotation).multiplyInPlace(Z_30_DEG_CW);
			          	break;
			        case VMDBoneNames.RightLowerArm:
			        case VMDBoneNames.RightHand:
			        case VMDBoneNames.RightThumbProximal:
			        case VMDBoneNames.RightThumbIntermediate:
			        case VMDBoneNames.RightThumbDistal:
			        case VMDBoneNames.RightIndexProximal:
			        case VMDBoneNames.RightIndexIntermediate:
			        case VMDBoneNames.RightIndexDistal:
			        case VMDBoneNames.RightMiddleProximal:
			        case VMDBoneNames.RightMiddleIntermediate:
			        case VMDBoneNames.RightMiddleDistal:
			        case VMDBoneNames.RightRingProximal:
			        case VMDBoneNames.RightRingIntermediate:
			        case VMDBoneNames.RightRingDistal:
			        case VMDBoneNames.RightLittleProximal:
			        case VMDBoneNames.RightLittleIntermediate:
			        case VMDBoneNames.RightLittleDistal:
			          	// f.rotation.premultiply(Z_30_DEG_CW).multiply(Z_30_DEG_CCW);
			          	Z_30_DEG_CW.multiplyToRef(f.rotation, f.rotation).multiplyInPlace(Z_30_DEG_CCW);
			          	break;
      			}
		      	// f.position.multiplyScalar(0.1);
		      	f.position.scaleInPlace(0.1)
    		}
	}

	public mergeTimelines(
  		tlsMap: Map<string, Keyframe[]>,
  		...tlsKey: (Keyframe[] | string)[]
	) {
  		const tls = tlsKey.map(this.resolveTimeline, tlsMap).filter(isTruely);
  		let boneName: string;
  		const last = tlsKey[tlsKey.length - 1];
  		if (typeof last === 'string') boneName = last;
  		else boneName = tls[tls.length - 1][0]?.boneName ?? '';
  		const results: Keyframe[] = [];
  		for (const tl of tls)
    		for (const f of tl) {
      			const { frameNum } = f;
      			if (frameNum < results.length && results[frameNum] != null) continue;
      			const position = new Vector3();
      			const rotation = new Quaternion();
      			for (const otl of tls) {
        			if (!otl.length) continue;
        			const f2 =
						otl[0].boneName === f.boneName ? f : this.lerpKeyframe(otl, frameNum);
        			// position.add(tempV3.copy(f2.position).applyQuaternion(rotation));
        			position.add(tempV3.copyFrom(f2.position).applyRotationQuaternion(rotation));
        			rotation.multiply(f2.rotation);
      			}
      			results[frameNum] = { boneName, frameNum, position, rotation };
    	}
  		return results.filter(isTruely);
	}

	public lerpKeyframe(tl: Keyframe[], frameNum: number): LerpKeyframe {
  if (!tl)
    return {
      boneName: '',
      frameNum,
      position: V3_ZERO,
      rotation: Q_IDENTITY,
    };
  const nextIndex = tl.findIndex((keyframe) => frameNum < keyframe.frameNum);
  switch (nextIndex) {
    case 0:
      return tl[0];
    case -1:
      return tl[tl.length - 1];
    case frameNum:
      return tl[frameNum];
  }
  const prevFrame = tl[nextIndex - 1];
  const nextFrame = tl[nextIndex];
  const prevFrameNum = prevFrame.frameNum;
  const nextFrameNum = nextFrame.frameNum;
  const v = (frameNum - prevFrameNum) / (nextFrameNum - prevFrameNum);
  return {
    boneName: tl[0].boneName,
    frameNum,
    // position: prevFrame.position.clone().lerp(nextFrame.position, v),
    position: Vector3.Lerp(prevFrame.position, nextFrame.position, v),
    // rotation: prevFrame.rotation.clone().slerp(nextFrame.rotation, v),
    rotation: Quaternion.Slerp(prevFrame.rotation, nextFrame.rotation, v),
    isNew: true,
  };
}




public offsetToTimeline(
  boneName: VMDBoneNames,
  rawPos: number[] | undefined
): Keyframe[] {
  const init = IK_OFFSET_INIT.get(boneName)!;
  return [
    {
      boneName: `${boneName}Offset`,
      frameNum: 0,
      position: rawPos
        ? new Vector3(
            init.dx || isNaN(rawPos[0])
              ? init.x
              : rawPos[0] * (init.sx ?? 1) * (init.s ?? 1) +
                (init.ox ?? 0) +
                (init.o ?? 0),
            init.dy || isNaN(rawPos[1])
              ? init.y
              : rawPos[1] * (init.sy ?? 1) * (init.s ?? 1) +
                (init.oy ?? 0) +
                (init.o ?? 0),
            init.dz || isNaN(rawPos[2])
              ? init.z
              : rawPos[2] * (init.sz ?? 1) * (init.s ?? 1) +
                (init.oz ?? 0) +
                (init.o ?? 0)
          )
        : new Vector3(init.x, init.y, init.z),
      rotation: Q_IDENTITY,
    },
  ];
}







public localizeTimeline(parent: Keyframe[], child: Keyframe[]): Keyframe[];
public localizeTimeline(...tls: [Keyframe[], Keyframe[]]) {
  const { boneName } = tls[1][0];
  const results: Keyframe[] = [];
  let isChild = false;
  for (const tl of tls) {
    for (const f of tl) {
      const { frameNum } = f;
      if (frameNum < results.length && results[frameNum] != null) continue;
      const fp: LerpKeyframe = isChild ? this.lerpKeyframe(tls[0], frameNum) : f;
      const fc: LerpKeyframe = isChild ? f : this.lerpKeyframe(tls[1], frameNum);
      results[frameNum] = {
        boneName,
        frameNum,
        // position: (fc.isNew ? fc.position : fc.position.clone()).sub(
        position: (fc.isNew ? fc.position : fc.position.clone()).subtract(
          fp.position
        ),
        rotation: (fc.isNew ? fc.rotation : fc.rotation.clone()).multiply(
          // tempQ.copy(fp.rotation).invert()
        	tempQ.copyFrom(fp.rotation).invertInPlace()
        ),
      };
    }
    isChild = true;
  }
  return results.filter(isTruely);
}






	public bindToVRM(data: AnimationData, vrm: any) {
  		// const tracks: KeyframeTrack[] = [];
  		const tracks: KeyframeTrack[] = [];
  		for (const { type, name, isIK, times, values } of data.timelines) {
    		let srcName: string;
    		switch (type) {
      			case 'morph': {
        			// const track = vrm.expressionManager?.getExpressionTrackName(name);
        			const track = 0
        			if (!track) continue;
        			srcName = track;
        			break;
				}
				case 'position':
				case 'rotation': {
					if (isIK) {
						const handler = VRMIKHandler.get(vrm);
						const target = handler.getAndEnableIK(
							name as VRMHumanBoneName
          				);
          				if (!target) continue;
          				srcName = target.name;
					} else {
						const bone = vrm.humanoid?.getNormalizedBone(
							name as VRMHumanBoneName
						);
						if (!bone) continue;
						srcName = bone.node.name;
					}
        			break;
      			}
      			default:
        			continue;
    		}
    		switch (type) {
      			case 'morph':
        			tracks.push(new NumberKeyframeTrack(srcName, times, values));
        			break;
      			case 'position':
        			tracks.push(
          				new VectorKeyframeTrack(`${srcName}.position`, times, values)
        			);
        			break;
      			case 'rotation':
       	 			tracks.push(
          				new QuaternionKeyframeTrack(`${srcName}.quaternion`, times, values)
        			);
     	   			break;
    		}
  		}
  		return new AnimationClip(`clip${Date.now()}`, data.duration, tracks);
	}

	public resolveTimeline(
  		this: Map<string, Keyframe[]>,
  		key: Keyframe[] | string
	) {
  		return Array.isArray(key) ? key : this.get(key);
	}

	public sortFrames<T extends { frameNum: number }>(
	  f: ArrayLike<T> | Iterable<T>
	) {
	  return (Array.isArray(f) ? (f as T[]) : Array.from(f)).sort(
	    (a, b) => a.frameNum - b.frameNum
	  );
	}

	public getLastFrameNum(f: { frameNum: number }[]) {
  		return f.length ? f[f.length - 1].frameNum : 0;
	}

}
