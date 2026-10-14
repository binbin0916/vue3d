import {
	Box3,
	Camera,
	Euler,
	EventDispatcher,
	Matrix4,
	Mesh,
	MOUSE,
	Object3D,
	OrthographicCamera,
	PerspectiveCamera,
	Quaternion,
	TOUCH,
	Vector2,
	Vector3,
} from 'three';

export interface ModelControlsEventMap {
	change: { type: 'change' };
	start: { type: 'start' };
	end: { type: 'end' };
}

export type ControlMode = 'rotate' | 'pan' | 'zoom';

const TAU = Math.PI * 2;
const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

// 阻尼衰减的停止阈值：比 1e-12 更宽松，避免浮点残留导致每帧都 dispatch
const EPS = 1e-6;

const _changeEvent = { type: 'change' as const };
const _startEvent = { type: 'start' as const };
const _endEvent = { type: 'end' as const };

const STATE = {
	NONE: -1,
	ROTATE: 0,
	PAN: 1,
	DOLLY: 2,
	TOUCH_DOLLY_PAN: 3,
	TOUCH_DOLLY_ROTATE: 4,
} as const;

type State = (typeof STATE)[keyof typeof STATE];

/** 归一化到 (-π, π] */
function wrapPi(angle: number): number {
	const a = angle % TAU;
	if (a > Math.PI) return a - TAU;
	if (a <= -Math.PI) return a + TAU;
	return a;
}

/** 将角度按 2π 周期平移到最接近 ref 的等价角 */
function nearestAngle(angle: number, ref: number): number {
	return angle + TAU * Math.round((ref - angle) / TAU);
}

export interface MouseButtons {
	LEFT: number;
	MIDDLE: number;
	RIGHT: number;
}

export interface Touches {
	ONE: number;
	TWO: number;
}

export interface RotationDegrees {
	x: number;
	y: number;
	z: number;
}

interface PointerEntry {
	start: Vector2;
	current: Vector2;
}

export class ModelControls extends EventDispatcher<ModelControlsEventMap> {
	// ---- 公开属性 ----
	object: Object3D;
	camera: Camera;
	domElement: HTMLElement | null;

