import { computed } from 'vue';
import { defineStore } from 'pinia';

export const useCommonStore = defineStore('common', () => {
	const isMobile = computed(() => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

	return { isMobile };
});
