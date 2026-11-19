import { useEffect, useState } from 'react';

import { ComposeForm } from '@/mastodon/features/compose/form';
import { useBreakpoint } from '@/mastodon/features/ui/hooks/useBreakpoint';
import { sidebarComposer } from '@/mastodon/initial_state';

import classes from './sidebar_composer.module.scss';

// Height that must stay free for the navigation links below the header
const MIN_NAVIGATION_ROOM = 150;

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

/**
 * Takes the place of the New Post button in the navigation header and shows
 * the composer instead while the sidebar composer is active.
 */
export const SidebarComposerSlot: React.FC<{
  multiColumn?: boolean;
  mode: 'slide-out' | 'static';
  children: React.ReactNode;
}> = ({ multiColumn, mode, children }) => {
  const isActive = useIsSidebarComposerActive();

  if (!isActive || !multiColumn || mode !== 'static') {
    return children;
  }

  return <SidebarComposer />;
};

const SidebarComposer: React.FC = () => {
  const [wrapper, setWrapper] = useState<HTMLElement | null>(null);

  useStickyHeaderFallback(wrapper);

  return (
    <div ref={setWrapper} className={classes.wrapper}>
      <ComposeForm
        noMinimize
        closeOnEscape={false}
        className={classes.composer}
      />
    </div>
  );
};

/**
 * The navigation header sticks to the top of the panel. When the composer
 * makes it so tall that the links below it would be hidden behind it, let it
 * scroll with the rest of the panel instead.
 *
 * The header belongs to upstream, so it is looked up from the composer and
 * marked with a data attribute that React does not manage.
 */
const useStickyHeaderFallback = (wrapper: HTMLElement | null) => {
  useEffect(() => {
    const header = wrapper?.closest('header');
    const root = header?.parentElement;

    if (!header || !root) {
      return;
    }

    const update = () => {
      const isUnstuck =
        header.offsetHeight > root.clientHeight - MIN_NAVIGATION_ROOM;

      header.toggleAttribute('data-mod-unstuck', isUnstuck);
    };

    const observer = new ResizeObserver(update);
    observer.observe(root);
    observer.observe(header);
    update();

    return () => {
      observer.disconnect();
      header.removeAttribute('data-mod-unstuck');
    };
  }, [wrapper]);
};
