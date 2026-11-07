import { useCallback, useState } from 'react';

import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import { useToggle } from '@/mastodon/hooks/useToggle';
import { displayMedia } from '@/mastodon/initial_state';

import { Button } from '../button';

import { StatusGalleryImage, StatusImage } from './image';
import classes from './quote_media_spoiler.module.scss';

export const quoteMediaSpoilerContainerClass = classes.container;

/**
 * Whether the media of a quoted post is shown, following the same
 * `display_media` rules as the attachments of a regular post.
 * Only media that starts hidden can be hidden again, so quotes of
 * non-sensitive media look the same as before.
 */
export function useQuoteMediaVisibility(sensitive: boolean) {
  const [shownByDefault] = useState(
    () =>
      displayMedia === 'show_all' ||
      (displayMedia !== 'hide_all' && !sensitive),
  );
  const [showMedia, { onTrue: onShowMedia, onFalse: onHideMedia }] =
    useToggle(shownByDefault);

  return {
    showMedia,
    canHideMedia: !shownByDefault,
    onShowMedia,
    onHideMedia,
  };
}

/**
 * Renders the image as a link to the media modal only while it is visible,
 * so the spoiler button is never nested inside a link.
 */
export const QuoteMediaImage: React.FC<
  Omit<React.ComponentProps<typeof StatusGalleryImage>, 'sensitive'> & {
    linkStatus: boolean;
    hidden: boolean;
  }
> = ({ linkStatus, hidden, statusId, className, ...props }) => {
  if (linkStatus && !hidden) {
    return (
      <StatusGalleryImage
        statusId={statusId}
        className={className}
        {...props}
      />
    );
  }

  return (
    <StatusImage
      // Keeps the size the link would have, as `a.image` sets it upstream.
      className={classNames(className, linkStatus && classes.hiddenImage)}
      sensitive={hidden}
      {...props}
    />
  );
};

export const QuoteMediaSpoiler: React.FC<{ onReveal: () => void }> = ({
  onReveal,
}) => {
  // Keep the click from opening the quoted post or the notification.
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onReveal();
    },
    [onReveal],
  );

  return (
    // The whole overlay reveals the media on click. Keyboard users reach
    // the button below, whose click bubbles up to this handler.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className={classes.overlay}
      data-color-scheme='dark'
      onClick={handleClick}
    >
      <Button size='sm' variant='solid'>
        <FormattedMessage
          id='content_warning.media.show_short'
          defaultMessage='Show media'
        />
      </Button>
    </div>
  );
};

export const QuoteMediaHideButton: React.FC<{ onHide: () => void }> = ({
  onHide,
}) => {
  // Keep the click from opening the quoted post or the notification.
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onHide();
    },
    [onHide],
  );

  // Same look as the hide button of a regular post's media gallery
  return (
    <div className={classes.hideButton} data-color-scheme='dark'>
      <Button
        contrastOnMedia
        size='xs'
        variant='solid'
        className='media-gallery__actions__pill'
        onClick={handleClick}
      >
        <FormattedMessage id='media_gallery.hide' defaultMessage='Hide' />
      </Button>
    </div>
  );
};
