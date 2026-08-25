import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

export const createCSS2DRenderer = (domEl: HTMLElement): CSS2DRenderer => {
	const css2dRenderer = new CSS2DRenderer();
	css2dRenderer.setSize(window.innerWidth, window.innerHeight);
	css2dRenderer.domElement.style.position = 'absolute';
	css2dRenderer.domElement.style.top = '0px';
	css2dRenderer.domElement.id = 'CSS2DRenderer';
	css2dRenderer.domElement.style.pointerEvents = 'none';
	domEl.appendChild(css2dRenderer.domElement);

	return css2dRenderer;
};
