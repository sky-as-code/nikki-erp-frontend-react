import { createSelector } from '@reduxjs/toolkit';

import {
	reducer,
	actions,
	listSlideshows,
	getSlideshow,
	createSlideshow,
	updateSlideshow,
	deleteSlideshow,
	SlideshowState,
	initialSlideshowState,
} from '@/features/slideshow/slideshowSlice';


const STATE_KEY = 'slideshow';

export const slideshowReducer = {
	[STATE_KEY]: reducer,
};

export const slideshowActions = {
	listSlideshows,
	getSlideshow,
	createSlideshow,
	updateSlideshow,
	deleteSlideshow,
	...actions,
};

export const selectSlideshowState = (state: { [STATE_KEY]?: SlideshowState }) => state?.[STATE_KEY] ?? initialSlideshowState;

export const selectSlideshowList = createSelector(
	selectSlideshowState,
	(state) => state.list,
);

export const selectSlideshowDetail = createSelector(
	selectSlideshowState,
	(state) => state.detail,
);

export const selectCreateSlideshow = createSelector(
	selectSlideshowState,
	(state) => state.create,
);

export const selectUpdateSlideshow = createSelector(
	selectSlideshowState,
	(state) => state.update,
);

export const selectDeleteSlideshow = createSelector(
	selectSlideshowState,
	(state) => state.delete,
);
