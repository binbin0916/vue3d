var renderer;
var anaglyph;
var UNIT = 'mm';
var UNITBASE = 3;
var m_arry = ['/', 'm', 'o', 'd', 'e', 'l', '/', 'g', 'e', 't', '/'];
function initRender() {
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
	renderer.physicallyCorrectLights = true;
	renderer.setPixelRatio(window.devicePixelRatio * 2);
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0xffffff);
	renderer.autoClear = false;
	renderer.localClippingEnabled = true;
	container.appendChild(renderer.domElement);
}

var camera;
var camera_v;
function initCamera() {
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, rate / 20, 1000);

	camera_v = new THREE.Vector3(0, 0, rate * 2);
	camera.position.copy(camera_v);
	camera.lookAt(model_group);
}

var scene;
function initScene() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xd6e3ed);
	// scene.background = new THREE.Color(0xeeeeee)
}

var view_scene;
var view_cube;
var view_camera;
var view_r = 60;
function initView() {
	view_scene = new THREE.Scene();
	view_camera = new THREE.OrthographicCamera(
		window.innerWidth / -view_r,
		window.innerWidth / view_r,
		window.innerHeight / view_r,
		window.innerHeight / -view_r,
		0.1,
		100
	);
	view_camera.position.z = view_r;
	view_cube = init_viewcub();
	view_scene.add(view_cube);
	init_point();
}
function init_viewcub() {
	var lifangti = new THREE.Object3D();
	var words = ['', '', '', '', '', '', '', '', '', '', '', '', '上', '前', '下', '后', '左', '右', '', '', '', '', '', '', '', ''];
	var p_arg = [
		[
			1.0750000476837158, -1.25, -1.0750000476837158, 1.0750000476837158, -1.25, 1.0750000476837158, 1.25, -1.0750000476837158, -1.0750000476837158,
			1.25, -1.0750000476837158, 1.0750000476837158,
		],
		[
			1.0750000476837158, -1.0750000476837158, 1.25, -1.0749999284744263, -1.0750000476837158, 1.25, -1.0749999284744263, -1.25, 1.0750000476837158,
			1.0750000476837158, -1.25, 1.0750000476837158,
		],
		[
			-1.25, -1.0750000476837158, 1.0750000476837158, -1.25, 1.0749999284744263, 1.0750000476837158, -1.0749999284744263, 1.0749999284744263, 1.25,
			-1.0749999284744263, -1.0750000476837158, 1.25,
		],
		[
			-1.0749999284744263, -1.0750000476837158, -1.25, -1.0749999284744263, 1.0749999284744263, -1.25, -1.25, 1.0749999284744263, -1.0750000476837158,
			-1.25, -1.0750000476837158, -1.0750000476837158,
		],
		[
			1.25, -1.0750000476837158, -1.0750000476837158, 1.25, 1.0749999284744263, -1.0750000476837158, 1.0750000476837158, 1.0749999284744263, -1.25,
			1.0750000476837158, -1.0750000476837158, -1.25,
		],
		[
			-1.0749999284744263, -1.25, -1.0750000476837158, -1.0749999284744263, -1.25, 1.0750000476837158, -1.25, -1.0750000476837158, 1.0750000476837158,
			-1.25, -1.0750000476837158, -1.0750000476837158,
		],
		[
			1.0750000476837158, -1.25, -1.0750000476837158, -1.0749999284744263, -1.25, -1.0750000476837158, -1.0749999284744263, -1.0750000476837158,
			-1.25, 1.0750000476837158, -1.0750000476837158, -1.25,
		],
		[
			1.0750000476837158, -1.0750000476837158, 1.25, 1.0750000476837158, 1.0749999284744263, 1.25, 1.25, 1.0749999284744263, 1.0750000476837158, 1.25,
			-1.0750000476837158, 1.0750000476837158,
		],
		[
			1.25, 1.0749999284744263, -1.0750000476837158, 1.25, 1.0749999284744263, 1.0750000476837158, 1.0750000476837158, 1.25, -1.0750000476837158,
			1.0750000476837158, 1.25, 1.0750000476837158,
		],
		[
			1.0750000476837158, 1.25, 1.0750000476837158, -1.0749999284744263, 1.25, 1.0750000476837158, -1.0749999284744263, 1.0749999284744263, 1.25,
			1.0750000476837158, 1.0749999284744263, 1.25,
		],
		[
			-1.0749999284744263, 1.25, -1.0750000476837158, -1.0749999284744263, 1.25, 1.0750000476837158, -1.25, 1.0749999284744263, -1.0750000476837158,
			-1.25, 1.0749999284744263, 1.0750000476837158,
		],
		[
			1.0750000476837158, 1.25, -1.0750000476837158, -1.0749999284744263, 1.25, -1.0750000476837158, 1.0750000476837158, 1.0749999284744263, -1.25,
			-1.0749999284744263, 1.0749999284744263, -1.25,
		],
		[
			1.0750000476837158, 1.25, -1.0750000476837158, 1.0750000476837158, 1.25, 1.0750000476837158, -1.0749999284744263, 1.25, -1.0750000476837158,
			-1.0749999284744263, 1.25, 1.0750000476837158,
		],
		[
			-1.0749999284744263, -1.0750000476837158, 1.25, -1.0749999284744263, 1.0749999284744263, 1.25, 1.0750000476837158, -1.0750000476837158, 1.25,
			1.0750000476837158, 1.0749999284744263, 1.25,
		],
		[
			-1.0749999284744263, -1.25, -1.0750000476837158, -1.0749999284744263, -1.25, 1.0750000476837158, 1.0750000476837158, -1.25, -1.0750000476837158,
			1.0750000476837158, -1.25, 1.0750000476837158,
		],
		[
			-1.0749999284744263, -1.0750000476837158, -1.25, -1.0749999284744263, 1.0749999284744263, -1.25, 1.0750000476837158, -1.0750000476837158, -1.25,
			1.0750000476837158, 1.0749999284744263, -1.25,
		],
		[
			-1.25, -1.0750000476837158, 1.0750000476837158, -1.25, 1.0749999284744263, 1.0750000476837158, -1.25, 1.0749999284744263, -1.0750000476837158,
			-1.25, -1.0750000476837158, -1.0750000476837158,
		],
		[
			1.25, -1.0750000476837158, 1.0750000476837158, 1.25, 1.0749999284744263, 1.0750000476837158, 1.25, -1.0750000476837158, -1.0750000476837158,
			1.25, 1.0749999284744263, -1.0750000476837158,
		],
		[1.25, 1.0749999284744263, 1.0750000476837158, 1.0750000476837158, 1.25, 1.0750000476837158, 1.0750000476837158, 1.0749999284744263, 1.25],
		[-1.25, 1.0749999284744263, -1.0750000476837158, -1.0749999284744263, 1.25, -1.0750000476837158, -1.0749999284744263, 1.0749999284744263, -1.25],
		[1.0750000476837158, 1.0749999284744263, -1.25, 1.0750000476837158, 1.25, -1.0750000476837158, 1.25, 1.0749999284744263, -1.0750000476837158],
		[-1.0749999284744263, 1.0749999284744263, 1.25, -1.0749999284744263, 1.25, 1.0750000476837158, -1.25, 1.0749999284744263, 1.0750000476837158],
		[1.0750000476837158, -1.0750000476837158, 1.25, 1.0750000476837158, -1.25, 1.0750000476837158, 1.25, -1.0750000476837158, 1.0750000476837158],
		[1.25, -1.0750000476837158, -1.0750000476837158, 1.0750000476837158, -1.25, -1.0750000476837158, 1.0750000476837158, -1.0750000476837158, -1.25],
		[
			-1.0749999284744263, -1.0750000476837158, -1.25, -1.0749999284744263, -1.25, -1.0750000476837158, -1.25, -1.0750000476837158,
			-1.0750000476837158,
		],
		[-1.25, -1.0750000476837158, 1.0750000476837158, -1.0749999284744263, -1.25, 1.0750000476837158, -1.0749999284744263, -1.0750000476837158, 1.25],
	];
	var i_arg = [
		[1, 0, 2, 3, 1, 2],
		[3, 0, 1, 3, 1, 2],
		[2, 0, 3, 1, 0, 2],
		[2, 0, 3, 1, 0, 2],
		[2, 0, 3, 1, 0, 2],
		[1, 2, 3, 1, 3, 0],
		[3, 0, 1, 3, 1, 2],
		[2, 0, 3, 1, 0, 2],
		[3, 1, 0, 3, 0, 2],
		[3, 0, 1, 3, 1, 2],
		[3, 1, 0, 3, 0, 2],
		[0, 2, 3, 0, 3, 1],
		[3, 1, 0, 3, 0, 2],
		[3, 1, 0, 3, 0, 2],
		[0, 3, 1, 2, 3, 0],
		[1, 2, 0, 3, 2, 1],
		[3, 1, 2, 0, 1, 3],
		[3, 1, 0, 3, 0, 2],
		[1, 2, 0],
		[1, 2, 0],
		[1, 2, 0],
		[1, 2, 0],
		[2, 0, 1],
		[2, 0, 1],
		[2, 0, 1],
		[2, 0, 1],
	];
	for (var i = 0; i < 26; i++) {
		var nc_geo = new THREE.BufferGeometry();
		nc_geo.attributes.position = new THREE.BufferAttribute(new Float32Array(p_arg[i]), 3);
		nc_geo.index = new THREE.BufferAttribute(new Uint16Array(i_arg[i]), 1);
		var nc_mater;
		if (words[i].length > 0) {
			var uvs = [];
			switch (words[i]) {
				case '左':
					uvs = [1, 0, 1, 1, 0, 1, 0, 0];
					break;
				case '后':
					uvs = [1, 0, 1, 1, 0, 0, 0, 1];
					break;
				case '上':
					uvs = [1, 1, 1, 0, 0, 1, 0, 0];
					break;
				default:
					uvs = [0, 0, 0, 1, 1, 0, 1, 1];
					break;
			}
			nc_geo.attributes.uv = new THREE.Float32BufferAttribute(uvs, 2);
			nc_mater = new THREE.MeshBasicMaterial({
				color: 0xc0c0c0,
				map: set_viewtext(words[i], '#c0c0c0', 'blue'),
			});
		} else {
			if (nc_geo.attributes.position.array.length == 9) {
				nc_mater = new THREE.MeshBasicMaterial({ color: 0xc0c0c0 });
			} else {
				nc_mater = new THREE.MeshBasicMaterial({ color: 0xffffff });
			}
		}
		var nc = new THREE.Mesh(nc_geo, nc_mater);
		nc.name = i;
		nc.renderOrder = 999;
		nc.material.depthTest = false;
		nc.material.depthWrite = false;
		nc.onBeforeRender = function (renderer) {
			renderer.clearDepth();
		};
		lifangti.add(nc);
	}
	lifangti.matrixWorldNeedsUpdate = true;
	return lifangti;
}
var INTERSECTED;
var raycaster;
var view_pointer;
var pointer_listen = false;
function init_point() {
	raycaster = new THREE.Raycaster();
	view_pointer = new THREE.Vector2();
	document.addEventListener('pointermove', onPointerMove);
	document.addEventListener('click', onPointerClick);
}
var view_pw = 100;
var view_ph = 100;
function onPointerMove(event) {
	pointer_listen = true;
	var target = new THREE.Vector4();
	var vp = renderer.getViewport(target);
	view_pointer.x = ((event.clientX - vp.x) / renderer.domElement.clientWidth) * 2 - 1;
	view_pointer.y = -((event.clientY + renderer.domElement.clientHeight / 2 - view_ph) / renderer.domElement.clientHeight) * 2 + 1;
}

var quaternion = new THREE.Quaternion();
var INTERSECTED_name;
var plane_vector = new THREE.Vector3();
function onPointerClick(event) {
	var euler = new THREE.Euler();
	if (INTERSECTED) {
		controls.reset();
		view_controls.reset();
		camera.position.copy(camera_v);
		// planes[0].normal.set(plane.normal.x, plane.normal.y, plane.normal.z)
		switch (INTERSECTED.name) {
			case 0: //右下
				euler.set(-Math.PI / 8, -Math.PI / 2, Math.PI / 8);
				// model_group.rotation.set(-Math.PI / 8, -Math.PI / 2, Math.PI / 8)
				quaternion.setFromEuler(new THREE.Euler(-Math.PI / 8, -Math.PI / 2, Math.PI / 8, 'XYZ'));
				break;
			case 1: //前下
				euler.set(-Math.PI / 4, 0, 0);
				// model_group.rotation.set(-Math.PI / 4, 0, 0)
				quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), -Math.PI / 4);
				break;
			case 2: //左前
				euler.set(0, Math.PI / 4, 0);
				// model_group.rotation.set(0, Math.PI / 4, 0)
				quaternion.setFromEuler(new THREE.Euler(0, Math.PI / 4, 0, 'XYZ'));
				break;
			case 3: //后左
				euler.set(0, (Math.PI * 3) / 4, 0);
				// model_group.rotation.set(0, (Math.PI * 3) / 4, 0)
				quaternion.setFromEuler(new THREE.Euler(0, (Math.PI * 3) / 4, 0, 'XYZ'));
				break;
			case 4: //右后
				euler.set(0, (-Math.PI * 3) / 4, 0);
				// model_group.rotation.set(0, (-Math.PI * 3) / 4, 0)
				quaternion.setFromEuler(new THREE.Euler(0, (-Math.PI * 3) / 4, 0, 'XYZ'));
				break;
			case 5: //左下
				euler.set(-Math.PI / 4, Math.PI / 2, 0);
				// model_group.rotation.set(-Math.PI / 4, Math.PI / 2, 0)
				quaternion.setFromEuler(new THREE.Euler(-Math.PI / 4, Math.PI / 2, 0, 'XYZ'));
				break;
			case 6: //后下
				euler.set(-Math.PI / 4, -Math.PI, 0);
				// model_group.rotation.set(-Math.PI / 4, -Math.PI, 0)
				quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), -Math.PI / 4);
				break;
			case 7: //前右
				euler.set(0, -Math.PI / 4, 0);
				// model_group.rotation.set(0, -Math.PI / 4, 0)
				quaternion.setFromEuler(new THREE.Euler(0, -Math.PI / 4, 0, 'XYZ'));
				break;
			case 8: //右上
				euler.set(Math.PI / 8, -Math.PI / 2, -Math.PI / 8);
				quaternion.setFromEuler(new THREE.Euler(Math.PI / 8, -Math.PI / 2, -Math.PI / 8, 'XYZ'));
				break;
			case 9: //上前
				euler.set(Math.PI / 4, 0, 0);
				quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI / 4);
				break;
			case 10: //左上
				euler.set(Math.PI / 4, Math.PI / 2, 0);
				quaternion.setFromEuler(new THREE.Euler(Math.PI / 4, Math.PI / 2, 0, 'XYZ'));
				break;
			case 11: //后上
				euler.set(Math.PI / 4, -Math.PI, 0);
				quaternion.setFromEuler(new THREE.Euler(Math.PI / 4, -Math.PI, 0, 'XYZ'));
				break;
			case 12: //上
				euler.set(Math.PI / 2, 0, 0);
				quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI / 2);
				break;
			case 13: //前
				euler.set(0, 0, 0);
				quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), 0);
				break;
			case 14: //下
				euler.set(-Math.PI / 2, 0, 0);
				quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), -Math.PI / 2);
				break;
			case 15: //后
				euler.set(0, -Math.PI, 0);
				quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
				break;
			case 16: //左
				euler.set(0, Math.PI / 2, 0);
				quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
				break;
			case 17: //右
				euler.set(0, -Math.PI / 2, 0);
				quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
				break;
			case 18: //前上右
				euler.set(Math.PI / 4, -Math.PI / 4, 0);
				quaternion.setFromEuler(new THREE.Euler(Math.PI / 4, -Math.PI / 4, 0, 'XYZ'));
				break;
			case 19: //后上左
				euler.set(Math.PI / 4, (Math.PI * 3) / 4, 0);
				quaternion.setFromEuler(new THREE.Euler(Math.PI / 4, (Math.PI * 3) / 4, 0, 'XYZ'));
				break;
			case 20: //右上后
				euler.set(Math.PI / 4, (-Math.PI * 3) / 4, 0);
				quaternion.setFromEuler(new THREE.Euler(Math.PI / 4, (-Math.PI * 3) / 4, 0, 'XYZ'));
				break;
			case 21: //左上前
				euler.set(Math.PI / 4, Math.PI / 4, 0);
				quaternion.setFromEuler(new THREE.Euler(Math.PI / 4, Math.PI / 4, 0, 'XYZ'));
				break;
			case 22: //下前右
				euler.set(-Math.PI / 4, -Math.PI / 4, 0);
				quaternion.setFromEuler(new THREE.Euler(-Math.PI / 4, -Math.PI / 4, 0, 'XYZ'));
				break;
			case 23: //下右后
				euler.set(-Math.PI / 4, (-Math.PI * 3) / 4, 0);
				quaternion.setFromEuler(new THREE.Euler(-Math.PI / 4, (-Math.PI * 3) / 4, 0, 'XYZ'));
				break;
			case 24: //下后左
				euler.set(-Math.PI / 4, (Math.PI * 3) / 4, 0);
				quaternion.setFromEuler(new THREE.Euler(-Math.PI / 4, (Math.PI * 3) / 4, 0, 'XYZ'));
				break;
			case 25: //下左前
				euler.set(-Math.PI / 4, Math.PI / 4, 0);
				quaternion.setFromEuler(new THREE.Euler(-Math.PI / 4, Math.PI / 4, 0, 'XYZ'));
				break;
		}
		rotateObjectWithTween(model_group, euler, 500);
	}
}
function view_select() {
	if (!pointer_listen) return;
	raycaster.setFromCamera(view_pointer, view_camera);
	var intersects = raycaster.intersectObjects(view_scene.children[0].children, false);
	if (intersects.length > 0) {
		if (INTERSECTED != intersects[0].object) {
			if (INTERSECTED) {
				INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
			}
			INTERSECTED = intersects[0].object;
			INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
			INTERSECTED.material.color.setHex(0xff0000);
		}
	} else {
		if (INTERSECTED) {
			INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
		}
		INTERSECTED = null;
	}
}
function set_viewtext(text, backcolor, textcolor) {
	var dynamictexture = new THREE.DynamicTexture(512, 512);
	dynamictexture.context.font = 'bolder 180px verdana';
	dynamictexture.texture.needsUpdate = true;
	dynamictexture.clear(backcolor).drawText(text, undefined, 256, textcolor);
	return dynamictexture.texture;
}
function set_viewline(object, color) {
	// 边框辅助线
	const edges = new THREE.EdgesGeometry(object.geometry);
	const material = new THREE.LineBasicMaterial({
		color: color,
		linewidth: 1,
		depthWrite: false,
		depthTest: false,
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.05,
	});
	const line = new THREE.LineSegments(edges, material);
	// 获取物体的世界坐标 旋转等
	const worldPosition = new THREE.Vector3();
	object.getWorldPosition(worldPosition);
	line.scale.copy(object.scale);
	line.rotation.copy(object.rotation);
	line.position.copy(worldPosition);
	object.add(line);
}

