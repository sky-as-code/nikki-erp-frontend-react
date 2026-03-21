import { combineReducers, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { attributeReducer } from './attribute';
import { attributeValueReducer } from './attributeValue';
import { productReducer } from './product';
import { productCategoryReducer } from './productCategory';
import { unitReducer } from './unit';
import { unitCategoryReducer } from './unitCategory';
import { variantReducer } from './variant';


export {
	attributeActions,
	selectAttributeState,
	selectAttributeList,
	selectAttributeList as selectAttributes,
	selectAttributeDetail,
	selectCreateAttribute,
	selectUpdateAttribute,
	selectDeleteAttribute,
} from './attribute';
export {
	attributeValueActions,
	selectAttributeValueState,
	selectAttributeValueList,
	selectAttributeValueDetail,
	selectCreateAttributeValue,
	selectUpdateAttributeValue,
	selectDeleteAttributeValue,
} from './attributeValue';
export { productActions, selectProductState, selectProductList as selectProducts } from './product';
export {
	productCategoryActions,
	selectProductCategoryState,
	selectProductCategoryList,
	selectProductCategoryList as selectProductCategories,
} from './productCategory';
export {
	unitActions,
	selectUnitState,
	selectUnitList,
	selectUnitDetail,
	selectCreateUnit,
	selectUpdateUnit,
	selectDeleteUnit,
} from './unit';
export {
	unitCategoryActions,
	selectUnitCategoryState,
	selectUnitCategoryList,
	selectCreateUnitCategory,
	selectUpdateUnitCategory,
	selectDeleteUnitCategory,
} from './unitCategory';
export { variantActions, selectVariantState, selectVariantList as selectVariants } from './variant';

export const reducer = combineReducers({
	...attributeReducer,
	...attributeValueReducer,
	...productReducer,
	...productCategoryReducer,
	...unitReducer,
	...unitCategoryReducer,
	...variantReducer,
});

export type InventoryDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;
