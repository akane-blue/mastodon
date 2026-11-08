import { useEffect, useState } from 'react';

import classes from './wider_column.module.scss';

// The option is applied as a class on <html> by the server
const isWiderColumnEnabled = () =>
  document.documentElement.classList.contains('mod-wider-column');

/**
 * With the wider column option (`web.mod_wider_column`), the multi-column
 * navigation grows like the columns next to it, so its width is no longer
 * `--multi-column-navigation-width`. The measured width is exposed to the
 * multi-column root as `--mod-navigation-width`, which places the floating
 * composer next to the navigation.
 *
 * The discovery column is not shown with this option, so that its width goes
 * to the other columns. Search is still reachable from the navigation, which
 * also shows the footer links instead.
 */
export const useWiderColumnNavigation = () => {
  const [wrapper, setWrapper] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = wrapper?.parentElement;

    if (!wrapper || !root || !isWiderColumnEnabled()) {
      return;
    }

    const observer = new ResizeObserver(() => {
      root.style.setProperty(
        '--mod-navigation-width',
        `${wrapper.getBoundingClientRect().width}px`,
      );
    });
    observer.observe(wrapper);

    return () => {
      observer.disconnect();
      root.style.removeProperty('--mod-navigation-width');
    };
  }, [wrapper]);

  return {
    navigationRef: setWrapper,
    navigationClassName: classes.navigation,
    showDiscoveryColumn: !isWiderColumnEnabled(),
  };
};