var light;
function initLight() {
	light = new THREE.HemisphereLight(0xffffff, 0x080820, 1);
	light.position.copy(camera.position);
	scene.add(light);
	addShadowedLight(rate * 6, rate * 6, rate * 6, 0xffffff, 1 * 1.5);
	addShadowedLight(rate * 6, rate * 6, rate * -6, 0xffffff, 1 * 1.5);

	addShadowedLight1(0, 1, 0, 0xffffff, 0.6);
	addShadowedLight2();
}

function addShadowedLight(x, y, z, color, intensity) {
	var directionalLight = new THREE.DirectionalLight(color, intensity);
	directionalLight.color.setHSL(0.1, 1, 0.95);
	directionalLight.position.set(x, y, z);
	directionalLight.position.multiplyScalar(30);
	scene.add(directionalLight);

	var d = rate;
	// directionalLight.castShadow = true
	directionalLight.shadow.camera.left = -d;
	directionalLight.shadow.camera.right = d;
	directionalLight.shadow.camera.top = d;
	directionalLight.shadow.camera.bottom = -d;
	directionalLight.shadow.camera.near = 1;
	directionalLight.shadow.camera.far = 10;
	directionalLight.shadow.bias = -0.002;
}

function addShadowedLight1(x, y, z, color, intensity) {
	// DirectionalLight
	var spotLight = new THREE.SpotLight(color, intensity / 10);
	spotLight.position.set(x, y, z);
	spotLight.castShadow = true;

	spotLight.shadow.mapSize.width = 1024 * 10;
	spotLight.shadow.mapSize.height = 1024 * 10;

	model.add(spotLight);
}

var ShadowedLight2;
function addShadowedLight2() {
	ShadowedLight2 = new THREE.DirectionalLight(0xffffff, 2);
	ShadowedLight2.position.set(0, 0, 1);
	scene.add(ShadowedLight2);
}

var model;
var model_group;
var model_x;
var model_y;
var model_z;
var rate;
var axes;
var model_objs = [];

var box;
var boxHelper;
var modelArr = [],
	_modelArr = [];
var modelScale = 1;
var modelInfo;
var modelType;
var rotateInteraction;
var model_name = '';
function initLoadingElement() {
	var loading = document.createElement('div');
	loading.id = 'loading';
	loading.style.userSelect = 'none';
	loading.style.position = 'absolute';
	loading.style.top = '50%';
	loading.style.left = '50%';
	loading.style.transform = 'translate(-50%, -50%)';
	loading.style.color = '#fff';
	loading.style.fontSize = '20px';
	loading.style.fontWeight = 'bold';
	loading.style.textAlign = 'center';
	loading.style.background = 'rgba(0, 0, 0, 0.75)';
	loading.style.width = '100%';
	loading.style.height = '100%';
	loading.style.zIndex = '9999';
	loading.style.opacity = '1';
	loading.style.transition = 'all 1s ease-out';
	loading.style.backdropFilter = 'blur(5px)';

	var loadingBar = document.createElement('div');
	loadingBar.style.position = 'absolute';
	loadingBar.style.top = '45%';
	loadingBar.style.left = '50%';
	loadingBar.style.transform = 'translate(-50%, -50%)';
	loadingBar.style.color = '#fff';
	loadingBar.style.fontSize = '20px';
	loadingBar.style.fontWeight = '300';
	loadingBar.style.textAlign = 'center';
	loadingBar.style.width = '30%';
	loadingBar.style.height = '10px';
	loadingBar.style.border = '1px solid #fff';
	loadingBar.style.borderRadius = '5px';
	loadingBar.style.overflow = 'hidden';
	loading.appendChild(loadingBar);

	var loadingBarInner = document.createElement('div');
	loadingBarInner.id = 'loadingBarInner';
	loadingBarInner.style.position = 'absolute';
	loadingBarInner.style.width = '0%';
	loadingBarInner.style.height = '100%';
	loadingBarInner.style.background = '#fff';
	loadingBarInner.style.transition = 'width 0.5s';
	loadingBarInner.style.borderRadius = '5px';
	loadingBarInner.style.boxShadow = '0 0 5px #fff';
	loadingBarInner.style.opacity = '1';
	loadingBarInner.style.zIndex = '9999';
	loadingBarInner.style.left = '0%';
	loadingBarInner.style.top = '50%';
	loadingBarInner.style.transform = 'translate(0, -50%)';
	loadingBarInner.style.overflow = 'hidden';
	loadingBar.appendChild(loadingBarInner);

	var loadingTips = document.createElement('div');
	loadingTips.style.position = 'absolute';
	loadingTips.style.top = '55%';
	loadingTips.style.left = '50%';
	loadingTips.style.transform = 'translate(-50%, -50%)';
	loadingTips.style.color = '#fff';
	loadingTips.style.fontSize = '20px';
	loadingTips.style.fontWeight = '300';
	loadingTips.style.textAlign = 'center';
	loadingTips.style.width = '80%';
	loadingTips.innerHTML = '模型文件首次加载可能时间较长，请耐心等待...';
	loading.appendChild(loadingTips);

	var loadingText = document.createElement('div');
	loadingText.id = 'loadingText';
	loadingText.style.position = 'absolute';
	loadingText.style.top = '40%';
	loadingText.style.left = '50%';
	loadingText.style.transform = 'translate(-50%, -50%)';
	loadingText.style.color = '#fff';
	loadingText.style.fontSize = '20px';
	loadingText.style.fontWeight = '300';
	loadingText.style.textAlign = 'center';
	loadingText.style.width = '80%';
	// document.getElementById('loadingText').innerHTML = '当前模型已加载 ' + progress + '%'
	loadingText.innerHTML = "当前模型已加载 <span id='loadingTextPercent' style='font-weight: 600'>0</span> %";

	loading.appendChild(loadingText);

	document.body.appendChild(loading);
}

function onModelProgress(progressEvent) {
	var loaded = progressEvent.loaded;
	var total = progressEvent.loaded;
	var lengthComputable = progressEvent.loaded;
	var progress = 0;
	if (lengthComputable) {
		var loadingBarInner = document.getElementById('loadingBarInner');
		progress = (loaded / total) * 100;
		loadingBarInner.style.width = progress + '%';
		animationCount(500, 0, progress, function (value) {
			document.getElementById('loadingTextPercent').innerText = value.toFixed(0);
		});

		if (progress && progress == 100) {
			var timer = setTimeout(function () {
				document.getElementById('loading').style.opacity = '0';
				setTimeout(function () {
					progress = 0;
					document.body.removeChild(document.getElementById('loading'));
				}, 1000);
				if (timer) {
					clearTimeout(timer);
				}
			}, 1000);
		}
	} else {
		document.body.removeChild(document.getElementById('loading'));
	}
}

function initModel(code) {
	var loader = new THREE.GLTFLoader();
	loader.load(
		// m_arry.join('') + code,
		// m_arry.join('') + 'export_convert_323248_151.glb',
		m_arry.join('') + 'IPTH8-20.glb',
		function (gltf) {
			console.log('🚀 ~ initModel ~ gltf:', gltf);
			console.log('🚀 ~ initModel ~ gltf.scene.children[0].children[0].userDat:', gltf.scene.children[0].children[0].userData);
			model = gltf.scene;
			model_name = gltf.scene.children[0].name + '_';

			const geos = [];

			model.traverse(function (object) {
				if (object.type === 'Mesh') {
					// MeshStandardMaterial MeshPhongMaterial
					object.material = new THREE.MeshPhongMaterial({
						map: object.material.map,
						color: object.material.color,
						emissive: object.material.emissive,
						specular: object.material.color,
						shininess: 10,
						emissiveIntensity: 1,
					});
					object.material.side = THREE.DoubleSide;
					object.castShadow = true;
					model_objs.push(object);
					modelArr.push(object);
					console.log(`output->object`, object);
					geos.push(object.geometry.userData);
				}
			});

			console.log(`output->geos`, geos);

			_modelArr = cloneDeep(modelArr);

			model.matrixWorldAutoUpdate = true;
			model.matrixWorldNeedsUpdate = true;
			model.scale.set(1, 1, 1);
			box = new THREE.Box3().setFromObject(model);
			boxHelper = new THREE.Box3Helper(box, 0xffa000);
			var center_x = -(box.min.x + box.max.x) / 2;
			var center_y = -(box.min.y + box.max.y) / 2;
			var center_z = -(box.min.z + box.max.z) / 2;
			model.position.set(center_x, center_y, center_z);

			model_x = box.max.x - box.min.x;
			model_y = box.max.y - box.min.y;
			model_z = box.max.z - box.min.z;
			rate = Math.max(model_x, model_y, model_z);

			model_group = new THREE.Object3D();

			model_group.position.set(0, 0, 0);

			model_group.rotation.set(Math.PI / 4, -Math.PI / 4, 0);

			model_group.add(model);

			scene.add(model_group);

			const axes_leg = rate * 1.5;
			axes = new THREE.AxesHelper(axes_leg);
			initCamera();
			initLight();
			initControls();
			initViewControls();

			// initMenuTool()

			animate();

			modelInfo = gltf.userData;
			if (gltf.userData && gltf.userData.unitname) {
				UNIT = gltf.userData.unitname;
			}
			if (gltf.userData.unitname == 'mm') {
				UNITBASE = 0;
			}
			modelType = gltf.scene.children[0].children[0].userData;
			if (gltf.scene.children[0].children[0].userData.hasOwnProperty('threads')) {
				modelType.features.threads = gltf.scene.children[0].children[0].userData.threads[0];
			}
			if (modelInfo && modelInfo.unitname) {
				UNIT = modelInfo.unitname;
			}
		},
		onModelProgress
	);

	// loader.load('/3d_tree/public/export_convert_323248_151.glb', function (gltf) {
	//   modelInfo = gltf.userData;
	//   modelType = gltf.scene.children[0].children[0].userData;

	//   if (gltf.scene.children[0].children[0].userData.hasOwnProperty('threads')) {
	//     modelType.features.threads = gltf.scene.children[0].children[0].userData.threads[0];
	//   }
	// });
}

var controls;
var view_controls;
function initControls() {
	var speed = 1.0 * 0.8;

	controls = new THREE.TrackballControls(camera, renderer.domElement);
	controls.rotateSpeed = speed;
	controls.enableZoom = true;
	controls.minDistance = rate / 5;
	controls.maxDistance = rate * 5;
	controls.enablePan = true;
	controls.enableRotate = true;

	controls.noPan = true;
	window.onresize = onWindowResize;
}

function initViewControls() {
	var speed = 1.0;
	view_controls = new THREE.TrackballControls(view_camera, renderer.domElement);
	view_controls.rotateSpeed = speed;
	view_controls.noZoom = true;
	view_controls.noPan = true;
	window.onresize = onWindowResize;
}

function render() {
	renderer.clear();
	renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
	renderer.render(scene, camera);
	// effectRender()

	CSS2DRenderer.render(scene, camera);

	renderer.setViewport(window.innerWidth / 2 - view_pw, window.innerHeight / 2 - view_ph, window.innerWidth, window.innerHeight);
	renderer.render(view_scene, view_camera);
}

function onWindowResize() {
	var aspect = window.innerWidth / window.innerHeight;

	camera.aspect = aspect;
	camera.updateProjectionMatrix();

	view_cube.rotation.copy(model_group.rotation);

	view_camera.left = -window.innerWidth / view_r;
	view_camera.right = window.innerWidth / view_r;
	view_camera.top = window.innerHeight / view_r;
	view_camera.bottom = -window.innerHeight / view_r;
	view_camera.updateProjectionMatrix();
	render();
	renderer.setSize(window.innerWidth, window.innerHeight);
	CSS2DRenderer.setSize(window.innerWidth, window.innerHeight);

	// effectResize()
}

function animate() {
	requestAnimationFrame(animate);
	if (is_donuts) {
		model_group.rotation.z += 0.01;
	}

	for (var i = 0; i < model_objs.length; i++) {
		model_objs[i].material.wireframe = is_wf;
	}
	view_cube.rotation.copy(model_group.rotation);

	render();
	view_select();

	if (transformControls) {
		transformControls.update();
		updateSlicePlane();
		updateSlicePlaneX();
	}

	// updateSlicePlane()

	controls.update();
	view_controls.update();
	TWEEN.update();
}

var container;
var is_axes = false;
var is_donuts = false;
var is_wf = false;
var is_bound = false;
var is_grid = false;
var is_fullScreen = false;
var is_move = false;
var is_slice = false;
var is_helper = false;
var is_measure = false;
var is_baseInfo = false;
function tool_init() {
	const tool_div = document.getElementById('t');
	tool_div.addEventListener('click', function (e) {
		if (e.target.tagName === 'BUTTON' && e.target.id !== 'is_measure' && e.target.className !== 'coexist') {
			e.target.classList.toggle('active');
		}
	});
	tool_btn_reset(tool_div);
	//tool_btn_rotate(tool_div)
	tool_btn_coordinate(tool_div);
	// tool_btn_move(tool_div)
	tool_btn_wf(tool_div);
	tool_btn_boundingBox(tool_div);
	tool_btn_grid(tool_div);
	tool_btn_screenShot(tool_div);
	tool_btn_fullScreen(tool_div);
	tool_btn_slice(tool_div);
	tool_btn_baseInfo(tool_div);
	tool_btn_measure(tool_div);
	// tool_btn_changeCamera(tool_div)
	tool_btn_help(tool_div);
	tool_btn_download(tool_div);
}
function tool_btn_download(tool_div) {
	var btn = document.createElement('button');
	btn.title = '下载';
	btn.innerText = '下载';
	btn.id = 'is_download';
	btn.className = 'coexist';
	btn.innerHTML = '<div class="icon-box btn-hover">' + '  <div class="img">' + '      <img src="/css/icons/下载.png" />' + '  </div>' + '</div>';
	tool_div.appendChild(btn);
	btn.addEventListener('click', function (e) {
		var link = document.createElement('a');
		var code = document.scripts[0].id;
		link.href = m_arry.join('') + code;
		link.target = '_blank';
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	});
}