	enabled = true;
	enableRotate = true;
	enablePan = true;
	enableZoom = true;
	screenSpacePanning = true;
	rotateSpeed = 1.0;
	zoomSpeed = 1.0;
	panSpeed = 1.0;
	minDistance = 0;
	maxDistance = Infinity;
	dampingFactor = 0;
	mouseButtons: MouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };
	touches: Touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };
	mode: ControlMode = 'rotate';
	onModeChange?: (_mode: ControlMode) => void;

	// ---- 内部状态 ----
	private _state: State = STATE.NONE;
	private _pointers: number[] = [];
	private _pointerStarts = new Map<number, PointerEntry>();

	private _rotateStart = new Vector2();
	private _rotateEnd = new Vector2();
	private _rotateDelta = new Vector2();

	private _panStart = new Vector2();
	private _panEnd = new Vector2();
	private _panDelta = new Vector2();
	private _panOffset = new Vector3();

	private _dollyStart = new Vector2();
	private _dollyEnd = new Vector2();
	private _dollyScale = 1;

	private _pendingRotate = new Vector2();

	// 旋转读数（弧度）缓存：由 object.quaternion 反推后，用就近解消除多解跳变
	private _rotationCache = new Vector3();
	private _hasRotationCache = false;

	private _localCenter = new Vector3();
	private _centerReady = false;
	private _centerDirty = true;
	private _savedState: { position: Vector3; quaternion: Quaternion } | null = null;

	// 临时对象（复用，避免每帧分配）
	private _center = new Vector3();
	private _offset = new Vector3();
	private _v = new Vector3();
	private _q = new Quaternion();
	private _q2 = new Quaternion();
	private _qRel = new Quaternion();
	private _euler = new Euler();
	private _box = new Box3();
	private _geomBox = new Box3();

	constructor(object: Object3D, camera: Camera, domElement: HTMLElement | null = null) {
		super();

		this.object = object;
		this.camera = camera;
		this.domElement = domElement;

		if (domElement !== null) {
			domElement.style.touchAction = 'none';
			this.connect();
		}

		this.computeCenter();
	}

	// ------------------------------------------------------------------
	// 生命周期
	// ------------------------------------------------------------------

	connect(): void {
		if (!this.domElement) return;

		this.domElement.addEventListener('pointerdown', this._onPointerDown);
		this.domElement.addEventListener('pointercancel', this._onPointerUp);
		this.domElement.addEventListener('wheel', this._onMouseWheel, { passive: false });
		this.domElement.addEventListener('contextmenu', this._onContextMenu);
	}

	disconnect(): void {
		if (!this.domElement) return;

		this.domElement.removeEventListener('pointerdown', this._onPointerDown);
		this.domElement.removeEventListener('pointercancel', this._onPointerUp);
		this.domElement.removeEventListener('wheel', this._onMouseWheel);
		this.domElement.removeEventListener('contextmenu', this._onContextMenu);
		this.domElement.removeEventListener('pointermove', this._onPointerMove);
		this.domElement.removeEventListener('pointerup', this._onPointerUp);
	}

	dispose(): void {
		this.disconnect();
		this._pointers = [];
		this._pointerStarts.clear();
		this._state = STATE.NONE;
	}

	// ------------------------------------------------------------------
	// 公开工具方法
	// ------------------------------------------------------------------

	/** 标记模型中心为脏，下次需要时重新计算 */
	markCenterDirty(): void {
		this._centerDirty = true;
	}

	/** 重新计算模型中心（模型几何/结构变化后调用） */
	computeCenter(): Vector3 {
		this._centerDirty = false;

		this.object.updateWorldMatrix(true, true);

		this._box.setFromObject(this.object);

		// 只统计真实几何，跳过坐标轴等辅助对象：
		// AxesHelper 即使 opacity=0 不可见，仍会被 Box3.setFromObject 计入包围盒，
		// 其几何从原点伸向 +X/+Y/+Z，会把中心整体拉偏，导致旋转/缩放绕偏移点进行
		this._box.makeEmpty();
		this.object.traverse((child) => {
			if (child.type === 'AxesHelper') return;

			const geometry = (child as Mesh).geometry;
			if (!geometry) return;

			if (geometry.boundingBox === null) geometry.computeBoundingBox();
			const bb = geometry.boundingBox;
			if (!bb) return;

			this._geomBox.copy(bb).applyMatrix4(child.matrixWorld);
			this._box.union(this._geomBox);
		});

		if (this._box.isEmpty()) {
			this._localCenter.set(0, 0, 0);
		} else {
			this._box.getCenter(this._localCenter);
			this.object.worldToLocal(this._localCenter);
		}

		this._centerReady = true;
		return this._localCenter;
	}

	/** 惰性获取模型局部中心 */
	private _ensureCenter(): void {
		if (this._centerDirty || !this._centerReady) {
			this.computeCenter();
		}
	}

	/** 模型中心的世界坐标 */
	getCenter(target: Vector3 = new Vector3()): Vector3 {
		this._ensureCenter();
		this.object.updateMatrixWorld();
		return target.copy(this._localCenter).applyMatrix4(this.object.matrixWorld);
	}

	/** 相机到模型中心的距离 */
	getDistance(): number {
		this.camera.updateMatrixWorld();
		return this.getCenter(this._center).distanceTo(this.camera.position);
	}

	saveState(): this {
		this._savedState = {
			position: this.object.position.clone(),
			quaternion: this.object.quaternion.clone(),
		};
		// 旋转读数以该基准姿态为原点（reset 后自动归零），因此无需再记录累计角度
		this._hasRotationCache = false;
		return this;
	}

	reset(): this {
		if (!this._savedState) return this;

		this.object.position.copy(this._savedState.position);
		this.object.quaternion.copy(this._savedState.quaternion);
		this.object.updateMatrixWorld();

		// 姿态已回到基准，旋转读数缓存同步失效
		this._hasRotationCache = false;

		this.dispatchEvent(_changeEvent);
		return this;
	}

	/**
	 * 从当前姿态反推欧拉角（弧度），结果写入 `_rotationCache`。
	 *
	 * 读数为「相对 saveState() 基准姿态（默认初始姿态）的旋转」，因此初始 / reset 后为 0。
	 * 同一姿态存在两组等价欧拉解 (x, y, z) 与 (x+π, π−y, z+π)，各自再按 2π 周期对齐到
	 * 上次输出，取更接近的一组，从而在连续旋转（含 ±180°、±360°、万向锁）下避免显示跳变。
	 */
	private _resolveRotation(): void {
		if (this._savedState) {
			this._qRel.copy(this._savedState.quaternion).invert().multiply(this.object.quaternion);
		} else {
			this._qRel.copy(this.object.quaternion);
		}

		this._euler.setFromQuaternion(this._qRel, 'XYZ');
		const x = this._euler.x;
		const y = this._euler.y;
		const z = this._euler.z;

		if (!this._hasRotationCache) {
			this._rotationCache.set(x, y, z);
			this._hasRotationCache = true;
			return;
		}

		const rx = this._rotationCache.x;
		const ry = this._rotationCache.y;
		const rz = this._rotationCache.z;

		// 解 A：(x, y, z) 按 2π 周期对齐到上次输出
		const ax = nearestAngle(x, rx);
		const ay = nearestAngle(y, ry);
		const az = nearestAngle(z, rz);

		// 解 B：(x + π, π - y, z + π) 同样对齐
		const bx = nearestAngle(wrapPi(x + Math.PI), rx);
		const by = nearestAngle(wrapPi(Math.PI - y), ry);
		const bz = nearestAngle(wrapPi(z + Math.PI), rz);

		const distA = (ax - rx) ** 2 + (ay - ry) ** 2 + (az - rz) ** 2;
		const distB = (bx - rx) ** 2 + (by - ry) ** 2 + (bz - rz) ** 2;

		if (distB < distA) this._rotationCache.set(bx, by, bz);
		else this._rotationCache.set(ax, ay, az);
	}

	/**
	 * 当前旋转角度（角度制）。
	 *
	 * 由 object.quaternion 实时反推，因此 ViewCube 面点击、自动旋转等外部姿态变化都会计入；
	 * 读数为「相对 saveState() 基准姿态的旋转」，初始 / reset 后为 (0, 0, 0)。
	 * 经就近解缓存保持连续，故返回值可能为负或超过 360，不做 [0, 360) 归一化。
	 */
	getRotationDegrees(target: RotationDegrees = { x: 0, y: 0, z: 0 }): RotationDegrees {
		this._resolveRotation();
		target.x = this._rotationCache.x * RAD2DEG;
		target.y = this._rotationCache.y * RAD2DEG;
		target.z = this._rotationCache.z * RAD2DEG;
		return target;
	}

	/**
	 * 设置绝对姿态（枢轴即模型中心，因模型已居中于 object 原点）。
	 * 供 ViewCube 面点击等外部动画统一走控制器入口，避免绕过控制器直接改 object.quaternion。
	 */
	setOrientation(quaternion: Quaternion): this {
		this.object.quaternion.copy(quaternion);
		this.object.updateMatrixWorld();
		this.dispatchEvent(_changeEvent);
		return this;
	}

	/**
	 * 绕模型中心、绕给定局部轴旋转 angle 弧度（等价于 Object3D.rotateOnAxis）。
	 * 供自动旋转等外部动画统一走控制器入口，保证姿态变更集中管理。
	 */
	rotateLocal(axis: Vector3, angle: number): this {
		if (angle === 0) return this;
		this._q.setFromAxisAngle(axis, angle);
		this.object.quaternion.multiply(this._q);
		this.object.updateMatrixWorld();
		this.dispatchEvent(_changeEvent);
		return this;
	}

	update(): boolean {
		let changed = false;
		const f = this.dampingFactor > 0 ? Math.min(this.dampingFactor, 1) : 1;

		// 旋转
		if (this._pendingRotate.lengthSq() > EPS) {
			const ax = this._pendingRotate.x * f;
			const ay = this._pendingRotate.y * f;
			this._pendingRotate.multiplyScalar(1 - f);
			if (this._pendingRotate.lengthSq() < EPS) this._pendingRotate.set(0, 0);

			this._applyRotate(ax, ay);
			changed = true;
		} else if (this._pendingRotate.lengthSq() > 0) {
			// 残余量太小，直接清零
			this._pendingRotate.set(0, 0);
		}

		// 平移
		if (this._panOffset.lengthSq() > EPS) {
			this._offset.copy(this._panOffset).multiplyScalar(f);
			this.object.position.add(this._offset);
			this._panOffset.sub(this._offset);
			this.object.updateMatrixWorld();
			changed = true;
		} else if (this._panOffset.lengthSq() > 0) {
			this._panOffset.set(0, 0, 0);
		}

		// 缩放
		if (Math.abs(this._dollyScale - 1) > EPS) {
			const logS = Math.log(this._dollyScale);
			this._applyDollyFactor(Math.exp(logS * f));
			this._dollyScale = Math.exp(logS * (1 - f));
			if (Math.abs(this._dollyScale - 1) < EPS) this._dollyScale = 1;
			changed = true;
		} else if (this._dollyScale !== 1) {
			this._dollyScale = 1;
		}

		if (changed) this.dispatchEvent(_changeEvent);
		return changed;
	}

	setMode(mode: ControlMode): this {
		if (this.mode === mode) return this;

		this.mode = mode;

		// ---- 清空所有进行中的操作，避免残余量 ----
		this._state = STATE.NONE;
		this._pendingRotate.set(0, 0);
		this._panOffset.set(0, 0, 0);
		this._dollyScale = 1;

		// ---- 清空指针状态 ----
		this._pointers = [];
		this._pointerStarts.clear();

		// ---- 同步触摸行为（移动端单指） ----
		this.touches.ONE = mode === 'pan' ? TOUCH.PAN : TOUCH.ROTATE;

		// ---- 光标反馈 ----
		// if (this.domElement) {
		// 	this.domElement.style.cursor = mode === 'rotate' ? 'grab' : mode === 'pan' ? 'move' : 'zoom-in';
		// }

		// ---- 通知 UI ----
		this.onModeChange?.(mode);

		return this;
	}

	/** 获取当前模式（UI 初始化时读一次） */
	getMode(): ControlMode {
		return this.mode;
	}

	// ------------------------------------------------------------------
	// 指针事件
	// ------------------------------------------------------------------

	private _onPointerDown = (event: PointerEvent): void => {
		if (!this.enabled || !this.domElement) return;

		if (this._pointers.length === 0) {
			try {
				this.domElement.setPointerCapture(event.pointerId);
			} catch {
				// 忽略：元素可能已脱离 DOM
			}
			this.domElement.addEventListener('pointermove', this._onPointerMove);
			this.domElement.addEventListener('pointerup', this._onPointerUp);
		}

		this._addPointer(event);

		if (this._pointers.length === 1) {
			const entry = this._pointerStarts.get(event.pointerId);
			if (!entry) return;
			const pos = entry.current;

			if (event.pointerType === 'touch') {
				switch (this.touches.ONE) {
					case TOUCH.ROTATE:
						if (!this.enableRotate) return;
						this._state = STATE.ROTATE;
						this._rotateStart.copy(pos);
						this._rotateEnd.copy(pos);
						break;
					case TOUCH.PAN:
						if (!this.enablePan) return;
						this._state = STATE.PAN;
						this._panStart.copy(pos);
						this._panEnd.copy(pos);
						break;
					default:
						this._state = STATE.NONE;
				}
			} else {
				const leftAction: number = this.mode === 'rotate' ? MOUSE.ROTATE : this.mode === 'pan' ? MOUSE.PAN : MOUSE.DOLLY;
				const action =
					event.button === 0
						? leftAction // ← 左键随 mode 变
						: event.button === 1
							? this.mouseButtons.MIDDLE // 中键固定缩放
							: event.button === 2
								? this.mouseButtons.RIGHT // 右键固定平移
								: -1;

				switch (action) {
					case MOUSE.ROTATE:
						if (!this.enableRotate) return;
						this._state = STATE.ROTATE;
						this._rotateStart.copy(pos);
						this._rotateEnd.copy(pos);
						break;
					case MOUSE.PAN:
						if (!this.enablePan) return;
						this._state = STATE.PAN;
						this._panStart.copy(pos);
						this._panEnd.copy(pos);
						break;
					case MOUSE.DOLLY:
						if (!this.enableZoom) return;
						this._state = STATE.DOLLY;
						this._dollyStart.set(0, 0);
						this._dollyEnd.copy(this._dollyStart);
						break;
					default:
						this._state = STATE.NONE;
				}
			}

			if (this._state !== STATE.NONE) this.dispatchEvent(_startEvent);
		} else if (this._pointers.length === 2 && event.pointerType === 'touch') {
			switch (this.touches.TWO) {
				case TOUCH.DOLLY_PAN:
					if (!this.enableZoom && !this.enablePan) return;
					this._state = STATE.TOUCH_DOLLY_PAN;
					this._initPinch();
					this.dispatchEvent(_startEvent);
					break;
				case TOUCH.DOLLY_ROTATE:
					if (!this.enableZoom && !this.enableRotate) return;
					this._state = STATE.TOUCH_DOLLY_ROTATE;
					this._initPinch();
					this.dispatchEvent(_startEvent);
					break;
				default:
					this._state = STATE.NONE;
			}
		}
	};

	private _onPointerMove = (event: PointerEvent): void => {
		if (!this.enabled || !this.domElement || this._state === STATE.NONE) return;

		const entry = this._pointerStarts.get(event.pointerId);
		if (!entry) return;

		entry.current.set(event.clientX, event.clientY);

		switch (this._state) {
			case STATE.ROTATE: {
				this._rotateEnd.copy(entry.current);
				this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);

				this._rotateLeft((TAU * this._rotateDelta.x) / this.domElement.clientHeight);
				this._rotateUp((TAU * this._rotateDelta.y) / this.domElement.clientHeight);

				this._rotateStart.copy(this._rotateEnd);
				break;
			}

			case STATE.PAN: {
				this._panEnd.copy(entry.current);
				this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed);
				this.pan(this._panDelta.x, this._panDelta.y);
				this._panStart.copy(this._panEnd);
				break;
			}

			case STATE.DOLLY: {
				this._dollyEnd.set(event.clientX, event.clientY);
				const dollyDelta = this._dollyEnd.y - this._dollyStart.y;

				if (dollyDelta > 0) {
					this._dollyOut(this._getZoomScale(dollyDelta));
				} else if (dollyDelta < 0) {
					this._dollyIn(this._getZoomScale(dollyDelta));
				}

				this._dollyStart.copy(this._dollyEnd);
				break;
			}

			case STATE.TOUCH_DOLLY_PAN:
			case STATE.TOUCH_DOLLY_ROTATE: {
				if (this._pointers.length !== 2) break;

				const id0 = this._pointers[0];
				const id1 = this._pointers[1];
				if (id0 === undefined || id1 === undefined) return;

				const p0 = this._pointerStarts.get(id0);
				const p1 = this._pointerStarts.get(id1);
				if (!p0 || !p1) break;

				if (this.enableZoom) {
					const dist = p0.current.distanceTo(p1.current);
					if (this._dollyStart.x > 0 && dist > 0) {
						this._dollyScale *= this._dollyStart.x / dist;
					}
					this._dollyStart.x = dist;
				}

				const mx = (p0.current.x + p1.current.x) / 2;
				const my = (p0.current.y + p1.current.y) / 2;

				if (this._state === STATE.TOUCH_DOLLY_PAN && this.enablePan) {
					this.pan(mx - this._panEnd.x, my - this._panEnd.y);
					this._panEnd.set(mx, my);
				}

				break;
			}
		}

		this.update();
	};

	private _onPointerUp = (event: PointerEvent): void => {
		if (!this.domElement) return;

		this._removePointer(event);

		if (this._pointers.length === 0) {
			try {
				this.domElement.releasePointerCapture(event.pointerId);
			} catch {
				// 忽略
			}
			this.domElement.removeEventListener('pointermove', this._onPointerMove);
			this.domElement.removeEventListener('pointerup', this._onPointerUp);

			if (this._state !== STATE.NONE) {
				this.dispatchEvent(_endEvent);
				this._state = STATE.NONE;
			}
		} else if (this._pointers.length === 1 && (this._state === STATE.TOUCH_DOLLY_PAN || this._state === STATE.TOUCH_DOLLY_ROTATE)) {
			const id0 = this._pointers[0];
			if (id0 === undefined) return;
			const entry = this._pointerStarts.get(id0);
			if (entry) {
				entry.start.copy(entry.current);
				this._rotateStart.copy(entry.current);
				this._panStart.copy(entry.current);
			}
			this._state = this.touches.ONE === TOUCH.PAN ? STATE.PAN : STATE.ROTATE;
		}
	};

	private _onMouseWheel = (event: WheelEvent): void => {
		if (!this.enabled || !this.enableZoom || this._state !== STATE.NONE) return;

		event.preventDefault();

		this.dispatchEvent(_startEvent);

		const s = this._getZoomScale(event.deltaY);

		if (event.deltaY < 0) {
			this._dollyIn(s);
		} else {
			this._dollyOut(s);
		}

		this.update();
		this.dispatchEvent(_endEvent);
	};

	private _onContextMenu = (event: Event): void => {
		if (!this.enabled) return;
		event.preventDefault();
	};

	// ------------------------------------------------------------------
	// 内部方法
	// ------------------------------------------------------------------

	private _addPointer(event: PointerEvent): void {
		const position = new Vector2(event.clientX, event.clientY);
		this._pointerStarts.set(event.pointerId, {
			start: position.clone(),
			current: position.clone(),
		});
		this._pointers.push(event.pointerId);
	}

	private _removePointer(event: PointerEvent): void {
		this._pointerStarts.delete(event.pointerId);
		const index = this._pointers.indexOf(event.pointerId);
		if (index !== -1) this._pointers.splice(index, 1);
	}

	private _initPinch(): void {
		const id0 = this._pointers[0];
		const id1 = this._pointers[1];
		if (id0 === undefined || id1 === undefined) return;

		const p0 = this._pointerStarts.get(id0);
		const p1 = this._pointerStarts.get(id1);
		if (!p0 || !p1) return;

		this._dollyStart.set(p0.current.distanceTo(p1.current), 0);
		this._dollyEnd.copy(this._dollyStart);

		this._panEnd.set((p0.current.x + p1.current.x) / 2, (p0.current.y + p1.current.y) / 2);
		this._panStart.copy(this._panEnd);
	}

	private _getZoomScale(delta: number): number {
		return Math.pow(0.95, this.zoomSpeed * Math.abs(delta * 0.01));
	}

	private _dollyIn(dollyScale: number): void {
		this._dollyScale *= dollyScale;
	}

	private _dollyOut(dollyScale: number): void {
		this._dollyScale /= dollyScale;
	}

	private _rotateLeft(angle: number): void {
		if (Math.abs(angle) < 1e-12) return;
		this._pendingRotate.x += angle;
	}

	private _rotateUp(angle: number): void {
		if (Math.abs(angle) < 1e-12) return;
		this._pendingRotate.y += angle;
	}

	/**
	 * 合并 X/Y 两个轴向的旋转为单个四元数，只调用一次 _rotateModel，
	 * 避免两次 premultiply 之间的中间状态和 _normalizeRotation 的重复调用。
	 */
	private _applyRotate(angleX: number, angleY: number): void {
		if (angleX === 0 && angleY === 0) return;

		this.camera.updateMatrixWorld();

		// 先算绕相机竖直轴的旋转
		if (angleX !== 0) {
			this._v.setFromMatrixColumn(this.camera.matrixWorld, 1).normalize();
			this._q.setFromAxisAngle(this._v, angleX);
		} else {
			this._q.identity();
		}

		// 再算绕相机水平轴的旋转，与前者组合
		if (angleY !== 0) {
			this._v.setFromMatrixColumn(this.camera.matrixWorld, 0).normalize();
			this._q2.setFromAxisAngle(this._v, angleY);
			this._q.multiply(this._q2);
		}

		this._rotateModel(this._q);
	}

	private _rotateModel(q: Quaternion): void {
		this._ensureCenter();
		this.object.updateMatrixWorld();

		// 世界坐标下的模型中心
		this._center.copy(this._localCenter).applyMatrix4(this.object.matrixWorld);

		// 模型位置绕中心旋转，四元数在自身基础上左乘（世界空间旋转）
		this._offset.subVectors(this.object.position, this._center).applyQuaternion(q);
		this.object.position.copy(this._center).add(this._offset);
		this.object.quaternion.premultiply(q);

		this.object.updateMatrixWorld();
	}

	pan(deltaX: number, deltaY: number): void {
		if (!this.domElement) return;

		this.camera.updateMatrixWorld();
		this.object.updateMatrixWorld();
		this.getCenter(this._center);

		this._offset.subVectors(this._center, this.camera.position);
		let targetDistance = this._offset.length();

		const persp = this.camera as PerspectiveCamera;
		const ortho = this.camera as OrthographicCamera;

		if (persp.isPerspectiveCamera) {
			targetDistance *= Math.tan((persp.fov / 2) * DEG2RAD);
		} else if (ortho.isOrthographicCamera) {
			targetDistance = (ortho.top - ortho.bottom) / ortho.zoom;
		}

		this._panLeft((-2 * deltaX * targetDistance) / this.domElement.clientHeight, this.camera.matrix);
		this._panUp((-2 * deltaY * targetDistance) / this.domElement.clientHeight, this.camera.matrix);
	}

	private _panLeft(distance: number, matrix: Matrix4): void {
		this._v.setFromMatrixColumn(matrix, 0).multiplyScalar(-distance);
		this._panOffset.add(this._v);
	}

	private _panUp(distance: number, matrix: Matrix4): void {
		if (this.screenSpacePanning === true) {
			this._v.setFromMatrixColumn(matrix, 1);
		} else {
			this._v.setFromMatrixColumn(matrix, 0).crossVectors(this.camera.up, this._v);
		}
		this._v.multiplyScalar(distance);
		this._panOffset.add(this._v);
	}

	private _applyDollyFactor(factor: number): void {
		if (factor === 1) return;

		this.object.updateMatrixWorld();
		this.getCenter(this._center);

		this._offset.subVectors(this._center, this.camera.position);
		const dist = this._offset.length();
		if (dist === 0) return;

		const newDist = Math.min(Math.max(dist * factor, this.minDistance), this.maxDistance);

		this._offset.multiplyScalar((newDist - dist) / dist);
		this.object.position.add(this._offset);
		this.object.updateMatrixWorld();
	}
}

export default ModelControls;
