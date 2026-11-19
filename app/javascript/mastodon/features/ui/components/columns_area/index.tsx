import { useCallback } from 'react';

import classNames from 'classnames';

import { ComposeButton } from '@/mastodon/features/compose/trigger';
import { NavigationPanel } from '@/mastodon/features/navigation_panel';
import {
  MobileNavigation,
  SlideOutNavigation,
} from '@/mastodon/features/navigation_panel/mobile_nav';
import { useIsSidebarComposerActive } from '@/mastodon/features/navigation_panel/sidebar_composer';
import { useMergedRefs } from '@/mastodon/hooks/useMergedRefs';
import { useScrollSensor } from '@/mastodon/hooks/useScrollSensor';
import { useStorageState } from '@/mastodon/hooks/useStorage';
import { useIdentity } from '@/mastodon/identity_context';
import { Footer } from 'mastodon/features/custom_homepage/components/footer';

import { useBreakpoint } from '../../hooks/useBreakpoint';

import { MultiColumnContent } from './multi_column_content';
import classes from './styles.module.scss';
import multiColClasses from './styles_multi_column.module.scss';
import { useWiderColumn } from './wider_column';

export const ColumnsArea: React.FC<{
  singleColumn?: boolean;
  minimalShell?: boolean;
  children: React.ReactElement | React.ReactElement[];
  ref?: React.Ref<HTMLDivElement>;
}> = ({ children, minimalShell, singleColumn, ref }) => {
  const isMobile = useBreakpoint('openable');

  const { accountId } = useIdentity();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useStorageState<boolean>(
    'navigation-sidebar-collapsed',
    singleColumn ? false : true,
    { prefix: accountId },
  );
  const toggleIsCollapsed = useCallback(() => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }, [isSidebarCollapsed, setIsSidebarCollapsed]);

  const multiColScrollSensor = useScrollSensor();
  const isSidebarComposerActive =
    useIsSidebarComposerActive(isSidebarCollapsed);
  const { rootRef, rootClassName } = useWiderColumn();
  const multiColRef = useMergedRefs(ref, rootRef);

  if (minimalShell) {
    return (
      <div ref={ref} className={classNames(classes.root, classes.rootMinimal)}>
        {isMobile && <MobileNavigation />}
        <div className={classes.main}>
          <div>{children}</div>

          <Footer />
        </div>
      </div>
    );
  }

  if (singleColumn) {
    return (
      <div
        ref={ref}
        className={classes.root}
        data-collapsed={isSidebarCollapsed}
      >
        <div className={classes.navigationWrapper}>
          <NavigationPanel
            collapsed={isSidebarCollapsed}
            onToggleCollapsed={toggleIsCollapsed}
          />
        </div>
        {isMobile ? <MobileNavigation /> : <ComposeButton />}

        <main className={classes.main}>{children}</main>
      </div>
    );
  }

  return (
    <main
      ref={multiColRef}
      className={classNames(multiColClasses.root, rootClassName)}
      data-collapsed={isSidebarCollapsed}
    >
      <div
        className={multiColClasses.navigationWrapper}
        data-is-scrolled={!multiColScrollSensor.isInViewport}
      >
        <NavigationPanel
          multiColumn
          collapsed={isSidebarCollapsed}
          onToggleCollapsed={toggleIsCollapsed}
        />
      </div>
      {multiColScrollSensor.sensor}
      {isMobile && <SlideOutNavigation multiColumn />}
      {!isSidebarComposerActive && <ComposeButton />}
      <MultiColumnContent>{children}</MultiColumnContent>
    </main>
  );
};
