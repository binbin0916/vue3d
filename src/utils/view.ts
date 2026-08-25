// Square_Face_

/**
 * cube 文字
 */
export const cubeTextConfigs: Record<string, { text: string; rotation: number; src: string; hasTransparent: boolean }> = {
	Square_Face_18: { text: '前', rotation: 0, src: '/assets/images/textures/front.png', hasTransparent: true },
	Square_Face_20: { text: '后', rotation: Math.PI, src: '/assets/images/textures/back.png', hasTransparent: true },
	Square_Face_26: { text: '左', rotation: -Math.PI / 2, src: '/assets/images/textures/left.png', hasTransparent: true },
	Square_Face_11: { text: '右', rotation: Math.PI / 2, src: '/assets/images/textures/right.png', hasTransparent: true },
	Square_Face_14: { text: '上', rotation: -Math.PI / 2, src: '/assets/images/textures/top.png', hasTransparent: true },
	Square_Face_13: { text: '下', rotation: Math.PI / 2, src: '/assets/images/textures/bottom.png', hasTransparent: true },
};

/**
 * 旋转角度
 */
export const cubeRotateConfigs: Record<string, Array<number>> = {
	// 六个主方位面
	Square_Face_18: [0, 0, 0], // 前
	Square_Face_20: [0, -Math.PI, 0], // 后
	Square_Face_26: [0, Math.PI / 2, 0], // 左
	Square_Face_11: [0, -Math.PI / 2, 0], // 右
	Square_Face_14: [Math.PI / 2, 0, 0], // 上
	Square_Face_13: [-Math.PI / 2, 0, 0], // 下

	// 8 个角面 Triangle_Face_1 ~ Triangle_Face_8
	Triangle_Face_1: [Math.PI / 4, -Math.PI / 4, 0], // 前右上
	Triangle_Face_2: [Math.PI / 4, Math.PI / 4, 0], //  前左上
	Triangle_Face_3: [Math.PI / 4, (-Math.PI * 3) / 4, 0], // 右后上
	Triangle_Face_4: [Math.PI / 4, (Math.PI * 3) / 4, 0], //  左后上
	Triangle_Face_5: [-Math.PI / 4, -Math.PI / 4, 0], //  前后下
	Triangle_Face_6: [-Math.PI / 4, (-Math.PI * 3) / 4, 0], //  右后下
	Triangle_Face_7: [-Math.PI / 4, Math.PI / 4, 0], //  左前下
	Triangle_Face_8: [-Math.PI / 4, (Math.PI * 3) / 4, 0], //  左后下

	// 12 个边面 Square_Face_9 ~ Square_Face_25
	Square_Face_9: [Math.PI / 4, 0, 0], // 上前
	Square_Face_10: [Math.PI / 4, Math.PI / 2, 0], // 上左
	Square_Face_12: [-Math.PI / 8, -Math.PI / 2, Math.PI / 8], // 右下
	Square_Face_15: [Math.PI / 8, -Math.PI / 2, -Math.PI / 8], // 上右
	Square_Face_16: [Math.PI / 4, -Math.PI, 0], // 上后
	Square_Face_17: [0, -Math.PI / 4, 0], // 前右
	Square_Face_19: [-Math.PI / 4, 0, 0], // 前下
	Square_Face_21: [-Math.PI / 4, -Math.PI, 0], // 后下
	Square_Face_22: [0, (-Math.PI * 3) / 4, 0], // 右后
	Square_Face_23: [0, Math.PI / 4, 0], // 前左
	Square_Face_24: [0, (Math.PI * 3) / 4, 0], // 后左
	Square_Face_25: [-Math.PI / 4, Math.PI / 2, 0], // 左下
};
