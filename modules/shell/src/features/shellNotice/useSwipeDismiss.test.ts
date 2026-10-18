import { describe, expect, it } from 'vitest';

import { resolveSwipe } from './useSwipeDismiss';


const WIDTH = 400;

describe('resolveSwipe', () => {
	it('dismisses past 35% of the width in either direction', () => {
		expect(resolveSwipe(140, WIDTH, 0)).toBe('dismiss');
		expect(resolveSwipe(-140, WIDTH, 0)).toBe('dismiss');
	});

	it('snaps back below the threshold when slow', () => {
		expect(resolveSwipe(139, WIDTH, 0.1)).toBe('reset');
		expect(resolveSwipe(-60, WIDTH, 0.1)).toBe('reset');
	});

	it('dismisses a fast flick that travelled a short distance', () => {
		expect(resolveSwipe(-40, WIDTH, 0.8)).toBe('dismiss');
	});

	it('ignores a fast twitch too short to be intentional', () => {
		expect(resolveSwipe(10, WIDTH, 2)).toBe('reset');
	});

	it('does not divide by a zero width', () => {
		expect(resolveSwipe(5, 0, 0)).toBe('reset');
	});
});
