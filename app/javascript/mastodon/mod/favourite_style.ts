import { defineMessages } from 'react-intl';

import { HeartIcon, StarIcon } from '@phosphor-icons/react';

import { favouriteStyle } from '@/mastodon/initial_state';
import type { LocaleData } from '@/mastodon/locales/global_locale';

// Messages that only exist for the favourite style, so that i18n:extract
// picks them up. They are never rendered directly, see `aliases` below.
const messages = defineMessages({
  favouritedBy: {
    id: 'favourite_style.favourited_by',
    defaultMessage: 'Favorited by',
  },
});

// The redesigned UI uses "Like" message IDs. With the favourite style enabled,
// each of them is replaced by the message of its "Favourite" counterpart.
const aliases: Record<string, string> = {
  'status.like': 'status.favourite',
  'status.unlike': 'status.remove_favourite',
  'status.likes_count': 'status.favourites_count',
  'status.likes_title': messages.favouritedBy.id,
  'notification.like': 'notification.favourite',
  'notification.like.name_and_others_with_link':
    'notification.favourite.name_and_others_with_link',
  'notification.like_message': 'notification.favourite_pm',
  'notification.like_message.name_and_others_with_link':
    'notification.favourite_pm.name_and_others_with_link',
  'navigation_bar.liked_posts': 'navigation_bar.favourites',
  'empty_column.likes': 'empty_column.favourites',
  'empty_column.liked_posts': 'empty_column.favourited_statuses',
  'keyboard_shortcuts.like': 'keyboard_shortcuts.favourite',
  'keyboard_shortcuts.liked_posts': 'keyboard_shortcuts.favourites',
  'annual_report.summary.highlighted_post.like_count':
    'annual_report.summary.highlighted_post.favourite_count',
};

export const LikeIcon = favouriteStyle ? StarIcon : HeartIcon;

export async function applyFavouriteStyle(
  localeMessages: LocaleData['messages'],
): Promise<LocaleData['messages']> {
  if (!favouriteStyle) return localeMessages;

  // Fall back to English for messages missing from the current locale,
  // instead of the "Like" default message at the call site.
  const fallbackMessages: LocaleData['messages'] = Object.values(aliases).every(
    (id) => id in localeMessages,
  )
    ? {}
    : (await import('@/mastodon/locales/en.json')).default;

  const result = { ...localeMessages };

  for (const [likeId, favouriteId] of Object.entries(aliases)) {
    const message =
      localeMessages[favouriteId] ?? fallbackMessages[favouriteId];

    if (message) result[likeId] = message;
  }

  return result;
}
