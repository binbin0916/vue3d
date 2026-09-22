/**
 * 复制文本到剪贴板
 * @param {string|number} value 要复制的内容
 * @returns {Promise<boolean>} 是否复制成功
 */
export async function copyText(value: string | number) {
	const text = value === null || value === undefined ? '' : String(value);
	// 优先使用现代 Clipboard API
	if (navigator.clipboard && window.isSecureContext) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			// 权限被拒或其它异常时，走降级方案
			return fallbackCopy(text);
		}
	}

	return fallbackCopy(text);
}

/**
 * 降级复制方案（兼容旧浏览器 / 非 HTTPS 环境）
 * @param {string} text
 * @returns {boolean}
 */
function fallbackCopy(text: string | number) {
	try {
		const textarea = document.createElement('textarea');
		textarea.value = String(text);

		// 避免页面滚动和闪烁
		textarea.style.position = 'fixed';
		textarea.style.top = '-9999px';
		textarea.style.left = '-9999px';
		textarea.setAttribute('readonly', '');

		document.body.appendChild(textarea);
		textarea.select();
		textarea.setSelectionRange(0, textarea.value.length); // 兼容 iOS

		const success = document.execCommand('copy');
		document.body.removeChild(textarea);
		return success;
	} catch (err) {
		console.error('复制失败:', err);
		return false;
	}
}
