import { ComposeForm } from '@/mastodon/features/compose/form';
import { useBreakpoint } from '@/mastodon/features/ui/hooks/useBreakpoint';
import { sidebarComposer } from '@/mastodon/initial_state';

import classes from './sidebar_composer.module.scss';

/**
 * Whether the composer lives in the multi-column sidebar instead of the
 * floating composer. The sidebar is hidden below the `openable` breakpoint,
 * and only shows icons while collapsed, so the floating composer takes over
 * again in both cases.
 */
export const useIsSidebarComposerActive = (collapsed = false) => {
  const isOpenable = useBreakpoint('openable');

  return !!sidebarComposer && !isOpenable && !collapsed;
};

const useIsShownInPanel = (
  multiColumn: boolean | undefined,
  mode: 'slide-out' | 'static',
) => {
  const isActive = useIsSidebarComposerActive();

  return isActive && !!multiColumn && mode === 'static';
};

/**
 * Hides the New Post button in the navigation header while the sidebar
 * composer is shown below the header instead.
 */
export const SidebarComposerSlot: React.FC<{
  multiColumn?: boolean;
  mode: 'slide-out' | 'static';
  children: React.ReactNode;
}> = ({ multiColumn, mode, children }) => {
  const isShown = useIsShownInPanel(multiColumn, mode);

  return isShown ? null : children;
};

/**
 * The composer itself. It is placed below the sticky navigation header, so
 * it scrolls with the navigation links instead of staying in view.
 */
export const SidebarComposer: React.FC<{
  multiColumn?: boolean;
  mode: 'slide-out' | 'static';
}> = ({ multiColumn, mode }) => {
  const isShown = useIsShownInPanel(multiColumn, mode);

  if (!isShown) {
    return null;
  }

  return (
    <div className={classes.wrapper}>
      <ComposeForm
        noMinimize
        closeOnEscape={false}
        className={classes.composer}
      />
    </div>
  );
};
