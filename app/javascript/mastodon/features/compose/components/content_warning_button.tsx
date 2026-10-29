import { useCallback } from 'react';

import { FormattedMessage } from 'react-intl';

import { WarningIcon } from '@phosphor-icons/react';

import { IconButton } from '@/mastodon/components/button/redesign';
import { toggleContentWarning } from '@/mastodon/reducers/slices/composer';
import {
  useAppDispatch,
  useAppSelector,
} from '@/mastodon/store/typed_functions';

import { selectComposeSensitive } from './selectors';

export const ContentWarningButton: React.FC = () => {
  const { sensitive } = useAppSelector(selectComposeSensitive);

  const dispatch = useAppDispatch();
  const handleClick = useCallback(() => {
    dispatch(toggleContentWarning());
  }, [dispatch]);

  return (
    <IconButton
      size='sm'
      icon={WarningIcon}
      aria-pressed={sensitive}
      onClick={handleClick}
    >
      {sensitive ? (
        <FormattedMessage
          id='compose.sensitive.delete'
          defaultMessage='Remove content warning'
        />
      ) : (
        <FormattedMessage
          id='compose_form.spoiler.unmarked'
          defaultMessage='Add content warning'
        />
      )}
    </IconButton>
  );
};
