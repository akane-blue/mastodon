import { useSyncExternalStore } from 'react';

import classNames from 'classnames';
import { Link } from 'react-router-dom';

import axios, { isAxiosError } from 'axios';

import classes from './mods_announcements.module.scss';

interface ModAnnouncementItem {
  body?: string;
  icon?: string;
  href?: string;
}

type ModAnnouncementItems = Record<string, ModAnnouncementItem>;

const ANNOUNCEMENTS_URL = '/announcements.json';
const POLLING_INTERVAL = 2 * 60 * 1000;

// The announcements are shown in more than one place (e.g. the sidebar and the
// slide-out menu), so a single polling loop is shared between all of them
let cachedItems: ModAnnouncementItems = {};
let lastModified: string | undefined;
let isCacheControlled = false;

const listeners = new Set<() => void>();
let pollingTimer: ReturnType<typeof setTimeout> | undefined;
// Bumped when polling stops, so that responses still in flight are dropped
let pollingGeneration = 0;

const deleteServiceWorkerCache = async () => {
  // Files in /system/ are cached by the service worker
  if (!('caches' in self)) {
    return;
  }

  try {
    const cache = await caches.open('mastodon-system');
    await cache.delete(`${window.origin}${ANNOUNCEMENTS_URL}`);
  } catch {
    // The cache is only an optimisation, so failures can be ignored
  }
};

const fetchAnnouncements = async () => {
  try {
    const response = await axios.get<ModAnnouncementItems | null>(
      ANNOUNCEMENTS_URL,
      {
        headers: {
          'If-Modified-Since': (!isCacheControlled && lastModified) || '',
        },
      },
    );

    const lastModifiedHeader: unknown = response.headers['last-modified'];
    isCacheControlled = !!response.headers['cache-control'];
    lastModified =
      typeof lastModifiedHeader === 'string' ? lastModifiedHeader : undefined;

    return response.data ?? {};
  } catch (error) {
    if (!isAxiosError(error) || error.response?.status !== 304) {
      console.warn(error);
    }

    return null;
  } finally {
    await deleteServiceWorkerCache();
  }
};

const poll = async () => {
  const generation = pollingGeneration;
  const data = await fetchAnnouncements();

  if (generation !== pollingGeneration) {
    return;
  }

  if (data) {
    cachedItems = data;
    listeners.forEach((listener) => {
      listener();
    });
  }

  pollingTimer = setTimeout(() => void poll(), POLLING_INTERVAL);
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  if (listeners.size === 1) {
    void poll();
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      pollingGeneration++;
      clearTimeout(pollingTimer);
      pollingTimer = undefined;
    }
  };
};

const getSnapshot = () => cachedItems;

const ModAnnouncement: React.FC<{ item: ModAnnouncementItem }> = ({ item }) => {
  const { body, icon, href } = item;

  const contents = (
    <>
      <div className={classes.body}>{body}</div>
      {icon && (
        <div className={classes.icon}>
          <img src={icon} alt='' />
        </div>
      )}
    </>
  );

  if (!href) {
    return <div className={classes.item}>{contents}</div>;
  }

  const className = classNames(classes.item, classes.clickable);

  // Links to `/web/…` point into the web app and are routed internally
  if (href.startsWith('/web/')) {
    return (
      <Link to={href.slice(4)} className={className}>
        {contents}
      </Link>
    );
  }

  return (
    <a href={href} target='_blank' rel='noopener' className={className}>
      {contents}
    </a>
  );
};

/**
 * Server-specific announcements read from `/announcements.json`, which maps
 * keys to `{ body, icon?, href? }` items. Polled every two minutes while at
 * least one instance is mounted.
 */
export const ModsAnnouncements: React.FC = () => {
  const items = useSyncExternalStore(subscribe, getSnapshot);

  const entries = Object.entries(items);

  if (entries.length === 0) {
    return null;
  }

  return (
    <ul className={classes.list}>
      {entries.map(([key, item]) => (
        <li key={key}>
          <ModAnnouncement item={item} />
        </li>
      ))}
    </ul>
  );
};