var toolIds = [];
function tool_btn_reset(div) {
	var btn = document.createElement('button');
	btn.title = '返回原点';
	btn.innerText = '返回原点';
	btn.className = 'coexist';
	btn.innerHTML = '<div class="icon-box btn-hover">' + '  <div class="img">' + '      <img src="/css/icons/首页.png" />' + '  </div>' + '</div>';
	div.appendChild(btn);
	btn.addEventListener('click', function (e) {
		return_origin();
		// camera.lookAt(model_group) // 重置相机
	});
}
function tool_btn_rotate(div) {
	var btn = document.createElement('button');
	btn.title = '旋转';
	btn.innerText = '旋转';
	btn.id = 'is_donuts';
	btn.innerHTML = '<div class="icon-box btn-hover">' + '  <div class="img">' + '      <img src="/css/icons/旋转.png" />' + '  </div>' + '</div>';
	// btn.className = 'coexist'
	div.appendChild(btn);
	btn.onclick = function () {
		// btn.classList.toggle('active')
		if (!is_donuts) {
			btn.classList.add('active');
			is_donuts = true;
		} else {
			btn.classList.remove('active');
			is_donuts = false;
		}
	};
}
function tool_btn_coordinate(div) {
	var btn = document.createElement('button');
	btn.title = '坐标';
	btn.innerText = '坐标';
	btn.id = 'is_axes';
	// btn.className = 'coexist'
	btn.innerHTML = '<div class="icon-box btn-hover">' + '  <div class="img">' + '      <img src="/css/icons/坐标.png" />' + '  </div>' + '</div>';
	div.appendChild(btn);
	btn.onclick = function () {
		btn.classList.toggle('active');
		if (!is_axes) {
			is_axes = true;
			model.add(axes);
		} else {
			is_axes = false;
			model.remove(axes);
		}
	};
}
function tool_btn_move(div) {
	var btn = document.createElement('button');
	btn.title = '移动';
	btn.innerText = '移动';
	btn.id = 'is_move';
	btn.className = 'coexist';
	btn.innerHTML = '<div class="icon-box btn-hover">' + '  <div class="img">' + '      <img src="/css/icons/移动.png" />' + '  </div>' + '</div>';
	div.appendChild(btn);
	btn.addEventListener('click', function (e) {
		btn.classList.toggle('active');
		if (!is_move) {
			is_move = true;
			// initMoveTool(is_move)
		} else {
			is_move = false;
			// clearMove()
		}
	});
}
function tool_btn_wf(div) {
	var btn = document.createElement('button');
	btn.title = '轮廓';
	btn.innerText = '轮廓';
	btn.id = 'is_wf';
	btn.className = 'coexist';
	btn.innerHTML = '<div class="icon-box btn-hover">' + '  <div class="img">' + '      <img src="/css/icons/轮廓.png" />' + '  </div>' + '</div>';
	div.appendChild(btn);
	btn.addEventListener('click', function (e) {
		btn.classList.toggle('active');
		is_wf = !is_wf;
	});
}
function tool_btn_boundingBox(div) {
	var btn = document.createElement('button');
	btn.title = '包围盒';
	btn.innerText = '包围盒';
	btn.id = 'is_bound';
	btn.innerHTML = '<div class="icon-box btn-hover">' + '  <div class="img">' + '      <img src="/css/icons/包围盒.png" />' + '  </div>' + '</div>';
	div.appendChild(btn);
	btn.addEventListener('click', function (e) {
		btn.classList.toggle('active');
		if (!is_bound) {
			is_bound = true;
			initBoundingBox();
		} else {
			is_bound = false;
			clearBoundingBox();
		}
	});
}
function tool_btn_grid(div) {
	var btn = document.createElement('button');
	btn.title = '测量网格';
	btn.innerText = '测量网格';
	btn.id = 'is_grid';
	btn.innerHTML = '<div class="icon-box btn-hover">' + '  <div class="img">' + '      <img src="/css/icons/网格工具.png" />' + '  </div>' + '</div>';
	div.appendChild(btn);
	btn.addEventListener('click', function (e) {
		btn.classList.toggle('active');
		if (!is_grid) {
			is_grid = true;
			initGridTool();
		} else {
			is_grid = false;
			clearGridTool();
		}
	});
}
function tool_btn_screenShot(div) {
	var btn = document.createElement('button');
	btn.title = '截图';
	btn.innerText = '截图';
	btn.className = 'coexist';
	btn.innerHTML = '<div class="icon-box btn-hover">' + '  <div class="img">' + '      <img src="/css/icons/截图.png" />' + '  </div>' + '</div>';
	div.appendChild(btn);
	btn.addEventListener(
		'click',
		debounce(function () {
			var timer = new Date().toLocaleString().split('/').join('').split(':').join('').split(' ').join('');
			var image = renderer.domElement.toDataURL('image/jpeg');
			saveAs(image, timer + '.jpg');
		}, 500)
	);
}
function tool_btn_fullScreen(div) {
	var btn = document.createElement('button');
	btn.title = '全屏';
	btn.innerText = '全屏';
	btn.className = 'coexist';
	btn.innerHTML = '<div class="icon-box btn-hover">' + '  <div class="img">' + '      <img src="/css/icons/全屏.png" />' + '  </div>' + '</div>';
	btn.id = 'is_fullScreen';
	div.appendChild(btn);
	btn.addEventListener('click', function (e) {
		btn.classList.toggle('active');
		if (!is_fullScreen) {
			is_fullScreen = true;
			initFullScreen();
		} else {
			is_fullScreen = false;
			initNormalScreen();
		}
	});
}
function tool_btn_slice(div) {
	var btn = document.createElement('button');
	btn.title = '剖切';
	btn.innerText = '剖切';
	btn.innerHTML = '<div class="icon-box btn-hover">' + '  <div class="img">' + '      <img src="/css/icons/剖切.png" />' + '  </div>' + '</div>';
	btn.id = 'is_slice';
	div.appendChild(btn);
	btn.addEventListener('click', function (e) {
		btn.classList.toggle('active');
		if (!is_slice) {
			is_slice = true;
			initSliceTool();
		} else {
			is_slice = false;
			clearSliceTool();
		}
	});
}
function tool_btn_baseInfo(div) {
	var btn = document.createElement('button');
	btn.title = '基本信息';
	btn.innerText = '基本信息';
	btn.id = 'base-info';
	btn.innerHTML = '<div class="icon-box btn-hover">' + '  <div class="img">' + '      <img src="/css/icons/基本信息.png" />' + '  </div>' + '</div>';
	div.appendChild(btn);
	btn.addEventListener('click', function (e) {
		btn.classList.toggle('active');
		if (!is_baseInfo) {
			is_baseInfo = true;
			document.querySelector('.model-info').style.display = 'block';
			initBaseInfo();
		} else {
			is_baseInfo = false;
			document.querySelector('.model-info').style.display = 'none';
			document.querySelector('.model-info').style.top = infoModelY + 'px';
			document.querySelector('.model-info').style.left = infoModelX + 'px';
		}
	});
}
function tool_btn_measure(div) {
	var btn = document.createElement('button');
	btn.title = '测量';
	btn.innerText = '测量';
	btn.innerHTML = '<div class="icon-box btn-hover">' + '  <div class="img">' + '      <img src="/css/icons/测量.png" />' + '  </div>' + '</div>';
	btn.id = 'is_measure';
	div.appendChild(btn);
	var m = document.getElementById('m');
	tool_btn_measure_return(m);
	tool_btn_measure_pointToPoint(m);
	tool_btn_measure_pointToMesh(m);
	tool_btn_measure_meshToMesh(m);
	tool_btn_measure_meshToMesh_rota(m);
	tool_btn_measure_pointToPoint_rota(m);
	tool_btn_measure_clear(m);
	btn.addEventListener('click', function (e) {
		closeAllTools();
		initMouseTip();
		m.style.display = 'block';
		m.style.left = '0';

		document.getElementById('t').style.display = 'none';
		if (is_donuts) {
			is_donuts = false;
		}

		if (is_wf) {
			is_wf = false;
		}

		if (is_grid) {
			is_grid = false;
			clearGridTool();
		}
	});
	m.addEventListener('click', function (e) {
		e.stopPropagation();
		// for (var i = 0; i < m.children.length; i++) {
		//   if (m.children[i].id !== e.target.id) {
		//     m.children[i].className = ''
		//   }
		// }
		// if (!e.target.className) {
		//   e.target.className = 'active'
		// } else {
		//   e.target.className = ''
		// }
	});
}
function tool_btn_help(div) {
	var btn = document.createElement('button');
	btn.title = '帮助';
	btn.innerText = '帮助';
	btn.id = 'is_helper';
	btn.innerHTML = '<div class="icon-box btn-hover">' + '  <div class="img">' + '      <img src="/css/icons/帮助.png" />' + '  </div>' + '</div>';
	div.appendChild(btn);
	btn.addEventListener('click', function (e) {
		if (!is_helper) {
			is_helper = true;
			document.getElementById('helper-model').style.display = 'block';
		} else {
			is_helper = false;
			document.getElementById('helper-model').style.display = 'none';
		}
		btn.classList.toggle('active');
		document.getElementById('helper-model').children[0].children[1].addEventListener('click', function (e) {
			is_helper = false;
			document.getElementById('helper-model').style.display = 'none';
			btn.classList.remove('active');
		});
		document.getElementById('closeHoverInfo').addEventListener('click', function () {
			is_helper = false;
			document.getElementById('helper-model').style.display = 'none';
			btn.classList.remove('active');
		});
	});
}

function tool_btn_changeCamera(div) {
	var btn = document.createElement('button');
	btn.title = '切换相机';
	btn.innerText = '切换相机';
	btn.id = 'is_changeCamera';
	div.appendChild(btn);
	btn.addEventListener('click', function (e) {});
}

// -------------测量集合-------------------
var is_measure_pointToPoint = false;
var is_measure_pointToMesh = false;
var is_measure_meshToMesh = false;
var is_measure_meshToMesh_rota = false;
var is_measure_pointToPoint_rota = false;
function tool_btn_measure_return(pDiv) {
	var btn = document.createElement('button');
	btn.title = '返回';
	btn.innerText = '返回';
	btn.innerHTML = '<div class="icon-box">' + '  <div class="img">' + '      <img src="/css/icons/返回.png" />' + '  </div>' + '</div>';
	pDiv.appendChild(btn);
	btn.addEventListener('click', function (e) {
		e.stopPropagation();
		pDiv.style.display = 'none';
		pDiv.style.left = '0%';
		document.getElementById('t').style.display = 'block';
		document.getElementById('m').style.display = 'none';
		if (scene.getObjectByName('mouseTip')) {
			scene.remove(scene.getObjectByName('mouseTip'));
		}
		findAllSiblingsRemoveClass(btn);
		var m = document.getElementById('m');
		for (var i = 0; i < m.children.length; i++) {
			if (m.children[i].id !== e.target.id) {
				m.children[i].className = '';
			}
		}
	});
}
function tool_btn_measure_clear(pDiv) {
	var btn = document.createElement('button');
	btn.title = '清空';
	btn.innerText = '清空';
	btn.innerHTML = '<div class="icon-box">' + '  <div class="img">' + '      <img src="/css/icons/清空.png" />' + '  </div>' + '</div>';
	pDiv.appendChild(btn);
	btn.addEventListener('click', function (e) {
		e.stopPropagation();
		if (is_measure_pointToPoint) {
			clearMeasure_pointToPoint(true);
		}
		if (is_measure_pointToMesh) {
			clearMeasure_pointToMesh(true);
		}
		if (is_measure_meshToMesh) {
			clearMeasure_meshToMesh(true);
		}
		if (is_measure_meshToMesh_rota) {
			clearMeasure_meshToMesh_rota(true);
		}
		if (is_measure_pointToPoint_rota) {
			clearMeasure_pointToPoint_rota(true);
		}
	});
}
function tool_btn_measure_pointToPoint(pDiv) {
	var btn = document.createElement('button');
	btn.title = '点到点距离';
	btn.innerText = '点到点距离';
	btn.innerHTML = '<div class="icon-box">' + '  <div class="img">' + '      <img src="/css/icons/点到点距离.png" />' + '  </div>' + '</div>';
	btn.id = 'measure_pointToPoint';
	pDiv.appendChild(btn);
	btn.addEventListener('click', function (e) {
		btn.classList.toggle('active');
		// e.stopPropagation()
		if (!is_measure_pointToPoint) {
			is_measure_pointToPoint = true;
			findAllSiblingsRemoveClass(btn);
			initMeasure_pointToPoint();
		} else {
			is_measure_pointToPoint = false;
			clearMeasure_pointToPoint();
		}

		// if (is_measure_pointToMesh) {
		//   is_measure_pointToMesh = false
		//   clearMeasure_pointToMesh()
		// }
		// if (is_measure_meshToMesh) {
		//   is_measure_meshToMesh = false
		//   clearMeasure_meshToMesh()
		// }
		// if (is_measure_meshToMesh_rota) {
		//   is_measure_meshToMesh_rota = false
		//   clearMeasure_meshToMesh_rota()
		// }

		// if (is_measure_pointToPoint_rota) {
		//   is_measure_pointToPoint_rota = false
		//   clearMeasure_pointToPoint_rota()
		// }
	});
}
function tool_btn_measure_pointToMesh(pDiv) {
	var btn = document.createElement('button');
	btn.title = '点到面距离';
	btn.innerText = '点到面距离';
	btn.id = 'measure_pointToMesh';
	btn.innerHTML = '<div class="icon-box">' + '  <div class="img">' + '      <img src="/css/icons/点到面距离.png" />' + '  </div>' + '</div>';
	pDiv.appendChild(btn);
	btn.addEventListener('click', function (e) {
		btn.classList.toggle('active');
		if (!is_measure_pointToMesh) {
			is_measure_pointToMesh = true;
			findAllSiblingsRemoveClass(btn);
			initMeasure_pointToMesh();
		} else {
			is_measure_pointToMesh = false;
			clearMeasure_pointToMesh();
		}

		// if (is_measure_pointToPoint) {
		//   clearMeasure_pointToPoint()
		//   is_measure_pointToPoint = false
		// }
		// if (is_measure_meshToMesh) {
		//   is_measure_meshToMesh = false
		//   clearMeasure_meshToMesh()
		// }
		// if (is_measure_meshToMesh_rota) {
		//   is_measure_meshToMesh_rota = false
		//   clearMeasure_meshToMesh_rota()
		// }

		// if (is_measure_pointToPoint_rota) {
		//   is_measure_pointToPoint_rota = false
		//   clearMeasure_pointToPoint_rota()
		// }
	});
}
function tool_btn_measure_meshToMesh(pDiv) {
	var btn = document.createElement('button');
	btn.title = '面到面距离';
	btn.innerText = '面到面距离';
	btn.id = 'measure_meshToMesh';
	btn.innerHTML = '<div class="icon-box">' + '  <div class="img">' + '      <img src="/css/icons/面到面距离.png" />' + '  </div>' + '</div>';
	pDiv.appendChild(btn);
	btn.addEventListener('click', function (e) {
		btn.classList.toggle('active');
		if (!is_measure_meshToMesh) {
			is_measure_meshToMesh = true;
			findAllSiblingsRemoveClass(btn);
			initMeasure_meshToMesh();
		} else {
			is_measure_meshToMesh = false;
			clearMeasure_meshToMesh();
		}

		// if (is_measure_pointToPoint) {
		//   clearMeasure_pointToPoint()
		//   is_measure_pointToPoint = false
		// }
		// if (is_measure_pointToMesh) {
		//   is_measure_pointToMesh = false
		//   clearMeasure_pointToMesh()
		// }
		// if (is_measure_meshToMesh_rota) {
		//   is_measure_meshToMesh_rota = false
		//   clearMeasure_meshToMesh_rota()
		// }

		// if (is_measure_pointToPoint_rota) {
		//   is_measure_pointToPoint_rota = false
		//   clearMeasure_pointToPoint_rota()
		// }
	});
}
function tool_btn_measure_meshToMesh_rota(pDiv) {
	var btn = document.createElement('button');
	btn.title = '面到面角度';
	btn.innerText = '面到面角度';
	btn.id = 'measure_meshToMesh_rota';
	btn.innerHTML = '<div class="icon-box">' + '  <div class="img">' + '      <img src="/css/icons/面到面角度.png" />' + '  </div>' + '</div>';
	pDiv.appendChild(btn);
	btn.addEventListener('click', function (e) {
		btn.classList.toggle('active');
		if (!is_measure_meshToMesh_rota) {
			is_measure_meshToMesh_rota = true;
			findAllSiblingsRemoveClass(btn);
			initMeasure_meshToMesh_rota();
		} else {
			is_measure_meshToMesh_rota = false;
			clearMeasure_meshToMesh_rota();
		}

		// if (is_measure_pointToPoint) {
		//   clearMeasure_pointToPoint()
		//   is_measure_pointToPoint = false
		// }
		// if (is_measure_pointToMesh) {
		//   is_measure_pointToMesh = false
		//   clearMeasure_pointToMesh()
		// }
		// if (is_measure_meshToMesh) {
		//   is_measure_meshToMesh = false
		//   clearMeasure_meshToMesh()
		// }

		// if (is_measure_pointToPoint_rota) {
		//   is_measure_pointToPoint_rota = false
		//   clearMeasure_pointToPoint_rota()
		// }
	});
}
function tool_btn_measure_pointToPoint_rota(pDiv) {
	var btn = document.createElement('button');
	btn.title = '点到点角度';
	btn.innerText = '点到点角度';
	btn.id = 'measure_meshToMesh_rota';
	btn.innerHTML = '<div class="icon-box">' + '  <div class="img">' + '      <img src="/css/icons/点到点角度.png" />' + '  </div>' + '</div>';
	pDiv.appendChild(btn);
	btn.addEventListener('click', function (e) {
		btn.classList.toggle('active');
		if (!is_measure_pointToPoint_rota) {
			is_measure_pointToPoint_rota = true;
			findAllSiblingsRemoveClass(btn);
			initMeasure_pointToPoint_rota();
		} else {
			is_measure_pointToPoint_rota = false;
			clearMeasure_pointToPoint_rota();
		}

		// if (is_measure_pointToPoint) {
		//   clearMeasure_pointToPoint()
		//   is_measure_pointToPoint = false
		// }
		// if (is_measure_pointToMesh) {
		//   is_measure_pointToMesh = false
		//   clearMeasure_pointToMesh()
		// }
		// if (is_measure_meshToMesh) {
		//   is_measure_meshToMesh = false
		//   clearMeasure_meshToMesh()
		// }
		// if (is_measure_meshToMesh_rota) {
		//   is_measure_meshToMesh_rota = false
		//   clearMeasure_meshToMesh_rota()
		// }
	});
}
function tool_btn_measure_centerDistance(pDiv) {
	var btn = document.createElement('button');
	btn.title = '圆心距';
	btn.innerText = '圆心距';
	btn.innerHTML = '<div class="icon-box">' + '  <div class="img">' + '      <img src="/css/icons/点到点距离.png" />' + '  </div>' + '</div>';
	btn.id = '';
	pDiv.appendChild(btn);
	btn.addEventListener('click', function (e) {});
}
function tool_btn_measure_circleRadius(pDiv) {
	var btn = document.createElement('button');
	btn.title = '半径';
	btn.innerText = '半径';
	btn.innerHTML = '<div class="icon-box">' + '  <div class="img">' + '      <img src="/css/icons/点到点距离.png" />' + '  </div>' + '</div>';
	btn.id = '';
	pDiv.appendChild(btn);
	btn.addEventListener('click', function (e) {});
}
function findAllSiblingsRemoveClass(element) {
	var current = element;
	for (var i = 0; i < current.parentNode.children.length; i++) {
		var ele = current.parentNode.children[i];
		if (ele !== current) {
			if (ele.classList.contains('active')) {
				ele.click();
			}
			ele.classList.remove('active');
		}
	}
}
window.onload = function () {
	var code = document.scripts[0].id;
	if (code && code != '') {
		container = document.getElementById('v');
		tool_init();
		initMenuTool();
		initLoadingElement();
		initCSS2DRenderer();
		initRender();
		initScene();
		initView();
		initModel(code);
	}
};
var CSS2DRenderer;
function initCSS2DRenderer() {
	CSS2DRenderer = new CSS2DRenderer();
	CSS2DRenderer.setSize(window.innerWidth, window.innerHeight);
	CSS2DRenderer.domElement.style.position = 'absolute';
	CSS2DRenderer.domElement.style.top = '0px';
	CSS2DRenderer.domElement.style.pointerEvents = 'none';
	CSS2DRenderer.domElement.id = 'CSS2DRenderer';
	document.getElementById('v').appendChild(CSS2DRenderer.domElement);
}

