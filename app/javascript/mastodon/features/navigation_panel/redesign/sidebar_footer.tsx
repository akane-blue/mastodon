import { useEffect, useState } from 'react';

import classes from './sidebar_footer.module.scss';

// Height that must stay free for the navigation links above the footer
const MIN_NAVIGATION_ROOM = 150;

/**
 * Groups the New Post button (or the sidebar composer) with the
 * announcements below it, keeping them at the top of the footer.
 */
export const SidebarFooterTop: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className={classes.footerTop}>{children}</div>;

/**
 * The navigation footer sticks to the bottom of the panel. When the sidebar
 * composer and the announcements make it so tall that the links above it
 * would be hidden behind it, let it scroll with the rest of the panel instead.
 */
export const useSidebarFooterFallback = () => {
  const [footer, setFooter] = useState<HTMLElement | null>(null);
  const [isUnstuck, setIsUnstuck] = useState(false);

  useEffect(() => {
    const root = footer?.parentElement;
    const top = footer?.firstElementChild;

    if (!footer || !root || !(top instanceof HTMLElement)) {
      return;
    }

    const update = () => {
      const header = root.querySelector(':scope > header');
      const headerHeight =
        header instanceof HTMLElement
          ? header.offsetHeight +
            parseFloat(getComputedStyle(header).marginBottom)
          : 0;
      // The footer grows to fill the free space of the panel, which ends up
      // as the auto margin below its top group
      const contentHeight =
        footer.offsetHeight - parseFloat(getComputedStyle(top).marginBottom);

      setIsUnstuck(
        contentHeight > root.clientHeight - headerHeight - MIN_NAVIGATION_ROOM,
      );
    };

    const observer = new ResizeObserver(update);
    observer.observe(root);
    observer.observe(footer);
    observer.observe(top);
    update();

    return () => {
      observer.disconnect();
    };
  }, [footer]);

  return {
    footerRef: setFooter,
    footerClassName: isUnstuck ? classes.unstuck : undefined,
  };
};
