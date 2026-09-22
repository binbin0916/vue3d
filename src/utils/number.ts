import Big from 'big.js';

/**
 * formatDecimal - 格式化数字的小数位数（位数不足自动补零）
 *
 * @description 将数值格式化为固定小数位数：
 * - 位数不足补零：22 → '22.000'（decimals=3）
 * - 位数超出四舍五入：3.14159 → '3.14'（decimals=2）
 * - 基于 big.js 十进制运算，避免浮点精度误差（如 1.005 → '1.01'）
 *
 * @param value 待格式化数值（number 或字符串）
 * @param decimals 小数位数，默认 2；非整数按向下取整处理，负数按 0 处理
 * @returns 格式化后的字符串；value 非法时返回 '--'
 *
 * @example
 * formatDecimal(22, 3)        // '22.000'
 * formatDecimal(3.14159, 2)   // '3.14'
 * formatDecimal('12.5', 4)    // '12.5000'
 * formatDecimal(1.005, 2)     // '1.01'
 * formatDecimal(null, 2)      // '--'
 */
export function formatDecimal(value: number | string, decimals = 2): string {
	if (value === null || value === undefined || value === '') return '--';

	const dp = Math.max(0, Math.floor(decimals));
	try {
		return new Big(value).toFixed(dp);
	} catch {
		return '--';
	}
}