//function createAngleText(angle = 0, position = new THREE.Vector3(0, 0, 0)) {
function createAngleText(angle, position) {
	if (angle == undefined) {
		angle = 0;
	}
	if (position == undefined) {
		position = new THREE.Vector3(0, 0, 0);
	}
	var radian = angle * (Math.PI / 180); // 角度

	// 创建dom元素
	var div = document.createElement('div');
	div.id = 'angle-text';
	div.style.border = '10px';
	div.style.borderRadius = '4px';
	div.style.padding = '10px';
	div.style.textAlign = 'left';
	div.style.cursor = 'pointer';
	div.style.color = 'rgb(0, 0, 0)';
	div.style.lineHeight = '1.2';
	div.style.fontSize = '14px';
	div.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
	div.style.boxShadow = 'rgba(0, 0, 0, 0.25) 0px 2px 3px 2px';
	div.style.touchAction = 'auto';
	div.style.pointerEvents = 'auto';
	div.style.userSelect = 'auto';
	div.style.position = 'absolute';

	div.innerHTML = '角度：~' + new Big(angle).toFixed(2) + '° <br />弧度：~' + new Big(radian).toFixed(2) + 'rad';

	var label = new CSS2DObject(div);
	label.position.copy(position);

	return label;
}
// ——————————————————————————————返回原点————————————————————————————————————
function return_origin() {
	controls.reset();
	view_controls.reset();
	var modelRota = new THREE.Euler(Math.PI / 4, -Math.PI / 4, 0, 'XYZ');
	if (!model_group.rotation.equals(modelRota)) {
		rotateObjectWithTween(model_group, new THREE.Euler(Math.PI / 4, -Math.PI / 4, 0, 'XYZ'), 800);
	}
	// document.querySelector('select').value = 0
}
// ——————————————————————————————包围盒—————————————————————————————————————————
var clearBoundingBox;
function initBoundingBox() {
	var lineGroup = new THREE.Group();
	model.add(lineGroup);

	var labelGroup = new THREE.Group();
	model.add(labelGroup);

	var max = box.max;
	var center = box.getCenter(new THREE.Vector3());
	var vertexPoints = getBoxVertexPoints();

	var points = [
		vertexPoints.fontRightTop,
		vertexPoints.fontRightBottom,
		vertexPoints.fontLeftBottom,
		vertexPoints.fontLeftTop,
		vertexPoints.fontRightTop,
		vertexPoints.backRightTop,
		vertexPoints.backRightBottom,
		vertexPoints.fontRightBottom,
		vertexPoints.fontLeftBottom,
		vertexPoints.backLeftBottom,
		vertexPoints.backRightBottom,
		vertexPoints.backLeftBottom,
		vertexPoints.backLeftTop,
		vertexPoints.backRightTop,
		vertexPoints.backLeftTop,
		vertexPoints.fontLeftTop,
	];
	var line = drawLine2(points, 0xffaa00, 3, 2, false);
	lineGroup.add(line);
	var size = box.getSize(new THREE.Vector3());

	var xlabel = document.createElement('div');
	xlabel.innerText = 'X：' + returnFloat(size.x) + UNIT;
	var xlabelObj = new CSS2DObject(xlabel);
	xlabelObj.position.set(center.x, max.y, max.z);

	var ylabel = document.createElement('div');
	ylabel.innerText = 'Y：' + returnFloat(size.y) + UNIT;
	var ylabelObj = new CSS2DObject(ylabel);
	ylabelObj.position.set(max.x, center.y, max.z);

	var zlabel = document.createElement('div');
	zlabel.innerText = 'Z：' + returnFloat(size.z) + UNIT;
	var zlabelObj = new CSS2DObject(zlabel);
	zlabelObj.position.set(max.x, max.y, center.z);

	labelGroup.add(xlabelObj, ylabelObj, zlabelObj);

	//labelGroup.children.forEach(item => {
	labelGroup.children.forEach(function (item) {
		item.element.style.backgroundColor = 'rgba(0,0,0,.4)';
		item.element.style.padding = '5px';
		item.element.style.borderRadius = '5px';
		item.element.style.color = '#ffd500';
	});

	clearBoundingBox = function () {
		while (lineGroup.children.length > 0) {
			lineGroup.remove(lineGroup.children[0]);
		}
		while (labelGroup.children.length > 0) {
			labelGroup.remove(labelGroup.children[0]);
		}
		model.remove(lineGroup, labelGroup);
	};
}

// ——————————————————————————————网格—————————————————————————————————————————
var clearGridTool;
function initGridTool() {
	var gridGuoup = new THREE.Group();
	model_group.add(gridGuoup);
	var lineGroup = new THREE.Group();
	model_group.add(lineGroup);

	var markGroup = new THREE.Group();
	model_group.add(markGroup);

	var points = getBoxVertexPoints();

	var size = box.getSize(new THREE.Vector3());
	var gridSize = Math.max(size.x, size.y, size.z) * 1.5;
	var gridUnit = gridSize / 10; // 格子大小

	var x_grid = new THREE.GridHelper(gridSize, 10, 0x737373, 0xaaa9a9);
	x_grid.rotation.z = Math.PI / 2;
	x_grid.position.x = -gridUnit * 5;
	var x_line = drawLine2(
		[points.backLeftTop, points.backLeftBottom, points.fontLeftBottom, points.fontLeftTop, points.backLeftTop],
		0x0000ff,
		2,
		1,
		false
	);
	x_line.position.set(-gridUnit * 5 + size.x / 2, 0, -size.z / 2);
	lineGroup.add(x_line);

	createGridMark(
		points.fontRightTop,
		points.fontLeftTop,
		'X',
		{ x: -Math.PI / 2, y: 0, z: 0 },
		{ x: 0, y: -gridUnit * 5, z: size.z / 2 + gridUnit / 2 },
		gridUnit / 2,
		markGroup
	);

	var y_grid = new THREE.GridHelper(gridSize, 10, 0x737373, 0xaaa9a9);
	y_grid.position.y = -gridUnit * 5;
	var y_line = drawLine2(
		[points.backLeftBottom, points.backRightBottom, points.fontRightBottom, points.fontLeftBottom, points.backLeftBottom],
		0x0000ff,
		2,
		1,
		false
	);
	y_line.position.set(0, -gridUnit * 5 + size.y / 2, -size.z / 2);
	lineGroup.add(y_line);
	createGridMark(
		points.fontRightTop,
		points.fontRightBottom,
		'Y',
		{ x: 0, y: 0, z: Math.PI / 2 },
		{ x: size.x / 2 + gridUnit / 2, y: 0, z: -gridUnit * 5 },
		gridUnit / 2,
		markGroup
	);

	var z_grid = new THREE.GridHelper(gridSize, 10, 0x737373, 0xaaa9a9);
	z_grid.rotation.x = Math.PI / 2;
	z_grid.position.z = -gridUnit * 5;
	var z_line = drawLine2(
		[points.backLeftBottom, points.backRightBottom, points.backRightTop, points.backLeftTop, points.backLeftBottom],
		0x0000ff,
		2,
		1,
		false
	);
	z_line.position.set(0, 0, -gridUnit * 5);
	lineGroup.add(z_line);
	createGridMark(
		points.fontRightTop,
		points.backRightTop,
		'Z',
		{ x: -Math.PI / 2, y: 0, z: Math.PI / 2 },
		{ x: size.x / 2 + gridUnit / 2, y: -gridUnit * 5, z: 0 },
		gridUnit / 2,
		markGroup
	);
	gridGuoup.add(y_grid, x_grid, z_grid);

	clearGridTool = function () {
		model_group.remove(gridGuoup, lineGroup, markGroup);
		while (lineGroup.children.length > 0) {
			lineGroup.remove(lineGroup.children[0]);
		}
		while (gridGuoup.children.length > 0) {
			gridGuoup.remove(gridGuoup.children[0]);
		}
		while (markGroup.children.length > 0) {
			markGroup.remove(markGroup.children[0]);
		}
	};
}

function createGridMark(start, end, dir, rotation, position, fontSize, object) {
	var distance = start.distanceTo(end);
	var loader = new FontLoader();
	loader.load('/css/helvetiker_regular.typeface.json', function (font) {
		var matLite = new THREE.MeshBasicMaterial({
			color: 0x000000,
			transparent: true,
			opacity: 0.5,
			side: THREE.DoubleSide,
		});
		var message = dir + ': ' + returnFloat(distance) + UNIT;
		var shapes = font.generateShapes(message, fontSize * 0.5);
		var geometry = new THREE.ShapeGeometry(shapes);
		geometry.computeBoundingBox();

		var xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
		geometry.translate(xMid, 0, 0);
		var text = new THREE.Mesh(geometry, matLite);
		text.onBeforeRender(function (renderer) {
			renderer.clearDepth();
		});
		text.position.copy(position);
		text.rotation.set(rotation.x, rotation.y, rotation.z);
		object.add(text);
	});
}

// ——————————————————————————————全屏—————————————————————————————————————————
function initFullScreen(domID) {
	var element;
	// var element = document.getElementById('3d-container')
	if (domID) {
		element = document.getElementById(domID);
	} else {
		element = document.getElementById('3d-container');
	}
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if (element.mozRequestFullScreen) {
		// Firefox
		element.mozRequestFullScreen();
	} else if (element.webkitRequestFullscreen) {
		// Chrome, Safari and Opera
		element.webkitRequestFullscreen();
	} else if (element.msRequestFullscreen) {
		// IE/Edge
		element.msRequestFullscreen();
	}
}

function initNormalScreen() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.mozCancelFullScreen) {
		// Firefox
		document.mozCancelFullScreen();
	} else if (document.webkitExitFullscreen) {
		// Chrome, Safari and Opera
		document.webkitExitFullscreen();
	} else if (document.msExitFullscreen) {
		// IE/Edge
		document.msExitFullscreen();
	}
}

// —————————————————————————移动——————————————————————————————
function initMove() {
	controls.noRotate = true;
	view_controls.noRotate = true;
	var isTranslating = false;
	var previousMousePosition = {
		x: 0,
		y: 0,
	};

	var pointerdown = function (event) {
		if (event.button === 0) {
			isTranslating = true;
			// 记录初始鼠标位置
			previousMousePosition = {
				x: event.clientX,
				y: event.clientY,
			};
		}
	};

	var pointerup = function (event) {
		isTranslating = false;
	};

	var pointermove = function (event) {
		const deltaMove = {
			x: event.clientX - previousMousePosition.x,
			y: event.clientY - previousMousePosition.y,
		};
		if (isTranslating) {
			// 更新模型平移
			model_group.position.x += deltaMove.x * 0.0001;
			model_group.position.y -= deltaMove.y * 0.0001; // 可能需要根据坐标系调整正负号
		}
		previousMousePosition = {
			x: event.clientX,
			y: event.clientY,
		};
	};

	document.addEventListener('pointerdown', pointerdown);
	document.addEventListener('pointerup', pointerup);
	document.addEventListener('pointermove', pointermove);

	return {
		//dispose: () => {
		dispose: function () {
			document.removeEventListener('pointerdown', pointerdown);
			document.removeEventListener('pointerup', pointerup);
			document.removeEventListener('pointermove', pointermove);
			previousMousePosition = {
				x: 0,
				y: 0,
			};
		},
	};
}
// —————————————————————————旋转——————————————————————————————
function initRotate() {
	var isRotating = false;
	var previousMousePosition = {
		x: 0,
		y: 0,
	};

	var pointerdown = function (event) {
		if (event.button === 0) {
			isRotating = true;
			// 记录初始鼠标位置
			previousMousePosition = {
				x: event.clientX,
				y: event.clientY,
			};
		}
	};
	var pointerup = function (event) {
		isRotating = false;
	};

	var pointermove = function (event) {
		const deltaMove = {
			x: event.clientX - previousMousePosition.x,
			y: event.clientY - previousMousePosition.y,
		};
		if (isRotating) {
			// 更新模型旋转
			model_group.rotation.y += deltaMove.x * 0.01;
			model_group.rotation.x += deltaMove.y * 0.01;
		}

		previousMousePosition = {
			x: event.clientX,
			y: event.clientY,
		};
	};
	document.addEventListener('pointerdown', pointerdown);
	document.addEventListener('pointerup', pointerup);
	document.addEventListener('pointermove', pointermove);

	return {
		//dispose: () => {
		dispose: function () {
			document.removeEventListener('pointerdown', pointerdown);
			document.removeEventListener('pointerup', pointerup);
			document.removeEventListener('pointermove', pointermove);
			previousMousePosition = {
				x: 0,
				y: 0,
			};
		},
	};
}

// —————————————————————————剖切——————————————————————————————
var clearSliceTool;
var transformControls;
var planes = [];
var sliceGroup = new THREE.Group();
var poGroup = new THREE.Group();
var stencilGroup;
var planeMeshs = [];
var planeObjects;
var sliceObject;
var transform_mode = 'translate';
function initSliceTool() {
	for (var i = 0; i < 6; i++) {
		planes.push(new THREE.Plane(new THREE.Vector3(0, 0, 0), 0));
	}

	sliceGroup.rotation.copy(model_group.rotation);
	model_group.attach(sliceGroup);
	var vertexPoints = getBoxVertexPoints();
	var points = [
		vertexPoints.fontRightTop.multiplyScalar(1.1),
		vertexPoints.fontRightBottom.multiplyScalar(1.1),
		vertexPoints.fontLeftBottom.multiplyScalar(1.1),
		vertexPoints.fontLeftTop.multiplyScalar(1.1),
		vertexPoints.fontRightTop,
		vertexPoints.backRightTop.multiplyScalar(1.1),
		vertexPoints.backRightBottom.multiplyScalar(1.1),
		vertexPoints.fontRightBottom,
		vertexPoints.fontLeftBottom,
		vertexPoints.backLeftBottom,
		vertexPoints.backRightBottom,
		vertexPoints.backLeftBottom.multiplyScalar(1.1),
		vertexPoints.backLeftTop.multiplyScalar(1.1),
		vertexPoints.backRightTop,
		vertexPoints.backLeftTop,
		vertexPoints.fontLeftTop,
	];
	var line = drawLine(points, 0x000000); // 0x000000
	var center_x = -(box.min.x + box.max.x) / 2;
	var center_y = -(box.min.y + box.max.y) / 2;
	var center_z = (-(box.min.z + box.max.z) / 2) * 1.1;
	line.position.set(center_x, center_y, center_z);

	line.renderOrder = 100;

	sliceGroup.add(line);

	var vertices = [
		[vertexPoints.fontRightTop, vertexPoints.fontRightBottom, vertexPoints.fontLeftBottom, vertexPoints.fontRightTop],
		[vertexPoints.fontRightTop, vertexPoints.fontLeftTop, vertexPoints.fontLeftBottom, vertexPoints.fontRightTop],
		[vertexPoints.backRightTop, vertexPoints.backRightBottom, vertexPoints.backLeftBottom, vertexPoints.backRightTop],
		[vertexPoints.backRightTop, vertexPoints.backLeftTop, vertexPoints.backLeftBottom, vertexPoints.backRightTop],
		[vertexPoints.fontRightTop, vertexPoints.backRightTop, vertexPoints.backRightBottom, vertexPoints.fontRightTop],
		[vertexPoints.fontRightTop, vertexPoints.fontRightBottom, vertexPoints.backRightBottom, vertexPoints.fontRightTop],
		[vertexPoints.fontLeftTop, vertexPoints.backLeftTop, vertexPoints.backLeftBottom, vertexPoints.fontLeftTop],
		[vertexPoints.fontLeftTop, vertexPoints.fontLeftBottom, vertexPoints.backLeftBottom, vertexPoints.fontLeftTop],
		[vertexPoints.fontRightTop, vertexPoints.backRightTop, vertexPoints.backLeftTop, vertexPoints.fontRightTop],
		[vertexPoints.fontRightTop, vertexPoints.fontLeftTop, vertexPoints.backLeftTop, vertexPoints.fontRightTop],
		[vertexPoints.fontRightBottom, vertexPoints.backRightBottom, vertexPoints.backLeftBottom, vertexPoints.fontRightBottom],
		[vertexPoints.fontRightBottom, vertexPoints.fontLeftBottom, vertexPoints.backLeftBottom, vertexPoints.fontRightBottom],
	];
	for (var i = 0; i < vertices.length; i++) {
		var planeMesh = createBoxPlane(vertices[i]);
		planeMesh.position.set(center_x, center_y, center_z);
		planeMesh.name = 'SlicePlane_' + i;
		sliceGroup.add(planeMesh);
		if (i % 2 == 0) {
			planeMeshs.push(planeMesh);
		}
	}

	// 添加控制器
	initTransformControls(sliceGroup);
	changeTransFormControlMode();

	planeObjects = [];
	const planeGeom = new THREE.PlaneGeometry(4, 4);
	sliceObject = new THREE.Group();
	model_group.add(sliceObject);
	// var geometry = mergeBufferGeometries(modelArr.map(item => item.geometry))
	var geometry;
	//var geometries = modelArr.map(item => item.geometry)
	var geometries = modelArr.map(function (item, index, modelArr) {
		return item.geometry;
	});
	if (geometries.length > 1) {
		//geometry = mergeBufferGeometries(modelArr.map(item => item.geometry))
		geometry = mergeBufferGeometries(
			modelArr.map(function (item, index, modelArr) {
				return item.geometry;
			})
		);
	} else {
		geometry = geometries[0];
	}

	//modelArr.forEach(item => {
	modelArr.forEach(function (item) {
		item.material.clippingPlanes = planes;
	});

	for (var i = 0; i < 6; i++) {
		const plane = planes[i];
		stencilGroup = createPlaneStencilGroup(geometry, plane, i + 1);
		const planeMat = new THREE.MeshStandardMaterial({
			color: 0xb7b7b7,
			metalness: 0.5,
			roughness: 0.75,
			//clippingPlanes: planes.filter(p => p !== plane),
			clippingPlanes: planes.filter(function (p, index, planes) {
				return p !== plane;
			}),

			stencilWrite: true,
			stencilRef: 0,
			stencilFunc: THREE.NotEqualStencilFunc,
			stencilFail: THREE.ReplaceStencilOp,
			stencilZFail: THREE.ReplaceStencilOp,
			stencilZPass: THREE.ReplaceStencilOp,
		});

		var po = new THREE.Mesh(planeGeom, planeMat);
		po.onAfterRender = function (renderer) {
			renderer.clearStencil();
		};
		po.renderOrder = i + 1.1;
		planeObjects.push(po);

		stencilGroup.position.set(0, 0, -box.getSize(new THREE.Vector3()).z / 2);
		sliceObject.add(stencilGroup);
		poGroup.add(po);
	}
	scene.add(poGroup);

	transformControls.addEventListener('change', function (event) {
		createAxisHelper(transformControls.axis, transformControls.getMode(), sliceGroup.rotation, sliceGroup.position);
		if (transformControls.axis) {
			controls.enabled = false;
			view_controls.enabled = false;
		} else {
			controls.enabled = true;
			view_controls.enabled = true;
		}
	});

	const LineVertices = {
		translate: {
			X: [-1, 0, 0, 1, 0, 0],
			Y: [0, -1, 0, 0, 1, 0],
			Z: [0, 0, -1, 0, 0, 1],
		},
		rotate: {
			X: [-1, 0, 0, 1, 0, 0], // z
			Y: [0, -1, 0, 0, 1, 0], // x
			Z: [0, 0, -1, 0, 0, 1], // y
		},
	};
	var LineGeometry = new THREE.BufferGeometry();
	var LineMaterial = new THREE.LineBasicMaterial({
		color: 0xffffff,
		transparent: true,
		opacity: 1,
	});
	var lineGroup = new THREE.Group();
	model_group.add(lineGroup);

	function createAxisHelper(axis, mode, rotation, position) {
		LineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LineVertices[mode][axis]), 3));
		var line = new THREE.Line(LineGeometry, LineMaterial);
		while (lineGroup.children.length > 0) {
			lineGroup.remove(lineGroup.children[0]);
		}
		line.rotation.copy(rotation);
		line.position.copy(position);
		line.renderOrder = -1;
		lineGroup.add(line);
	}

	// 关闭
	clearSliceTool = function () {
		transform_mode = 'translate';
		document.getElementById('transform-control-mode').style.display = 'none';

		sliceGroup.position.set(0, 0, 0);
		model.traverse(function (child) {
			if (child.isMesh) {
				child.material.clippingPlanes = [];
			}
		});

		transformControls.detach();
		transformControls.dispose();

		while (sliceGroup.children.length > 0) {
			sliceGroup.remove(sliceGroup.children[0]);
		}
		while (sliceObject.children.length > 0) {
			sliceObject.remove(sliceObject.children[0]);
		}

		while (poGroup.children.length > 0) {
			poGroup.remove(poGroup.children[0]);
		}
		while (stencilGroup.children.length > 0) {
			stencilGroup.remove(stencilGroup.children[0]);
		}

		model_group.remove(sliceGroup, sliceObject, lineGroup);
		scene.remove(poGroup);
		planeObjects = [];
		planes = [];
		planeMeshs = [];
		constants = [];
	};
}

