import React from 'react';
import { useParams } from 'react-router-dom';

import { SplitLayout } from './SplitLayout';
import { SplitViewSecondaryContext } from './splitViewContext';


export type SplitViewBodyProps = {
	primary: React.ReactNode,
	secondary: React.ReactNode,
};

/**
 * Two-pane layout shared by the `resourceSplitView` page template and the
 * `resource_split_view` component renderer. The secondary pane opens when the
 * route carries an `:id`.
 */
export function SplitViewBody({ primary, secondary }: SplitViewBodyProps): React.ReactNode {
	const [isStartFromList, setIsStartFromList] = React.useState<boolean | null>(null);
	const params = useParams();
	const isFirstPage = params.id === undefined;
	const isSecondaryPage = params.id !== undefined;
	const isPrimaryOpen = isStartFromList || isFirstPage;
	const isSecondaryOpen = isSecondaryPage;

	const secondaryState = React.useMemo(
		() => ({ isSecondary: true, isPrimaryOpen: !!isPrimaryOpen }),
		[isPrimaryOpen],
	);

	const renderPrimary = React.useCallback(() => isPrimaryOpen && primary, [isPrimaryOpen, primary]);
	const renderSecondary = React.useCallback(() => isSecondaryOpen && (
		<SplitViewSecondaryContext.Provider value={secondaryState}>
			{secondary}
		</SplitViewSecondaryContext.Provider>
	), [isSecondaryOpen, secondary, secondaryState]);

	React.useEffect(() => {
		if (isStartFromList === null || !isSecondaryPage) {
			setIsStartFromList(!isSecondaryPage);
		}
	}, [isStartFromList, isSecondaryPage]);

	return (isStartFromList != null) && (
		<SplitLayout
			primaryOpen={isPrimaryOpen}
			secondaryOpen={isSecondaryOpen}
			renderPrimary={renderPrimary}
			renderSecondary={renderSecondary}
		/>
	);
}
