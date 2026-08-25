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

// const cuberRotationConfigs = {
// 	9: '', // 前_上
// 	10: '', // 左_上
// 	11: '', // 右
// 	13: '', // 下
// 	14: '', // 上
// 	15: '', // 右_上
// 	16: '', // 后_上
// 	17: '', // 前_右
// 	18: '', // 前
// 	20: '', // 后
// 	26: '', // 左
// };