function changeTransFormControlMode() {
	var btn;
	if (document.getElementById('transform-control-mode')) {
		btn = document.getElementById('transform-control-mode');
		document.getElementById('transform-control-mode').style.display = 'block';
	} else {
		btn = document.createElement('button');
		btn.id = 'transform-control-mode';
		btn.innerText = '切换剖切模式';
		btn.style.position = 'absolute';
		btn.style.top = '50%';
		btn.style.right = '10px';

		btn.style.cursor = 'pointer';

		btn.style.display = 'block';
		btn.style.fontSize = '16px';
		btn.style.width = '150px';
		btn.style.height = '30px';
		document.getElementById('v').appendChild(btn);
	}

	//  rotate
	btn.onclick = function () {
		if (transform_mode == 'translate') {
			transform_mode = 'rotate';
		} else {
			transform_mode = 'translate';
		}
		transformControls.setMode(transform_mode);
	};
}
function createBoxPlane(vertices) {
	var geometry = new THREE.PlaneGeometry();
	geometry.vertices = vertices;
	var material = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.3,
	});
	var plane = new THREE.Mesh(geometry, material);
	plane.onAfterRender(function (renderer) {});
	plane.visible = false;
	return plane;
}
function updateSlicePlane() {
	if (!planeObjects) return;
	for (var i = 0; i < planes.length; i++) {
		const plane = planes[i];
		const po = planeObjects[i];
		if (plane) {
			plane.coplanarPoint(po.position);
			po.lookAt(po.position.x - plane.normal.x, po.position.y - plane.normal.y, po.position.z - plane.normal.z);
		}
	}
}

var constants = [];
function updateSlicePlaneX() {
	if (!planeMeshs.length) return;
	var position = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();

	var index = 0;
	planeMeshs[index].getWorldPosition(position);
	planeMeshs[index].getWorldQuaternion(quaternion);

	planes[0].setFromNormalAndCoplanarPoint(new THREE.Vector3(-1, 0, 0), position);
	planes[0].normal.applyQuaternion(quaternion);

	if (!constants.length) {
		constants[0] = planes[0].constant;
	}
	var size = box.getSize(new THREE.Vector3());

	// planes[0].constant = (constants[0] / 2 + size.x / 2) / 2 + sliceGroup.position.x
	planes[0].constant = (size.x * 1.1) / 2 + sliceGroup.position.x;

	_updateSlicePlaneX();
	updateSlicePlaneZ();
	_updateSlicePlaneZ();
	updateSlicePlaneY();
	_updateSlicePlaneY();
}
function _updateSlicePlaneX() {
	var position = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();

	planeMeshs[1].getWorldPosition(position);
	planeMeshs[1].getWorldQuaternion(quaternion);

	planes[1].setFromNormalAndCoplanarPoint(new THREE.Vector3(1, 0, 0), position);
	planes[1].normal.applyQuaternion(quaternion);

	if (!constants[1]) {
		constants[1] = planes[1].constant;
	}
	var size = box.getSize(new THREE.Vector3());
	// planes[1].constant = -constants[1] / 2 - sliceGroup.position.x
	planes[1].constant = (size.x * 1.1) / 2 - sliceGroup.position.x;
}
function updateSlicePlaneZ() {
	var position = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();

	planeMeshs[2].getWorldPosition(position);
	planeMeshs[2].getWorldQuaternion(quaternion);

	planes[2].setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), position);
	planes[2].normal.applyQuaternion(quaternion);

	if (!constants[2]) {
		constants[2] = planes[2].constant;
	}
	planes[2].constant = constants[2] * 2 - sliceGroup.position.z;
}
function _updateSlicePlaneZ() {
	var position = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();

	planeMeshs[3].getWorldPosition(position);
	planeMeshs[3].getWorldQuaternion(quaternion);

	planes[3].setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, -1), position);
	planes[3].normal.applyQuaternion(quaternion);

	if (!constants[3]) {
		constants[3] = planes[3].constant;
	}
	planes[3].constant = sliceGroup.position.z - constants[3] * 2;
}
function updateSlicePlaneY() {
	var position = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();

	planeMeshs[4].getWorldPosition(position);
	planeMeshs[4].getWorldQuaternion(quaternion);

	planes[4].setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), position);
	planes[4].normal.applyQuaternion(quaternion);

	if (!constants[4]) {
		constants[4] = planes[4].constant;
	}

	var size = box.getSize(new THREE.Vector3());
	planes[4].constant = (size.y * 1.1) / 2 - sliceGroup.position.y;
}
function _updateSlicePlaneY() {
	var position = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();

	planeMeshs[5].getWorldPosition(position);
	planeMeshs[5].getWorldQuaternion(quaternion);

	planes[5].setFromNormalAndCoplanarPoint(new THREE.Vector3(0, -1, 0), position);
	planes[5].normal.applyQuaternion(quaternion);

	if (!constants[5]) {
		constants[5] = planes[5].constant;
	}

	var size = box.getSize(new THREE.Vector3());
	planes[5].constant = (size.y * 1.1) / 2 + sliceGroup.position.y;
}
function createPlaneStencilGroup(geometry, plane, renderOrder) {
	const group = new THREE.Group();
	const baseMat = new THREE.MeshBasicMaterial();
	baseMat.depthWrite = false;
	baseMat.depthTest = false;
	baseMat.colorWrite = false;
	baseMat.stencilWrite = true;
	baseMat.stencilFunc = THREE.AlwaysStencilFunc;

	// back faces
	const mat0 = baseMat.clone();
	mat0.side = THREE.BackSide;
	mat0.clippingPlanes = [plane];
	mat0.stencilFail = THREE.IncrementWrapStencilOp;
	mat0.stencilZFail = THREE.IncrementWrapStencilOp;
	mat0.stencilZPass = THREE.IncrementWrapStencilOp;

	const mesh0 = new THREE.Mesh(geometry, mat0);
	mesh0.renderOrder = renderOrder;
	group.add(mesh0);

	// front faces
	const mat1 = baseMat.clone();
	mat1.side = THREE.FrontSide;
	mat1.clippingPlanes = [plane];
	mat1.stencilFail = THREE.DecrementWrapStencilOp;
	mat1.stencilZFail = THREE.DecrementWrapStencilOp;
	mat1.stencilZPass = THREE.DecrementWrapStencilOp;

	const mesh1 = new THREE.Mesh(geometry, mat1);
	mesh1.renderOrder = renderOrder;

	group.add(mesh1);

	return group;
}

var transformControls;
function initTransformControls(object) {
	transformControls = new THREE.TransformControls(camera, renderer.domElement);
	transformControls.setSpace('local');
	transformControls.addEventListener('change', render);
	transformControls.attach(object);
	transformControls.setMode(transform_mode);
	scene.add(transformControls);
}
// —————————————————————————剖切——————————————————————————————
// —————————————————————————测量  点对点——————————————————————————————
var clearMeasure_pointToPoint;
function initMeasure_pointToPoint() {
	var tips = document.getElementById('mouseTip');
	var pointerGroup = new THREE.Group();
	model_group.attach(pointerGroup);
	var tagGroup = new THREE.Group();
	model_group.attach(tagGroup);

	var nums = 1;
	var points = [];
	tips.innerText = '点击确定第一个点';
	document.addEventListener('pointerdown', ray_Measure, false);
	function ray_Measure(event) {
		var raycaster = new THREE.Raycaster();
		var mouse = new THREE.Vector2();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(mouse, camera);
		var intersects = raycaster.intersectObjects(modelArr, true);
		if (intersects.length > 0) {
			var pointer = drawPoint(intersects[0].point);
			tips.innerText = '点击确定点';
			//pointer.name = `pointer_${nums}`
			pointer.name = 'pointer_' + nums;
			points.push(intersects[0].point);
			pointerGroup.add(pointer);

			if (points.length % 2 == 0) {
				var line = drawLine2([points[points.length - 1], points[points.length - 2]], 0xff0000, 1.5);
				//line.name = `pointer_${nums}`
				line.name = 'pointer_' + nums;
				tagGroup.add(line);
				pointerGroup.add(line);

				var centerPos = new THREE.Vector3();
				centerPos.addVectors(points[points.length - 1], points[points.length - 2]).multiplyScalar(0.5);
				var distance = points[points.length - 1].distanceTo(points[points.length - 2]);
				//var text = drawText(centerPos, distance, `pointer_${nums}`, 'mm')
				var text = drawText(centerPos, distance, 'pointer_' + nums, UNIT);
				tagGroup.add(text);

				nums++;
				// 删除
				//tagGroup.children.forEach(item => {
				tagGroup.children.forEach(function (item) {
					// var btn = item.element.children[0].children[0]
					// btn.addEventListener('pointerdown', function (e) {
					//   e.stopPropagation()
					//   e.preventDefault()
					//   //var arr1 = pointerGroup.children.filter(item => item.name == this.id)
					//   //pointerGroup.remove(...arr1)
					//   for (var i = pointerGroup.children.length - 1; i >= 0; i--) {
					//     if (pointerGroup.children[i].name == this.id) {
					//       pointerGroup.children.splice(i, 1)
					//     }
					//   }
					//   //var arr2 = tagGroup.children.filter(item => item.name == this.id)
					//   //tagGroup.remove(...arr2)
					//   for (var i = tagGroup.children.length - 1; i >= 0; i--) {
					//     if (tagGroup.children[i].name == this.id) {
					//       tagGroup.children.splice(i, 1)
					//     }
					//   }
					// })
				});
			}
		}
	}
	clearMeasure_pointToPoint = function (flag) {
		// 关闭点对点测量
		while (pointerGroup.children.length > 0) {
			pointerGroup.remove(pointerGroup.children[0]);
		}
		while (tagGroup.children.length > 0) {
			tagGroup.remove(tagGroup.children[0]);
		}
		points = [];
		if (!flag) {
			model_group.remove(pointerGroup, tagGroup);
			document.removeEventListener('pointerdown', ray_Measure, false);
		}
	};
}

// —————————————————————————测量  点对面——————————————————————————————
var clearMeasure_pointToMesh = null;
function initMeasure_pointToMesh() {
	var pointGroup = new THREE.Group();
	model_group.attach(pointGroup);

	var _pointGroup = new THREE.Group();
	model_group.attach(_pointGroup);

	var lineGroup = new THREE.Group();
	model_group.attach(lineGroup);

	var labelGroup = new THREE.Group();
	model_group.attach(labelGroup);

	var pointNum = 0;
	var distance = 0;

	var tips = document.getElementById('mouseTip');
	tips.innerText = '点击确定点';

	document.addEventListener('pointermove', onMoveAtModel, false);
	var INTERSECTED = null;
	var selectMeshArr = [];
	function onMoveAtModel(event) {
		var point = new THREE.Vector2();
		point.x = (event.clientX / window.innerWidth) * 2 - 1;
		point.y = -(event.clientY / window.innerHeight) * 2 + 1;
		var ray = new THREE.Raycaster();
		ray.setFromCamera(point, camera);
		var instances = ray.intersectObjects(modelArr, true);
		if (instances.length > 0) {
			if (INTERSECTED !== instances[0]) {
				if (INTERSECTED) {
					INTERSECTED.object.material.color.setHex(INTERSECTED.object.currentHex);
				}
				INTERSECTED = instances[0];
				INTERSECTED.object.currentHex = INTERSECTED.object.material.color.getHex();
				INTERSECTED.object.material.color.set(0xff0000);
				document.addEventListener('pointerdown', selectPoint, false);
			}
		} else {
			if (INTERSECTED) {
				INTERSECTED.object.material.color.setHex(INTERSECTED.object.currentHex);
			}
			INTERSECTED = null;

			if (selectMeshArr.length) {
				selectMeshArr.forEach(function (mesh, index, selectMeshArr) {
					mesh.material.color.copy(
						_modelArr.find(function (item) {
							return item.name === mesh.name;
						}).material.color
					);
				});

				selectMeshArr[selectMeshArr.length - 1].material.color.set(0x00ff00);
			}

			if (pointNum % 2 === 1) {
				selectMeshArr.forEach(function (mesh, index, selectMeshArr) {
					mesh.material.color.copy(
						_modelArr.find(function (item) {
							return item.name === mesh.name;
						}).material.color
					);
				});
			}
			document.removeEventListener('pointerdown', selectPoint, false);
		}
	}

	function selectPoint(event) {
		pointNum++;
		var point = drawPoint(INTERSECTED.point, 0xff0000);
		point.renderOrder = 2;
		editGroupChildNum(pointGroup, 2);
		point.name = pointNum;
		pointGroup.add(point);
		selectMesh();

		if (pointNum % 2 == 0) {
			var obj = pointGroup.getObjectByName(pointNum);
			obj.visible = false;
			tips.innerText = '点击确定点';
		} else {
			tips.innerText = '点击确定面';
		}
	}

	function selectMesh(event) {
		if (pointNum % 2 == 0) {
			selectMeshArr.forEach(function (mesh, index, selectMeshArr) {
				mesh.material.color.copy(
					_modelArr.find(function (item) {
						return item.name === mesh.name;
					}).material.color
				);
			});
			selectMeshArr.push(INTERSECTED.object);
			INTERSECTED.object.material.color.set(0x00ff00);

			var point = getCenterPoint(INTERSECTED.object);
			// var line = drawLine([point, pointGroup.children[0].position])
			// editGroupChildNum(lineGroup, 1)
			// lineGroup.add(line)

			var line = drawLine2([point, pointGroup.children[0].position], 0xff0000, 3);
			editGroupChildNum(lineGroup, 1);
			lineGroup.add(line);

			var _point = drawPoint(point, 0xff0000);
			_point.renderOrder = 2;
			editGroupChildNum(_pointGroup, 1);
			_pointGroup.add(_point);
			distance = _point.position.distanceTo(pointGroup.children[0].position);

			var centerPos = new THREE.Vector3().addVectors(point, pointGroup.children[0].position).multiplyScalar(0.5);
			var label = drawText(centerPos, distance, 'distance_label', UNIT, '#000', false);
			label.renderOrder = 2;
			editGroupChildNum(labelGroup, 1);
			labelGroup.add(label);
		} else {
			modelArr.forEach(function (mesh, i, modelArr) {
				if (mesh.name === _modelArr[i].name) {
					mesh.material.color.copy(_modelArr[i].material.color);
				}
			});
			editGroupChildNum(lineGroup, 1);
			editGroupChildNum(_pointGroup, 1);
			while (labelGroup.children.length > 0) {
				labelGroup.remove(labelGroup.children[0]);
			}
		}
	}

	function editGroupChildNum(group, num) {
		while (group.children.length >= num) {
			group.remove(group.children[0]);
		}
	}

	clearMeasure_pointToMesh = function (type) {
		while (pointGroup.children.length > 0) {
			pointGroup.remove(pointGroup.children[0]);
		}
		while (lineGroup.children.length > 0) {
			lineGroup.remove(lineGroup.children[0]);
		}

		while (_pointGroup.children.length > 0) {
			_pointGroup.remove(_pointGroup.children[0]);
		}

		while (labelGroup.children.length > 0) {
			labelGroup.remove(labelGroup.children[0]);
		}
		modelArr.forEach(function (item, i, modelArr) {
			if (item.name === _modelArr[i].name) {
				item.material.color.copy(_modelArr[i].material.color);
			}
		});
		selectMeshArr = [];
		if (!type) {
			document.removeEventListener('pointermove', onMoveAtModel, false);
			model_group.remove(pointGroup, lineGroup, _pointGroup, labelGroup);
			tips.innerText = '请选择测量功能';
		}
	};
}

