import { ComposeForm } from '@/mastodon/features/compose/form';
import { useBreakpoint } from '@/mastodon/features/ui/hooks/useBreakpoint';
import { sidebarComposer } from '@/mastodon/initial_state';

import classes from './sidebar_composer.module.scss';

/**
 * Whether the composer lives in the multi-column sidebar instead of the
 * floating composer. The sidebar is hidden below the `openable` breakpoint,
 * where the floating composer takes over again.
 */
export const useIsSidebarComposerActive = () => {
  const isOpenable = useBreakpoint('openable');

  return !!sidebarComposer && !isOpenable;
};

export const SidebarComposer: React.FC = () => (
  <div className={classes.wrapper}>
    <ComposeForm
      noMinimize
      closeOnEscape={false}
      className={classes.composer}
    />
  </div>
);
