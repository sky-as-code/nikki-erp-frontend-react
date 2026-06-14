import { collapsibleSectionRenderer } from './collapsibleSection';
import { registerComponentRenderer } from './registry';
import { resourceCreateColumnRenderer } from './resourceCreateColumn';
import { resourceCreateFormRenderer } from './resourceCreateForm';
import { resourceCreateHeaderRenderer } from './resourceCreateHeader';
import { resourceCreateSectionRenderer } from './resourceCreateSection';
import { resourceDetailHeaderRenderer } from './resourceDetailHeader';
import { resourceFormRenderer } from './resourceForm';
import { resourceFormColumnRenderer } from './resourceFormColumn';
import { resourceSplitViewRenderer } from './resourceSplitView';


registerComponentRenderer(collapsibleSectionRenderer);
registerComponentRenderer(resourceDetailHeaderRenderer);
registerComponentRenderer(resourceFormRenderer);
registerComponentRenderer(resourceFormColumnRenderer);
registerComponentRenderer(resourceCreateHeaderRenderer);
registerComponentRenderer(resourceCreateFormRenderer);
registerComponentRenderer(resourceCreateSectionRenderer);
registerComponentRenderer(resourceCreateColumnRenderer);
registerComponentRenderer(resourceSplitViewRenderer);