// —————————————————————————测量  面对面——————————————————————————————
// var clearMeasure_meshToMesh initMeasure_meshToMesh
var clearMeasure_meshToMesh = null;
function initMeasure_meshToMesh() {
	var tips = document.getElementById('mouseTip');
	tips.innerText = '点击选择面';
	var tagGroup = new THREE.Group();
	model_group.attach(tagGroup);

	var tagTypes = {
		plane: {
			icon: 'plane',
			color: '#b5c287',
			value: [{ name: '区域', value: '111' }],
		},
		cylinder: {
			icon: 'cylinder',
			color: '#eeac35',
			value: [
				{ name: '直径', value: '1' },
				{ name: '长度', value: '1' },
			],
		},
		cone: {
			icon: 'cone',
			color: '#bfb0d5',
			value: [
				{ name: 'Diameter1', value: '10.00' },
				{ name: 'Diameter2', value: '9.00' },
				{ name: '长度', value: '0.5' },
			],
		},
		torus: {
			icon: 'torus',
			color: '#a2c5e7',
			value: [
				{ name: '大的直径', value: '3.50' },
				{ name: '小的直径', value: '1.50' },
			],
		},
		sphere: {
			icon: 'sphere',
			color: '#e3bfd1',
			value: [{ name: '直径', value: '13.50' }],
		},
		thread: {
			icon: 'thread',
			color: '#ac5d5d',
			value: [
				{ name: '直径', value: '2.39' },
				{ name: '半径', value: '1.53' },
				{ name: '斜率', value: '0.50' },
				{ name: '螺纹位置', value: '外螺纹' },
				{ name: '螺纹方向', value: '右旋螺纹' },
			],
		},
	};

	// model hover tag
	document.addEventListener('pointermove', showModelInfoTag, false);
	var INTERSECTED = null;
	function showModelInfoTag(event) {
		var ray = new THREE.Raycaster();
		var point = new THREE.Vector2();
		point.x = (event.clientX / window.innerWidth) * 2 - 1;
		point.y = -(event.clientY / window.innerHeight) * 2 + 1;
		ray.setFromCamera(point, camera);
		var instances = ray.intersectObjects(modelArr, true);

		if (instances.length > 0) {
			if (INTERSECTED !== instances[0]) {
				if (INTERSECTED) {
					INTERSECTED.object.material.color.setHex(INTERSECTED.object.currentHex);
				}
				INTERSECTED = instances[0];
				INTERSECTED.object.currentHex = INTERSECTED.object.material.color.getHex();
				INTERSECTED.object.material.color.set(0xff0000);
				var info = checkType(instances[0].object);
				var tag = createHoverTag(instances[0].point, info);
				while (tagGroup.children.length > 0) {
					tagGroup.remove(tagGroup.children[0]);
				}
				tagGroup.add(tag);
			}
		} else {
			if (INTERSECTED) {
				INTERSECTED.object.material.color.setHex(INTERSECTED.object.currentHex);
				INTERSECTED = null;
			}

			while (tagGroup.children.length > 0) {
				tagGroup.remove(tagGroup.children[0]);
			}
		}
	}

	// model click
	var select_instance = null;
	var selectMeshs = [];
	var pointerGroup = new THREE.Group();
	model_group.attach(pointerGroup);
	var lineGroup = new THREE.Group();
	model_group.attach(lineGroup);
	document.getElementById('hoverInfo').style.display = 'block';
	moveElement('hoverInfo');
	document.addEventListener('pointerdown', selectMesh, false);
	function selectMesh(event) {
		var ray = new THREE.Raycaster();
		var point = new THREE.Vector2();
		point.x = (event.clientX / window.innerWidth) * 2 - 1;
		point.y = -(event.clientY / window.innerHeight) * 2 + 1;
		ray.setFromCamera(point, camera);
		var instances = ray.intersectObjects(modelArr, true);
		if (instances.length > 0) {
			if (select_instance !== instances[0]) {
				if (select_instance) {
					INTERSECTED.object.material.color.setHex(select_instance.object.currentHex);
				}
				select_instance = instances[0];
				select_instance.object.currentHex = select_instance.object.material.color.getHex();
				selectMeshs.push(select_instance.object);
				selectMeshs = selectMeshs.slice(-2);
				editModelColor(selectMeshs);
				select_instance.object.material.color.set(0xff0000);
				var pointer = drawPoint(getCenterPoint(selectMeshs[selectMeshs.length - 1]));
				pointer.renderOrder = 10;
				while (pointerGroup.children.length > 1) {
					pointerGroup.remove(pointerGroup.children[0]);
				}
				pointerGroup.add(pointer);
				if (pointerGroup.children.length == 2) {
					var line = drawLine2([pointerGroup.children[0].position, pointerGroup.children[1].position], 0xff0000, 3);
					while (lineGroup.children.length > 0) {
						lineGroup.remove(lineGroup.children[0]);
					}
					lineGroup.add(line);
				}

				createInfoModel(select_instance.object);
			}
		} else {
			if (select_instance) {
				select_instance.object.material.color.setHex(select_instance.object.currentHex);
				select_instance = null;
			}
		}
	}

	function editModelColor(meshs) {
		if (meshs == undefined) {
			meshs = [];
		}
		modelArr.forEach(function (item, i) {
			if (!meshs.includes(item)) {
				item.material.color.copy(_modelArr[i].material.color);
			}
		});
	}

	function createInfoModel(object) {
		var info = checkType(object);
		if (info == null) {
			return;
		}
		var spanHTML = '';

		info.value.forEach(function (item, index, ary) {
			if (item.name.includes('螺纹')) {
				spanHTML += '<span>' + item.value + '</span><br />';
			} else if (item.name.includes('区域')) {
				spanHTML += '<span>' + item.name + ':' + item.value + UNIT + '²</span><br />';
			} else {
				spanHTML += '<span>' + item.name + ':' + item.value + UNIT + '</span><br />';
			}
		});

		var main = document.getElementById('hoverInfo_main');

		if (main && main.children.length > 1) {
			var firstChild = main.firstElementChild;
			main.removeChild(firstChild);
		}

		// ;(main.innerHTML += '<div class="item" id="hoverInfo_main_item">'),
		//   '  <div class="left" style="background-color:' + info.color + '">',
		//   '    <img class="left-img" src="/css/svgs/' + info.icon + '.svg" alt="">',
		//   '  </div>',
		//   '  <div class="right numStyle">',
		//   +spanHTML + '  </div>',
		//   '</div>'

		main.innerHTML += '<div class="item" id="hoverInfo_main_item"><div class="left" style=\'background-color: '
			.concat(info.color, '\'><img class="left-img" src="./static/svgs/')
			.concat(info.icon, '.svg" alt=""></div><div class="right numStyle">')
			.concat(spanHTML, '</div></div>');

		var footer = document.getElementById('hoverInfo_footer');

		var Eluers = [];
		if (selectMeshs.length == 2) {
			selectMeshs.forEach(function (item, i, ary) {
				var id = Number(item.name.split(model_name)[1]) + 1;
				if (getMeshTypeInfo(id).type == 'plane') {
					// Eluers.push(item)
					//var m = modelType.features.plane.find(function (j) { return j.id === id }).matrix
					//matrix.set(...m)

					if (modelType != null && modelType.features != null) {
						var quaternion = new THREE.Quaternion();
						var matrix = new THREE.Matrix4();
						var m = [];
						for (var index = 0; index < modelType.features.plane.length; index++) {
							if (modelType.features.plane[index].id === id) {
								m = modelType.features.plane[index].matrix;
							}
						}
						for (var index = 0; index < m.length; index++) {
							matrix.set(m[index]);
						}
						quaternion.setFromRotationMatrix(matrix);
						Eluers.push(quaternion);
						Eluers = Eluers.slice(-2);
					}
				}
			});
		}

		if (pointerGroup.children.length == 2) {
			var distance = pointerGroup.children[0].position.distanceTo(pointerGroup.children[1].position);
			var rota_deg;
			if (Eluers.length == 2) {
				var rota = Eluers[Eluers.length - 1].angleTo(Eluers[Eluers.length - 2]);
				rota_deg = (rota * 180) / Math.PI;
			} else {
				rota_deg = -1;
			}
			// ;(footer.innerHTML = '<div>'),
			//   '  距离：<span id="distance" class="distance fontFamily">' +
			//     returnFloat(distance) +
			//     UNIT +
			//     ' </span>',
			//   '</div>',
			//   '<div style="display:' + rota_deg !== -1 ? 'block' : 'none' + '">',
			//   '  角度：<span id="distance" class="distance fontFamily">' +
			//     new Big(rota_deg).toFixed(2) +
			//     ' °</span>',
			//   '</div>'
			footer.innerHTML = '<div>距离：<span id="distance" class="distance fontFamily">'
				.concat(returnFloat(distance), ' ')
				.concat(UNIT, "</span></div><div style='display: ")
				.concat(rota_deg !== -1 ? 'block' : 'none', '\'>角度：<span id="distance" class="distance fontFamily">')
				.concat(new Big(rota_deg).toFixed(2), ' °</span></div>');
		}
	}

	function createHoverTag(position, info) {
		var parent = document.createElement('div');
		var tag = document.createElement('div');
		parent.appendChild(tag);

		parent.padding = '10px';

		var rightInfo = '';

		if (info != null) {
			info.value.forEach(function (item) {
				rightInfo +=
					'<div>' +
					(!item.name.includes('螺纹') ? item.name : '') +
					' ' +
					(!item.name.includes('螺纹') ? '：' : '') +
					' ' +
					item.value +
					' \r' +
					(!item.name.includes('螺纹') ? (item.name.includes('区域') ? +UNIT + '²' : UNIT) : '') +
					'</div >';
			});

			tag.innerHTML =
				'<div style = "padding: 10px 10px; border-radius: 5px; background-color:rgba(255, 255, 255, 0.95); display: flex;justify-content: space-between; align-items: center; transform: translate(calc(50% + 15px), calc(50% + 15px))">' +
				'<div style="width: 40px; height: 40px;background-color: ' +
				info.color +
				'; border-radius: 5px; margin-right: 10px; display: flex; justify-content: center; align-items: center;">' +
				'<img style="width: 36px; height: 36px; border-radius: 5px;" src="/css/svgs/' +
				info.icon +
				'.svg">' +
				'</div><div style="font-size: 14px; margin-left: 10px">' +
				rightInfo +
				'</div></div>';
		}
		var label = new CSS2DObject(parent);
		// label.position.copy(position)

		document.addEventListener('mousemove', function (event) {
			var rect = document.getElementById('v').getBoundingClientRect();
			var x = event.clientX - rect.left - window.innerWidth / 2;
			var y = event.clientY - rect.top - window.innerHeight / 2 - 8;

			parent.style.left = x + 'px';
			parent.style.top = y + 'px';
		});

		return label;
	}

	function checkType(object) {
		var id = Number(object.name.split(model_name)[1]) + 1;
		var info = getMeshTypeInfo(id);
		var type = info.type;
		switch (type) {
			case 'plane':
				tagTypes[type].value[0].value = new Big(info.area).toFixed(2);
				break;
			case 'cylinder':
				tagTypes[type].value[0].value = new Big(info.diameter).toFixed(2);
				tagTypes[type].value[1].value = new Big(info.length).toFixed(2);
				break;
			case 'cone':
				tagTypes[type].value[0].value = new Big(info.diameter).toFixed(2);
				tagTypes[type].value[1].value = new Big(info.diameter2).toFixed(2);
				tagTypes[type].value[2].value = new Big(info.length).toFixed(2);
				break;
			case 'torus':
				tagTypes[type].value[0].value = new Big(info.diameter).toFixed(2);
				tagTypes[type].value[1].value = new Big(info.diameter2).toFixed(2);
				break;
			case 'sphere':
				tagTypes[type].value[0].value = new Big(info.diameter).toFixed(2);
				break;
			case 'thread':
				tagTypes[type].value[0].value = new Big(info.diameter).toFixed(2);
				tagTypes[type].value[1].value = new Big(info.radiusStart).toFixed(2);
				tagTypes[type].value[2].value = new Big(info.pitch).toFixed(2);
				tagTypes[type].value[3].value = inner >= 0 ? '外螺纹' : '内螺纹';
				tagTypes[type].value[4].value = info.left ? '左旋螺纹' : '右旋螺纹';
				break;
			default:
				break;
		}
		return tagTypes[type];
	}

	function getMeshTypeInfo(id) {
		var info = {};
		if (modelType != null && modelType.features != null) {
			for (var key in modelType.features) {
				const ele = modelType.features[key];

				ele.forEach(function (item, index, ary) {
					if (item.id == id) {
						info = item;
						info.type = key;
					}
				});
			}
		}
		return info;
	}
	// is_measure_meshToMesh
	document.getElementById('close-model').addEventListener('click', function () {
		clearMeasure_meshToMesh();
		is_measure_meshToMesh = false;
	});

	clearMeasure_meshToMesh = function (type) {
		while (pointerGroup.children.length > 0) {
			pointerGroup.remove(pointerGroup.children[0]);
		}
		while (tagGroup.children.length > 0) {
			tagGroup.remove(tagGroup.children[0]);
		}
		while (lineGroup.children.length > 0) {
			lineGroup.remove(lineGroup.children[0]);
		}

		var main = document.getElementById('hoverInfo_main');
		while (main.firstChild) {
			main.removeChild(main.firstChild);
		}
		var footer = document.getElementById('hoverInfo_footer');
		while (footer.firstChild) {
			footer.removeChild(footer.firstChild);
		}

		editModelColor();
		selectMeshs = [];
		Eluers = [];

		if (!type) {
			document.removeEventListener('pointermove', showModelInfoTag, false);
			document.removeEventListener('pointerdown', selectMesh, false);
			document.getElementById('hoverInfo').style.display = 'none';
			model_group.remove(tagGroup, pointerGroup, lineGroup);
			tips.innerText = '请选择测量方式';
		}
	};
}

// ————————————————————————— 测量 面对面 角度 ———————————————————————————————
var clearMeasure_meshToMesh_rota;
function initMeasure_meshToMesh_rota() {
	var tips = document.getElementById('mouseTip');
	tips.innerText = '单击确定面';

	var INTERSECTED = null;
	document.addEventListener('pointermove', rota_pointer_move, false);
	function rota_pointer_move(event) {
		var ray = new THREE.Raycaster();
		var point = new THREE.Vector2();
		point.x = (event.clientX / window.innerWidth) * 2 - 1;
		point.y = -(event.clientY / window.innerHeight) * 2 + 1;
		ray.setFromCamera(point, camera);
		var instances = ray.intersectObjects(modelArr, true);

		if (instances.length > 0) {
			if (INTERSECTED !== instances[0]) {
				if (INTERSECTED) {
					INTERSECTED.object.material.color.setHex(INTERSECTED.object.currentHex);
				}
				INTERSECTED = instances[0];
				INTERSECTED.object.currentHex = INTERSECTED.object.material.color.getHex();
				INTERSECTED.object.material.color.set(0xff0000);
			}
		} else {
			if (INTERSECTED) {
				INTERSECTED.object.material.color.setHex(INTERSECTED.object.currentHex);
				INTERSECTED = null;
			}
		}
	}

	var pointerGroup = new THREE.Group();
	model_group.attach(pointerGroup);

	var lineGroup = new THREE.Group();
	model_group.attach(lineGroup);

	var labelGroup = new THREE.Group();
	model_group.attach(labelGroup);

	var select_instance = null;
	var selectMeshs = [];
	document.addEventListener('pointerdown', selectMesh, false);
	function selectMesh(event) {
		var ray = new THREE.Raycaster();
		var point = new THREE.Vector2();
		point.x = (event.clientX / window.innerWidth) * 2 - 1;
		point.y = -(event.clientY / window.innerHeight) * 2 + 1;
		ray.setFromCamera(point, camera);
		var instances = ray.intersectObjects(modelArr, true);
		if (instances.length > 0) {
			if (select_instance !== instances[0]) {
				if (select_instance) {
					select_instance.object.material.color.setHex(select_instance.object.currentHex);
				}
				select_instance = instances[0];
				select_instance.object.currentHex = select_instance.object.material.color.getHex();
				select_instance.object.material.color.set(0xff0000);
				selectMeshs.push(select_instance.object);
				selectMeshs = selectMeshs.slice(-2);
				editModelColor(selectMeshs);
				var pointer = drawPoint(getCenterPoint(selectMeshs[selectMeshs.length - 1]));
				pointer.renderOrder = 10;
				while (pointerGroup.children.length > 1) {
					pointerGroup.remove(pointerGroup.children[0]);
				}
				pointerGroup.add(pointer);
				if (pointerGroup.children.length == 2) {
					var line = drawLine2([pointerGroup.children[0].position, pointerGroup.children[1].position], 0xff0000, 3);
					while (lineGroup.children.length > 0) {
						lineGroup.remove(lineGroup.children[0]);
					}
					lineGroup.add(line);

					var angle = calculateAngleBetweenMeshes(selectMeshs[selectMeshs.length - 2], selectMeshs[selectMeshs.length - 1]);
					var centerPos = new THREE.Vector3().addVectors(pointerGroup.children[0].position, pointerGroup.children[1].position).multiplyScalar(0.5);
					var label = createAngleText(angle.angleInDegrees, centerPos);
					while (labelGroup.children.length > 0) {
						labelGroup.remove(labelGroup.children[0]);
					}
					labelGroup.add(label);
				}
			}
		} else {
			if (select_instance) {
				select_instance.object.material.color.setHex(select_instance.object.currentHex);
				select_instance = null;
			}
		}
	}

	function calculateAngleBetweenMeshes(mesh1, mesh2) {
		var geometry1, geometry2;
		if (mesh1.geometry.isBufferGeometry) {
			geometry1 = new THREE.Geometry().fromBufferGeometry(mesh1.geometry);
		} else {
			geometry1 = mesh1.geometry;
		}

		if (mesh2.geometry.isBufferGeometry) {
			geometry2 = new THREE.Geometry().fromBufferGeometry(mesh2.geometry);
		} else {
			geometry2 = mesh2.geometry;
		}

		const normal1 = new THREE.Vector3();
		geometry1.computeFaceNormals();
		geometry1.faces.forEach(function (face, index, ary) {
			normal1.add(face.normal);
		});
		normal1.normalize();

		const normal2 = new THREE.Vector3();
		geometry2.computeFaceNormals();

		geometry2.faces.forEach(function (face, index, ary) {
			normal2.add(face.normal);
		});
		normal2.normalize();

		const angleInRadians = normal1.angleTo(normal2);
		const angleInDegrees = (angleInRadians * 180) / Math.PI;

		return { angleInRadians: angleInRadians, angleInDegrees: angleInDegrees };
	}

	function editModelColor(meshs) {
		if (meshs == undefined) {
			meshs = [];
		}
		modelArr.forEach(function (item, i) {
			if (!meshs.includes(item)) {
				item.material.color.copy(_modelArr[i].material.color);
			}
		});
	}

	function createAngleText(angle, position) {
		if ((angle = undefined)) {
			angle = 0;
		}
		if ((position = undefined)) {
			position = new THREE.Vector3(0, 0, 0);
		}

		var radian = angle * (Math.PI / 180); // 角度

		// 创建dom元素
		var div = document.createElement('div');
		div.id = 'angle-text';
		div.style.border = '10px';
		div.style.borderRadius = '4px';
		div.style.padding = '5px 10px';
		div.style.textAlign = 'left';
		div.style.cursor = 'pointer';
		div.style.color = 'rgb(0, 0, 0)';
		div.style.lineHeight = '1.2';
		div.style.fontSize = '14px';
		div.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
		div.style.boxShadow = 'rgba(0, 0, 0, 0.25) 0px 1px 3px 1px';
		div.style.touchAction = 'auto';
		div.style.pointerEvents = 'auto';
		div.style.userSelect = 'none';
		// div.style.top = '-20px'

		div.innerHTML = '角度：' + Number(angle).toFixed(0) + '.00° <br />' + '弧度：' + new Big(radian).toFixed(2) + '\rrad';

		var label = new CSS2DObject(div);
		label.position.copy(position);
		return label;
	}

	clearMeasure_meshToMesh_rota = function (type) {
		selectMeshs = [];
		editModelColor();
		while (pointerGroup.children.length > 0) {
			pointerGroup.remove(pointerGroup.children[0]);
		}
		while (lineGroup.children.length > 0) {
			lineGroup.remove(lineGroup.children[0]);
		}
		while (labelGroup.children.length > 0) {
			labelGroup.remove(labelGroup.children[0]);
		}
		if (!type) {
			document.removeEventListener('pointermove', rota_pointer_move, false);
			document.removeEventListener('pointerdown', selectMesh, false);
			tips.innerText = '请选择测量方式';

			model_group.remove(labelGroup, pointerGroup, lineGroup);
		}
	};
}

