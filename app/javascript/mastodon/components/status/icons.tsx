import {
  ArrowsClockwiseIcon,
  BookmarkSimpleIcon,
  ChatCircleIcon,
  QuotesIcon,
} from '@phosphor-icons/react';

import { LikeIcon } from '@/mastodon/mod/favourite_style';
import BoostActiveIcon from '@/svg-icons/boost_active.svg?react';

import { iconWeight } from '../icon';

export const StatusReplyIcon = ChatCircleIcon;
export const StatusReplyAllIcon = StatusReplyIcon;
export const StatusQuoteIcon = QuotesIcon;
export const StatusBoostIcon = ArrowsClockwiseIcon;
export const StatusBoostActiveIcon = BoostActiveIcon;
export const StatusLikeIcon = LikeIcon;
export const StatusLikeActiveIcon = iconWeight(LikeIcon, 'fill');
export const StatusBookmarkIcon = BookmarkSimpleIcon;
export const StatusBookmarkActiveIcon = iconWeight(BookmarkSimpleIcon, 'fill');
