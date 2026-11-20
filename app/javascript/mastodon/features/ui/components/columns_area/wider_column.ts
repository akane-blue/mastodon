import { useLayoutEffect, useState } from 'react';

import classes from './wider_column.module.scss';

// The option is applied as a class on <html> by the server
const isWiderColumnEnabled = () =>
  document.documentElement.classList.contains('mod-wider-column');

// Same as the multi-column width in components/column/styles.module.scss
const UPSTREAM_MIN_COLUMN_WIDTH = 360;
const UPSTREAM_MAX_COLUMN_WIDTH = 400;
const UPSTREAM_COLUMNS_PER_SCREEN = 4;

// Columns are the root's children that take part in its flex layout, which
// leaves out the navigation, the floating composer and other elements that
// are positioned on their own
const isColumn = (element: Element) => {
  const { display, position } = getComputedStyle(element);
  return display !== 'none' && position !== 'absolute' && position !== 'fixed';
};

// The widest the navigation gets when it is laid out like a column
const MAX_NAVIGATION_WIDTH = 420;

const floorToHundredths = (value: number) => Math.floor(value * 100) / 100;

const getUpstreamWidth = (contentWidth: number, gap: number) =>
  Math.min(
    UPSTREAM_MAX_COLUMN_WIDTH,
    Math.max(
      UPSTREAM_MIN_COLUMN_WIDTH,
      (contentWidth - gap) / UPSTREAM_COLUMNS_PER_SCREEN - gap,
    ),
  );

/**
 * Counts how many whole columns fit into `contentWidth` when each of them is
 * at least as wide as upstream would make it.
 */
const countVisibleColumns = (
  contentWidth: number,
  gap: number,
  columnCount: number,
) => {
  const upstreamWidth = getUpstreamWidth(contentWidth, gap);

  return Math.max(
    1,
    Math.min(
      columnCount,
      Math.floor((contentWidth + gap) / (upstreamWidth + gap)),
    ),
  );
};

/**
 * Divides `contentWidth` equally among `visibleCount` columns.
 */
const divideAmongColumns = (
  contentWidth: number,
  gap: number,
  visibleCount: number,
) =>
  // Rounded down so that rounding never pushes the next column into view
  floorToHundredths((contentWidth - (visibleCount - 1) * gap) / visibleCount);

/**
 * Sets `--mod-column-width` on the multi-column root. With
 * `matchNavigation`, the navigation shares the width equally with the
 * columns, and its width is set as `--sidebar-width`, between its default
 * width and `MAX_NAVIGATION_WIDTH`.
 */
const updateColumnWidth = (root: HTMLElement, matchNavigation: boolean) => {
  if (!matchNavigation) {
    root.style.removeProperty('--sidebar-width');
  }

  const style = getComputedStyle(root);
  const gap = parseFloat(style.columnGap) || 0;
  const padding =
    (parseFloat(style.paddingInlineStart) || 0) +
    (parseFloat(style.paddingInlineEnd) || 0);
  const columnCount = Array.from(root.children).filter(isColumn).length;

  if (!matchNavigation) {
    const contentWidth = root.clientWidth - padding;

    if (contentWidth > 0) {
      root.style.setProperty(
        '--mod-column-width',
        `${divideAmongColumns(
          contentWidth,
          gap,
          countVisibleColumns(contentWidth, gap, columnCount),
        )}px`,
      );
    }

    return;
  }

  // The root makes room for the fixed navigation with its margin, so this
  // width stays the same whatever width the navigation is given. The
  // fractional width is used, as `clientWidth` is rounded and would make the
  // result depend on the width it sets. Unlike `clientWidth`, it includes the
  // border, which upstream adds to the root while it has keyboard focus.
  const border =
    (parseFloat(style.borderInlineStartWidth) || 0) +
    (parseFloat(style.borderInlineEndWidth) || 0);
  const totalWidth =
    root.getBoundingClientRect().width +
    (parseFloat(style.marginInlineStart) || 0) -
    border -
    padding;
  const defaultNavigationWidth =
    parseFloat(style.getPropertyValue('--main-navigation-width')) || 0;

  if (totalWidth - defaultNavigationWidth <= 0) {
    return;
  }

  // As many columns are shown as fit next to the navigation at its default
  // width, which never gets fewer as the window gets wider. The navigation
  // and these columns then share the width equally, so the navigation is at
  // least as wide as its default, as the columns fit next to it at that
  // width. There is no gap between the navigation and the first column.
  const visibleCount = countVisibleColumns(
    totalWidth - defaultNavigationWidth,
    gap,
    columnCount,
  );

  // Rounded down to whole pixels, so that the margin of the root, and with it
  // the width measured next time, stays the same. The columns then share what
  // is left, which also takes up the pixels lost to rounding, so that they are
  // at most a pixel wider than the navigation until it reaches its maximum.
  const navigationWidth = Math.floor(
    Math.min(
      MAX_NAVIGATION_WIDTH,
      Math.max(
        defaultNavigationWidth,
        (totalWidth - (visibleCount - 1) * gap) / (visibleCount + 1),
      ),
    ),
  );

  root.style.setProperty('--sidebar-width', `${navigationWidth}px`);
  root.style.setProperty(
    '--mod-column-width',
    `${divideAmongColumns(totalWidth - navigationWidth, gap, visibleCount)}px`,
  );
};

/**
 * With the wider column option (`web.mod_wider_column`), the visible width of
 * the multi-column layout is divided equally among the columns (see
 * `updateColumnWidth`), and the result is exposed to the multi-column root as
 * `--mod-column-width`. Scrolling snaps to the start of a column, so that
 * whole columns stay in view.
 *
 * While the sidebar composer is shown (`matchNavigation`), the navigation is
 * as wide as the columns, up to `MAX_NAVIGATION_WIDTH`, so that the composer
 * gets more room.
 *
 * `collapsed` tells whether the navigation is collapsed, so that the widths
 * follow it without waiting for the observers.
 *
 * Returns a ref for the multi-column root and a class name to add to it.
 */
export const useWiderColumn = (
  matchNavigation: boolean,
  collapsed: boolean,
) => {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  // A layout effect that updates right away, so that when the navigation is
  // expanded or collapsed, the widths for its new width are in place before it
  // is painted, instead of a frame later when the observers first report.
  // `collapsed` is only a dependency for that reason.
  useLayoutEffect(() => {
    if (!root || !isWiderColumnEnabled()) {
      return;
    }

    const update = () => {
      updateColumnWidth(root, matchNavigation);
    };

    update();

    // The width depends on the window width, on the width of the navigation
    // (which can be collapsed) and on the number of columns, which changes as
    // columns are pinned and unpinned
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(root);
    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(root, { childList: true });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      root.style.removeProperty('--mod-column-width');
      root.style.removeProperty('--sidebar-width');
    };
  }, [root, matchNavigation, collapsed]);

  return {
    rootRef: setRoot,
    rootClassName: classes.root,
  };
};