// ————————————————————————— 基本信息 —————————————————————————
var infoModelX, infoModelY;
function initBaseInfo() {
	var infoModel = document.querySelector('.model-info');
	infoModelX = infoModel.getBoundingClientRect().left;
	infoModelY = infoModel.getBoundingClientRect().top;
	var parent = document.getElementById('v');
	var closeBtn = document.querySelector('.close-model');

	// modelInfo
	moveElement('modelInfo');

	closeBtn.onclick = function () {
		infoModel.style.display = 'none';
		infoModel.style.top = infoModelY + 'px';
		infoModel.style.left = infoModelX + 'px';
		is_baseInfo = false;
		document.getElementById('base-info').classList.remove('active');
	};

	var main = document.querySelector('.info-main');
	// 包围盒子
	var boxSize = box.getSize(new THREE.Vector3());

	var textElement = document.createElement('text');
	textElement.textContent = 'Your Text Here';

	var totalSurfaceArea = 0;
	var totalVolume = 0;
	var x, y, z;

	if (modelInfo && modelInfo.globalTopoAttributes) {
		x = modelInfo.globalTopoAttributes.xDim;
		y = modelInfo.globalTopoAttributes.yDim;
		z = modelInfo.globalTopoAttributes.zDim;
		totalSurfaceArea = modelInfo.globalTopoAttributes.area;
		totalVolume = modelInfo.globalTopoAttributes.volume;
	} else {
		x = boxSize.x;
		y = boxSize.y;
		z = boxSize.z;
		model.children[0].traverse(function (object) {
			if (object instanceof THREE.Mesh) {
				var geometry = object.geometry;
				totalVolume += getVolume(geometry);
				totalSurfaceArea += getArea(geometry);
			}
		});
	}
	main.children[2].innerHTML = '<span class="title">包围盒子</span>' + returnFloat(x) + ' * ' + returnFloat(y) + ' * ' + returnFloat(z) + UNIT;
	main.children[0].innerHTML = '<span class="title">体积</span>' + returnFloat(totalVolume, 3) + UNIT + '³';

	main.children[1].innerHTML = '<span class="title">表面积</span >' + returnFloat(totalSurfaceArea, 2) + UNIT + '²';
}

// ————————————————————————— 测量 点对点 角度 ———————————————————————————————
var clearMeasure_pointToPoint_rota;
function initMeasure_pointToPoint_rota() {
	var tips = document.getElementById('mouseTip');
	tips.innerText = '单击确定点';
	var pointA = new THREE.Vector3(); // 圆心
	var pointB = new THREE.Vector3();
	var pointC = new THREE.Vector3();
	var vectorAB = new THREE.Vector3(); // a -> b
	var vectorAC = new THREE.Vector3(); // a -> c

	var planeMesh;

	// 点
	var pointerGroup = new THREE.Group();
	pointerGroup.name = 'angle_pointerGroup';
	model_group.attach(pointerGroup);

	var lineGroup = new THREE.Group();
	lineGroup.name = 'angle_lineGroup';
	model_group.attach(lineGroup);

	var curveLineGroup = new THREE.Group();
	curveLineGroup.name = 'angle_curveLineGroup';
	model_group.attach(curveLineGroup);

	var labelGroup = new THREE.Group();
	labelGroup.name = 'angle_labelGroup';
	model_group.attach(labelGroup);

	document.addEventListener('pointerdown', createPoint, false);

	function createPoint(event) {
		if (event.button !== 0) return;
		var point = new THREE.Vector2();
		point.x = (event.clientX / window.innerWidth) * 2 - 1;
		point.y = -(event.clientY / window.innerHeight) * 2 + 1;
		var raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(point, camera);
		var intersects = raycaster.intersectObjects(modelArr, true);

		if (intersects.length > 0) {
			var pointer = drawPoint(intersects[0].point);
			pointer.renderOrder = 1;
			clearObject(pointerGroup, 3);
			clearObject(curveLineGroup, 0);
			pointerGroup.add(pointer);

			clearObject(lineGroup, 2);

			model_group.remove(planeMesh);

			clearObject(labelGroup, 0);

			if (pointerGroup.children.length === 2) {
				var line = drawLine2([pointerGroup.children[0].position, pointerGroup.children[1].position], 0xff0000, 2);
				lineGroup.add(line);
			}
			if (pointerGroup.children.length === 3) {
				var line = drawLine2([pointerGroup.children[1].position, pointerGroup.children[2].position], 0xff0000, 2);
				lineGroup.add(line);

				pointA = pointerGroup.children[1].position;
				if (pointA.distanceTo(pointerGroup.children[0].position) <= pointA.distanceTo(pointerGroup.children[2].position)) {
					pointB = pointerGroup.children[0].position;
					pointC = pointerGroup.children[2].position;
				} else {
					pointB = pointerGroup.children[2].position;
					pointC = pointerGroup.children[0].position;
				}

				vectorAB = new THREE.Vector3().subVectors(pointB, pointA);
				vectorAC = new THREE.Vector3().subVectors(pointC, pointA);

				angle = vectorAB.angleTo(vectorAC) * (180 / Math.PI);

				var mid = findPointZOnPerpendicular(pointA, pointB, pointC);
				var s = findPointOnLineWithDistance(pointA, pointB, pointA.distanceTo(mid) * 1.5);
				var e = findPointOnLineWithDistance(pointA, pointC, pointA.distanceTo(mid) * 1.5);

				planeMesh = createPlaneForPoint(pointA, s, e);
				planeMesh.name = 'angle_planeMesh';

				model_group.attach(planeMesh);

				var label = drawText(mid, '~' + new Big(vectorAB.angleTo(vectorAC) * (180 / Math.PI)).toFixed(1), 'angle_label', '°', '#000', false);
				clearObject(labelGroup, 0);
				labelGroup.add(label);
			}
		}
	}

	function createPlaneForPoint(pointA, pointB, pointC) {
		var planeGeometry = new THREE.Geometry();
		planeGeometry.vertices.push(pointA, pointB, pointC);

		// 计算法向量
		var normal = new THREE.Vector3();
		normal.crossVectors(pointB.clone().sub(pointA), pointC.clone().sub(pointA)).normalize();

		// 设置顶点索引
		planeGeometry.faces.push(new THREE.Face3(0, 1, 2, normal));

		// 创建网格
		var planeMesh = new THREE.Mesh(
			planeGeometry,
			new THREE.MeshBasicMaterial({
				color: 0x00ff00,
				side: THREE.DoubleSide,
				transparent: true,
				opacity: 0.5,
			})
		);
		return planeMesh;
	}

	/**
	 * @param {*} P 圆心
	 * @param {*} A 起点
	 * @param {*} B 终点
	 * @returns 圆弧中点
	 */
	function findPointZOnPerpendicular(P, A, B) {
		var vectorAB = new THREE.Vector3().subVectors(B, A);
		var vectorAP = new THREE.Vector3().subVectors(P, A);
		var scalar = vectorAP.dot(vectorAB) / vectorAB.dot(vectorAB);
		var H = A.clone().add(vectorAB.clone().multiplyScalar(scalar));
		var vectorPH = new THREE.Vector3().subVectors(H, P);
		var Z = P.clone().add(vectorPH.multiplyScalar(2 / 5));
		return Z;
	}

	// 限制Group子对象的数量
	function clearObject(group, num) {
		if (group.children.length >= num) {
			while (group.children.length > 0) {
				group.remove(group.children[0]);
			}
		}
	}

	// ABLine上去AP距离为radius
	function findPointOnLineWithDistance(pointA, pointB, radius) {
		var vectorAB = new THREE.Vector3().subVectors(pointB, pointA);
		var normalizedVectorAB = vectorAB.clone().normalize();
		var pointP = pointA.clone().add(normalizedVectorAB.multiplyScalar(radius));
		return pointP;
	}

	clearMeasure_pointToPoint_rota = function (type) {
		if (model_group.getObjectByName('angle_labelGroup').children[0]) {
			model_group.getObjectByName('angle_labelGroup').children[0].visible = false;
		}
		if (model_group.getObjectByName('angle_planeMesh')) {
			model_group.remove(model_group.getObjectByName('angle_planeMesh'));
		}

		var arr = ['angle_pointerGroup', 'angle_lineGroup', 'angle_curveLineGroup', 'angle_labelGroup', 'angle_planeMesh'];

		if (!type) {
			tips.innerText = '请选择测量功能';
			document.removeEventListener('pointerdown', createPoint, false);
			model_group.remove(model_group.getObjectByName('angle_label'));
		}
		arr.forEach(function (item, index, ary) {
			if (item !== 'angle_planeMesh') {
				while (model_group.getObjectByName(item).children.length > 0) {
					model_group.getObjectByName(item).remove(model_group.getObjectByName(item).children[0]);
				}
			}
			if (!type) {
				model_group.remove(model_group.getObjectByName(item));
			}
		});
	};
}

// —————————————————————————测量——————————————————————————————

// ————————————————————————— public fn ————————————————————————————
function moveElement(domId) {
	var moveElement = document.getElementById(domId);
	// 给元素注册鼠标按下事件
	moveElement.onmousedown = function (e) {
		//兼容  e || window.event  现在都可以
		var event = e || window.event;
		var point_x = event.offsetX;
		var point_y = event.offsetY;
		document.onmousemove = function (ent) {
			var evt = ent || window.event;
			// 获取鼠标移动的坐标位置
			var ele_left = evt.clientX - point_x;
			var ele_top = evt.clientY - point_y;
			// 优化为下面的
			ele_left = Math.min(Math.max(0, ele_left), window.innerWidth - moveElement.offsetWidth);
			ele_top = Math.min(Math.max(0, ele_top), window.innerHeight - moveElement.offsetHeight);

			moveElement.style.left = ele_left + 'px';
			moveElement.style.top = ele_top + 'px';
		};

		// 抬起停止移动
		document.onmouseup = function (event) {
			// 移除移动和抬起事件
			this.onmouseup = null;
			this.onmousemove = null;

			if (typeof moveElement.releaseCapture != 'undefined') {
				moveElement.releaseCapture();
			}
		};
		document.ondragstart = function (ev) {
			ev.preventDefault();
		};
		document.ondragend = function (ev) {
			ev.preventDefault();
		};
	};
}
function getCenterPoint(object) {
	var center = new THREE.Vector3();
	var box = new THREE.Box3().setFromObject(object);
	box.getCenter(center);
	return center;
}
// 获取模型BOX3顶点坐标
function getBoxVertexPoints() {
	var max = box.max,
		min = box.min;
	var size = box.getSize(new THREE.Vector3());

	// font
	var fontRightTop = new THREE.Vector3(max.x, max.y, max.z);
	var fontRightBottom = new THREE.Vector3(max.x, max.y - size.y, max.z);
	var fontLeftTop = new THREE.Vector3(max.x - size.x, max.y, max.z);
	var fontLeftBottom = new THREE.Vector3(max.x - size.x, max.y - size.y, max.z);

	// back
	var backRightTop = new THREE.Vector3(max.x, max.y, min.z);
	var backRightBottom = new THREE.Vector3(max.x, max.y - size.y, min.z);
	var backLeftTop = new THREE.Vector3(max.x - size.x, max.y, min.z);
	var backLeftBottom = new THREE.Vector3(max.x - size.x, max.y - size.y, min.z);

	return {
		fontRightTop: fontRightTop,
		fontRightBottom: fontRightBottom,
		fontLeftTop: fontLeftTop,
		fontLeftBottom: fontLeftBottom,
		backRightTop: backRightTop,
		backRightBottom: backRightBottom,
		backLeftTop: backLeftTop,
		backLeftBottom: backLeftBottom,
	};
}

// 计算geometry体积
function getVolume(geometry) {
	if (!geometry.index) return;
	if (!geometry.isBufferGeometry) {
		return 0;
	}
	const isIndexed = geometry.index !== null;
	const position = geometry.attributes.position;
	var sum = 0;
	const p1 = new THREE.Vector3(),
		p2 = new THREE.Vector3(),
		p3 = new THREE.Vector3();
	if (!isIndexed) {
		const faces = position.count / 3;
		for (var i = 0; i < faces; i++) {
			p1.fromBufferAttribute(position, i * 3 + 0);
			p2.fromBufferAttribute(position, i * 3 + 1);
			p3.fromBufferAttribute(position, i * 3 + 2);
			sum += signedVolumeOfTriangle(p1, p2, p3);
		}
	} else {
		const index = geometry.index;
		const faces = index.count / 3;
		for (var i = 0; i < faces; i++) {
			p1.fromBufferAttribute(position, index.array[i * 3 + 0]);
			p2.fromBufferAttribute(position, index.array[i * 3 + 1]);
			p3.fromBufferAttribute(position, index.array[i * 3 + 2]);

			sum += signedVolumeOfTriangle(p1, p2, p3);
		}
	}

	// return sum > 0 ? sum * Math.pow(10, 7) : 0
	return sum;
}

// 计算三角形体积
function signedVolumeOfTriangle(p1, p2, p3) {
	return p1.dot(p2.cross(p3)) / 6.0;
}

// 计算geometry面积
function getArea(geometry) {
	var area = 0;
	if (!geometry.index) return;
	if (!geometry.isBufferGeometry) {
		return 0;
	}
	const isIndexed = geometry.index !== null;
	const position = geometry.attributes.position;
	const p1 = new THREE.Vector3(),
		p2 = new THREE.Vector3(),
		p3 = new THREE.Vector3();
	if (!isIndexed) {
		const faces = position.count / 3;
		for (var i = 0; i < faces; i++) {
			p1.fromBufferAttribute(position, i * 3 + 0);
			p2.fromBufferAttribute(position, i * 3 + 1);
			p3.fromBufferAttribute(position, i * 3 + 2);
			area += areaOfTriangle(p1, p2, p3);
		}
	} else {
		const index = geometry.index;
		const faces = index.count / 3;
		for (var i = 0; i < faces; i++) {
			p1.fromBufferAttribute(position, index.array[i * 3 + 0]);
			p2.fromBufferAttribute(position, index.array[i * 3 + 1]);
			p3.fromBufferAttribute(position, index.array[i * 3 + 2]);
			area += areaOfTriangle(p1, p2, p3);
		}
	}
	// return area * 10000
	return area;
}

// 计算三角形面积
function areaOfTriangle(p1, p2, p3) {
	const v1 = new THREE.Triangle(p1, p2, p3);
	return v1.getArea();
}
// 创建点
function drawPoint(position, color, renderOrder, isClearDepth) {
	if (color == undefined) {
		color = 0xff0000;
	}
	if (renderOrder == undefined) {
		renderOrder = 1;
	}
	if (isClearDepth == undefined) {
		isClearDepth = true;
	}
	var point = new THREE.Mesh(new THREE.SphereGeometry(0.0005, 64, 64), new THREE.MeshBasicMaterial({ color: color }));
	point.onBeforeRender = function (renderer) {
		if (isClearDepth) {
			renderer.clearDepth();
		}
	};
	point.renderOrder = renderOrder;
	point.position.copy(position);
	return point;
}

function drawLine(points, color, isClearDepth) {
	if (color == undefined) {
		color = 0xff0000;
	}
	if (isClearDepth == undefined) {
		isClearDepth = true;
	}

	var material = new THREE.LineBasicMaterial({
		color: color,
	});

	var geometry = new THREE.BufferGeometry().setFromPoints(points);
	var line = new THREE.Line(geometry, material);

	if (isClearDepth) {
		line.onAfterRender = function (renderer) {
			renderer.clearDepth();
		};
	}
	return line;
}

// 创建线
function drawLine2(points, color, lineWidth, renderOrder, isClearDepth) {
	if (color == undefined) {
		color = 0xff0000;
	}
	if (lineWidth == undefined) {
		lineWidth = 1;
	}
	if (renderOrder == undefined) {
		renderOrder = 1;
	}
	if (isClearDepth == undefined) {
		isClearDepth = true;
	}
	var geometry = new LineGeometry();
	var _points = [];
	for (var i = 0; i < points.length; i++) {
		var point = points[i];
		if (point instanceof THREE.Vector3) {
			_points.push(point.x, point.y, point.z);
		} else if (point instanceof THREE.Vector2) {
			_points.push(point.x, point.y, 0);
		} else {
			_points.push(point);
		}
	}

	geometry.setPositions(_points);

	var matLine = new THREE.LineMaterial({
		color: color,
		linewidth: 0.001 * lineWidth,
		dashed: false,
	});
	var line = new Line2(geometry, matLine);
	line.renderOrder = renderOrder;
	line.onBeforeRender = function (renderer) {
		if (isClearDepth) {
			renderer.clearDepth();
		}
	};
	return line;
}
// 创建文字
function drawText(position, text, name, unit, color, isClose) {
	if (name == undefined) {
		name = '';
	}
	if (unit == undefined) {
		unit = '';
	}
	if (color == undefined) {
		color = '#000000';
	}
	if (isClose == undefined) {
		isClose = true;
	}
	var div = document.createElement('div');
	div.style.cursor = 'pointer';

	// ${returnFloat(distance)}${unit}
	var colseHTML = '';
	if (isClose) {
		colseHTML =
			'<div id="' +
			name +
			'" style="' +
			'position: absolute;' +
			'top: -10px;' +
			'right: -10px;' +
			'width: 18px;' +
			'height: 18px;' +
			'color: rgb(255, 255, 255);' +
			'font-size: 14px;' +
			'line-height: 18px;' +
			'text-align: center;' +
			'border-radius: 50%;' +
			'cursor: pointer;' +
			'pointer-events: auto;' +
			'background-color: red;' +
			'”>' +
			'x' +
			'</div >';
	} else {
		colseHTML = '';
	}

	div.innerHTML =
		'<div style="' +
		'border: 10px;' +
		'border-radius: 4px;' +
		'padding: 5px 10px;' +
		'text-align: center;' +
		'cursor: pointer;' +
		'color: ' +
		color +
		';' +
		'line-height: 1.2;' +
		'font-size: 14px;' +
		'background-color: rgba(255, 255, 255, 0.7);' +
		'box-shadow: rgba(0, 0, 0, 0.25) 0px 1px 3px 1px;' +
		'touch-action: auto;' +
		'pointer-events: auto;' +
		'top: -15px;' +
		'position: relative;' +
		'user-select: none;' +
		'">' +
		(unit == '°' ? text : returnFloat(text)) +
		' ' +
		unit +
		'' +
		colseHTML +
		'</div>';

	var label = new CSS2DObject(div);
	label.position.copy(position);
	label.name = name;
	return label;
}

