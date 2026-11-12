import { useEffect, useState } from 'react';

import classes from './wider_column.module.scss';

// The option is applied as a class on <html> by the server
const isWiderColumnEnabled = () =>
  document.documentElement.classList.contains('mod-wider-column');

// Same as the multi-column width in components/column/styles.module.scss
const UPSTREAM_MIN_COLUMN_WIDTH = 360;
const UPSTREAM_MAX_COLUMN_WIDTH = 400;
const UPSTREAM_COLUMNS_PER_SCREEN = 4;

// Columns are the root's children that take part in its flex layout, which
// leaves out the floating composer and other fixed elements
const isColumn = (element: Element) => {
  const { display, position } = getComputedStyle(element);
  return display !== 'none' && position !== 'absolute' && position !== 'fixed';
};

/**
 * Divides the visible width equally among as many whole columns as fit,
 * counting the navigation as a column. Each column is at least as wide as
 * upstream would make it, so the columns that don't fit are left entirely
 * beyond the horizontal scroll instead of being cut off at the window edge.
 */
const updateColumnWidth = (root: HTMLElement) => {
  const style = getComputedStyle(root);
  const gap = parseFloat(style.columnGap) || 0;
  const contentWidth =
    root.clientWidth -
    (parseFloat(style.paddingInlineStart) || 0) -
    (parseFloat(style.paddingInlineEnd) || 0);

  if (contentWidth <= 0) {
    return;
  }

  const navigationWidth =
    parseFloat(style.getPropertyValue('--multi-column-navigation-width')) || 0;
  const upstreamWidth = Math.min(
    UPSTREAM_MAX_COLUMN_WIDTH,
    Math.max(
      UPSTREAM_MIN_COLUMN_WIDTH,
      (contentWidth - navigationWidth - gap) / UPSTREAM_COLUMNS_PER_SCREEN -
        gap,
    ),
  );

  const columnCount = Array.from(root.children).filter(isColumn).length;
  const visibleCount = Math.max(
    1,
    Math.min(
      columnCount,
      Math.floor((contentWidth + gap) / (upstreamWidth + gap)),
    ),
  );

  // Rounded down so that rounding never pushes the next column into view
  const width =
    Math.floor(
      ((contentWidth - (visibleCount - 1) * gap) / visibleCount) * 100,
    ) / 100;

  root.style.setProperty('--mod-column-width', `${width}px`);
};

/**
 * With the wider column option (`web.mod_wider_column`), the visible width of
 * the multi-column layout is divided equally among the navigation and the
 * columns (see `updateColumnWidth`), and the result is exposed to the
 * multi-column root as `--mod-column-width`. Scrolling snaps to the start of
 * a column, so that whole columns stay in view.
 *
 * As the navigation is no longer `--multi-column-navigation-width` wide, its
 * measured width is exposed as `--mod-navigation-width`, which places the
 * floating composer next to the navigation.
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

    const navigationObserver = new ResizeObserver(() => {
      root.style.setProperty(
        '--mod-navigation-width',
        `${wrapper.getBoundingClientRect().width}px`,
      );
    });
    navigationObserver.observe(wrapper);

    const update = () => {
      updateColumnWidth(root);
    };

    // The width depends on the window width and on the number of columns,
    // which changes as columns are pinned and unpinned
    const rootObserver = new ResizeObserver(update);
    rootObserver.observe(root);
    const columnsObserver = new MutationObserver(update);
    columnsObserver.observe(root, { childList: true });

    return () => {
      navigationObserver.disconnect();
      rootObserver.disconnect();
      columnsObserver.disconnect();
      root.style.removeProperty('--mod-navigation-width');
      root.style.removeProperty('--mod-column-width');
    };
  }, [wrapper]);

  return {
    navigationRef: setWrapper,
    navigationClassName: classes.navigation,
    rootClassName: classes.root,
    showDiscoveryColumn: !isWiderColumnEnabled(),
  };
};