// color 16进制-> RGB
function hexToRgb(hex) {
	if (hex.includes('#')) {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return { r: r, g: g, b: b };
	} else if (hex.includes('rgb') === 0 && !hex.includes('rgba')) {
		colors = hex.split('rgb')[1].split('(')[1].split(')')[0].split(',');
		return { r: parseInt(colors[0]), g: parseInt(colors[1]), b: parseInt(colors[2]) };
	}
}

function returnFloat(value, n) {
	if (n == undefined) {
		n = 1;
	}
	if (modelInfo && modelInfo.unitname) {
		var point = 0;
		if (value < 0.01) {
			point = 3;
		}
		return new Big(Number(value)).toFixed(2 + point);
	} else {
		return new Big(Number(value * Math.pow(10, n * UNITBASE))).toFixed(2);
	}
}

// 转换单位 m -> mm   m^2->mm^2
function translateUnit() {
	var MTomm = {
		base: 1000,
		squt: 1000000,
	};
	var mmToM = {
		base: 0.001,
		squt: 1e-6,
	};
	if (UNIT == 'mm') {
		return mmToM;
	} else if (UNIT == 'm') {
		return MTomm;
	}
}

function initMouseTip() {
	var tipParent = document.createElement('div');
	var tipDOM = document.createElement('div');

	tipParent.appendChild(tipDOM);
	tipParent.style.position = 'absolute';
	tipParent.style.top = '0px';
	tipParent.style.left = '0px';
	tipParent.style.zIndex = '1000';

	tipDOM.id = 'mouseTip';
	tipDOM.style.position = 'absolute';
	tipDOM.style.display = 'none';
	tipDOM.style.fontSize = '14px';
	tipDOM.style.padding = '5px 10px';
	tipDOM.style.transform = 'translate(-20px, -10px)';
	tipDOM.style.background = 'rgba(255, 255, 255, 0.8)';
	tipDOM.style.borderRadius = '5px';
	tipDOM.style.boxShadow = '0px 0px 5px rgba(0, 0, 0, 0.5)';
	tipDOM.style.pointerEvents = 'none';
	tipDOM.style.whiteSpace = 'nowrap';
	tipDOM.style.color = '#409eff';
	tipDOM.style.zIndex = '100';
	tipDOM.innerText = '选择测量方式';
	tipDOM.id = 'mouseTip';

	var label = new CSS2DObject(tipParent);
	label.name = 'mouseTip';
	scene.add(label);

	document.addEventListener('mousemove', function (event) {
		if (event) {
			tipDOM.style.display = 'block';
		}
		var rect = document.getElementById('v').getBoundingClientRect();
		var x = event.clientX - rect.left - window.innerWidth / 2 + 40;
		var y = event.clientY - rect.top - window.innerHeight / 2 + 20;

		tipParent.style.left = x + 'px';
		tipParent.style.top = y + 'px';
	});

	return label;
}

// 动画效果
function rotateObjectWithTween(object, targetEuler, duration) {
	if (duration == undefined) {
		duration = 500;
	}
	var from = {
		x: object.rotation.x,
		y: object.rotation.y,
		z: object.rotation.z,
	};

	var to = {
		x: targetEuler.x,
		y: targetEuler.y,
		z: targetEuler.z,
	};

	new TWEEN.Tween(from)
		.to(to, duration)
		.onUpdate(function () {
			object.rotation.set(from.x, from.y, from.z);
		})
		.easing(TWEEN.Easing.Linear.None)
		.start();
}

// 深度克隆
function cloneDeep(parent) {
	// 维护两个储存循环引用的数组
	const parents = [];
	const children = [];

	//const _clone = parent => {
	const _clone = function (parent) {
		if (parent === null) return null;
		if (typeof parent !== 'object') return parent;

		var child, proto;

		if (isType(parent, 'Array')) {
			// 对数组做特殊处理
			child = [];
		} else if (isType(parent, 'RegExp')) {
			// 对正则对象做特殊处理
			child = new RegExp(parent.source, getRegExp(parent));
			if (parent.lastIndex) child.lastIndex = parent.lastIndex;
		} else if (isType(parent, 'Date')) {
			// 对Date对象做特殊处理
			child = new Date(parent.getTime());
		} else {
			// 处理对象原型
			proto = Object.getPrototypeOf(parent);
			// 利用Object.create切断原型链
			child = Object.create(proto);
		}

		// 处理循环引用
		const index = parents.indexOf(parent);

		if (index != -1) {
			// 如果父数组存在本对象,说明之前已经被引用过,直接返回此对象
			return children[index];
		}
		parents.push(parent);
		children.push(child);

		for (var i in parent) {
			// 递归
			child[i] = _clone(parent[i]);
		}

		return child;
	};
	return _clone(parent);
}

// 判断对象类型
function isType(obj, type) {
	if (typeof obj !== 'object') return false;
	const typeString = Object.prototype.toString.call(obj);
	var flag;
	switch (type) {
		case 'Array':
			flag = typeString === '[object Array]';
			break;
		case 'Date':
			flag = typeString === '[object Date]';
			break;
		case 'RegExp':
			flag = typeString === '[object RegExp]';
			break;
		default:
			flag = false;
	}
	return flag;
}

// 防抖
function debounce(func, wait) {
	var timeout;
	return function () {
		const context = this;
		const args = arguments;
		clearTimeout(timeout);
		timeout = setTimeout(function () {
			func.apply(context, args);
		}, wait);
	};
}
// 关闭全部
function closeAllTools(toolName) {
	switch (toolName) {
		case 'is_donuts':
			is_donuts = false;
			break;
		case 'is_axes':
			is_axes = false;
			model.remove(axes);
			break;
		case 'is_wf':
			is_wf = false;
			break;
		case 'is_bound':
			is_bound = false;
			if (clearBoundingBox) {
				clearBoundingBox();
			}
			break;
		case 'is_grid':
			is_grid = false;
			if (clearGridTool) {
				clearGridTool();
			}
			break;
		case 'is_slice':
			is_slice = false;
			if (clearSliceTool) {
				clearSliceTool();
			}
			break;
		case 'is_helper':
			is_helper = false;
			document.getElementById('helper-model').style.display = 'none';
			break;
		default:
			break;
	}
}

function initMenuTool() {
	var div = document.getElementById('parentMenu');
	var menu = document.createElement('button');
	menu.title = '菜单';
	menu.innerText = '菜单';
	menu.id = 'menu';
	menu.innerHTML = '<img src="/css/icons/菜单.png" /><div class="top-tool-btn-hover-box">菜单</div>';
	div.appendChild(menu);

	var model = document.createElement('button');
	model.title = '模型底纹';
	model.innerText = '模型底纹';
	model.id = 'model';
	model.className = 'menu-tool-box';
	model.innerHTML = '<img src="/css/icons/模型底纹.png" /><div class="top-tool-btn-hover-box">模型底纹</div>';
	div.appendChild(model);

	var direction = document.createElement('button');
	direction.title = '模型方向';
	direction.innerText = '模型方向';
	direction.id = 'direction';
	direction.className = 'menu-tool-box';
	direction.innerHTML = '<img src="/css/icons/模型方向.png" /><div class="top-tool-btn-hover-box">模型方向</div>';
	div.appendChild(direction);

	var other = document.createElement('button');
	other.title = '其他功能';
	other.innerText = '其他功能';
	other.id = 'other';
	other.className = 'menu-tool-box';
	other.innerHTML = '<img src="/css/icons/其他功能.png" /><div class="top-tool-btn-hover-box">其他功能</div>';
	// div.appendChild(other)

	createSedTools();

	div.addEventListener('click', function (e) {
		if (e.target.id == 'menu') {
			model.classList.toggle('model');
			direction.classList.toggle('direction');
			other.classList.toggle('other');
		} else {
			changMenuTool(e.target.id);
		}
	});
}

function createSedTools() {
	var modelBox = document.getElementById('modelBox');
	var dirBox = document.getElementById('dirBox');
	var otherBox = document.getElementById('otherBox');

	var modelTools = [
		{ id: 'modelReturn', text: '返回', imgSrc: '/css/icons/返回.png' },
		{ id: 'transparent', text: '透明', imgSrc: '/css/icons/透明.png' },
		{ id: 'outline', text: '边线', imgSrc: '/css/icons/边线.png' },
		{ id: 'shadow', text: '阴影', imgSrc: '/css/icons/阴影.png' },
	];
	var directionTools = [
		{ id: 'dirReturn', text: '返回', imgSrc: '/css/icons/返回.png' },
		{ id: 'rota', text: '旋转', imgSrc: '/css/icons/旋转.png' },
		{ id: 'view', text: '等距视图', imgSrc: '/css/icons/等距视图.png' },
		{ id: 'top_view', text: '顶视图', imgSrc: '/css/icons/顶视图.png' },
		{ id: 'font_view', text: '前视图', imgSrc: '/css/icons/前视图.png' },
		{ id: 'right_view', text: '右视图', imgSrc: '/css/icons/右视图.png' },
		{ id: 'bottom_view', text: '底视图', imgSrc: '/css/icons/底视图.png' },
		{ id: 'back_view', text: '后视图', imgSrc: '/css/icons/后视图.png' },
		{ id: 'left_view', text: '左视图', imgSrc: '/css/icons/左视图.png' },
	];

	var otherTools = [
		{ id: 'otherReturn', text: '返回', imgSrc: '/css/icons/返回.png' },
		//{ id: 'otherSlice', text: '剖切', imgSrc: '/css/icons/剖切.png' },
		//{ id: 'otherMeasure', text: '测量', imgSrc: '/css/icons/测量.png' },
		//{ id: 'otherRound', text: '包围盒', imgSrc: '/css/icons/包围盒.png' },
		//{ id: 'otherGrid', text: '网格工具', imgSrc: '/css/icons/网格工具.png' },
		//{ id: 'otherAxis', text: '坐标', imgSrc: '/css/icons/坐标.png' },
		//{ id: 'otherBaseInfo', text: '基本信息', imgSrc: '/css/icons/基本信息.png' },
		//{ id: 'otherShotScreen', text: '截图', imgSrc: '/css/icons/截图.png' }
	];

	modelTools.forEach(function (item, index, modelTools) {
		var btn = document.createElement('button');
		btn.id = item.id;
		btn.innerHTML = '<img src="' + item.imgSrc + '" ><div class="top-tool-btn-hover-box">' + item.text + '</div>';
		modelBox.appendChild(btn);
	});

	modelBox.addEventListener('click', function (e) {
		e.stopPropagation();
		switch (e.target.id) {
			case 'modelReturn':
				document.getElementById('modelBox').style.display = 'none';
				document.getElementById('parentMenu').style.display = 'block';

				model_objs.forEach(function (item, index, model_objs) {
					item.material.transparent = true;
					item.material.opacity = 1;
				});
				modelShadow(1);
				createOutline(1);
				document.getElementById('transparent').classList.remove('active');
				document.getElementById('shadow').classList.remove('active');
				document.getElementById('outline').classList.remove('active');
				break;
		}
	});
	var is_transparent = false;
	document.getElementById('transparent').addEventListener('click', function (e) {
		if (!is_transparent) {
			is_transparent = true;
			this.classList.add('active');
			model_objs.forEach(function (item, index, model_objs) {
				item.material.transparent = true;
				item.material.opacity = 0.5;
			});
		} else {
			is_transparent = false;
			this.classList.remove('active');
			model_objs.forEach(function (item, index, model_objs) {
				item.material.transparent = true;
				item.material.opacity = 1;
			});
		}
	});

	var is_shadow = false;
	document.getElementById('shadow').addEventListener('click', function (e) {
		if (!is_shadow) {
			is_shadow = true;
			this.classList.add('active');
			modelShadow();
		} else {
			is_shadow = false;
			this.classList.remove('active');
			modelShadow(1);
		}
	});

	var is_outline = false;
	document.getElementById('outline').addEventListener('click', function (e) {
		if (!is_outline) {
			is_outline = true;
			this.classList.add('active');
			createOutline();
		} else {
			is_outline = false;
			this.classList.remove('active');
			createOutline(1);
		}
	});

	directionTools.forEach(function (item, index, ary) {
		var btn = document.createElement('button');
		btn.id = item.id;
		btn.innerHTML = '<img src="' + item.imgSrc + '" ><div class="top-tool-btn-hover-box">' + item.text + '</div>';
		dirBox.appendChild(btn);
	});

	dirBox.addEventListener('pointerdown', function (e) {
		if (e.target.id !== 'rota') {
			e.target.classList.add('active');
		}
	});
	dirBox.addEventListener('pointerup', function (e) {
		if (e.target.id !== 'rota') {
			e.target.classList.remove('active');
		}
	});

	var rotation = null;
	dirBox.addEventListener('click', function (e) {
		e.stopPropagation();
		switch (e.target.id) {
			case 'dirReturn':
				document.getElementById('dirBox').style.display = 'none';
				document.getElementById('parentMenu').style.display = 'block';
				is_donuts = false;
				break;
			case 'rota':
				is_donuts = !is_donuts;
				document.getElementById('rota').classList.toggle('active');
				break;
			case 'view':
				rotation = new THREE.Euler(Math.PI / 4, -Math.PI / 4, 0, 'XYZ');
				break;
			case 'top_view':
				rotation = new THREE.Euler(Math.PI / 2, 0, 0, 'XYZ');
				break;
			case 'font_view':
				rotation = new THREE.Euler(0, 0, 0, 'XYZ');
				break;
			case 'right_view':
				rotation = new THREE.Euler(0, -Math.PI / 2, 0, 'XYZ');
				break;
			case 'bottom_view':
				rotation = new THREE.Euler(-Math.PI / 2, 0, 0, 'XYZ');
				break;
			case 'back_view':
				rotation = new THREE.Euler(0, -Math.PI, 0, 'XYZ');
				break;
			case 'left_view':
				rotation = new THREE.Euler(0, Math.PI / 2, 0, 'XYZ');
				break;
		}
		if (e.target.id !== 'rota') {
			document.getElementById('rota').classList.remove('active');
			is_donuts = false;
		}
		if (rotation) {
			controls.reset();
			view_controls.reset();
			rotateObjectWithTween(model_group, rotation, 1000);
		}
	});

	otherTools.forEach(function (item, index, otherTools) {
		var btn = document.createElement('button');
		btn.id = item.id;
		btn.innerHTML = '<img src="' + item.imgSrc + '"><div class="top-tool-btn-hover-box">' + item.text + '</div>';
		otherBox.appendChild(btn);
	});

	otherBox.addEventListener('click', function (e) {
		e.stopPropagation();
		switch (e.target.id) {
			case 'otherReturn':
				document.getElementById('otherBox').style.display = 'none';
				document.getElementById('parentMenu').style.display = 'block';
				break;
			default:
				break;
		}
	});

	var shadowGroup = new THREE.Group();
	function modelShadow(type) {
		shadowGroup.children = [];
		model.add(shadowGroup);

		if (type) {
			model.remove(shadowGroup);
			shadowGroup.children = [];
			return;
		}

		var width =
			Math.max(box.getSize(new THREE.Vector3()).x, box.getSize(new THREE.Vector3()).y, box.getSize(new THREE.Vector3()).z) +
			Math.min(box.getSize(new THREE.Vector3()).x, box.getSize(new THREE.Vector3()).y, box.getSize(new THREE.Vector3()).z);

		var geometry = new THREE.PlaneGeometry(width * 2, width * 2);
		var material = new THREE.ShadowMaterial({ transparent: true, opacity: 0.2, color: 0x000000 });
		var mesh = new THREE.Mesh(geometry, material);
		mesh.position.y = box.getSize(new THREE.Vector3()).y / -2;
		mesh.rotation.x = -Math.PI / 2;
		mesh.receiveShadow = true;

		shadowGroup.add(mesh);
	}
	var outLineGroup = new THREE.Group();
	function createOutline(type) {
		outLineGroup.children = [];
		model.add(outLineGroup);

		if (type) {
			model.remove(outLineGroup);
			while (outLineGroup.children.length > 0) {
				outLineGroup.remove(outLineGroup.children[0]);
			}
			return;
		}

		for (var i = 0; i < modelArr.length; i++) {
			var geometry = modelArr[i].geometry;
			var edges = new THREE.EdgesGeometry(geometry, 100);
			var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xff0000 }));
			outLineGroup.add(line);
		}
	}
}

function changMenuTool(id) {
	switch (id) {
		case 'model':
			document.getElementById('modelBox').style.display = 'block';
			document.getElementById('parentMenu').style.display = 'none';
			break;
		case 'direction':
			document.getElementById('dirBox').style.display = 'block';
			document.getElementById('parentMenu').style.display = 'none';
			break;
		case 'other':
			document.getElementById('otherBox').style.display = 'block';
			document.getElementById('parentMenu').style.display = 'none';
			break;
		default:
			break;
	}
}
function animationCount(duration, from, to, callback) {
	var speed = (to - from) / duration;
	var startTime = new Date().getTime();
	var value = from;
	function _run() {
		var time = new Date().getTime() - startTime;
		if (time >= duration) {
			value = to;
			if (callback) {
				callback(value);
			}
			return;
		}
		value = from + speed * time;
		if (callback) {
			callback(value);
		}
		// 下一次变化
		requestAnimationFrame(_run);
	}
	_run();
}
