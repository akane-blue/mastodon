import type React from 'react';

import classNames from 'classnames';
import { useEffect, useState } from 'react';
import logo from '@/images/logo_icon.png';
import wordmarkLogo from '@/images/logo_wordmark.png';
import wordmarkLogoLight from '@/images/logo_wordmark_lightbg.png';

export const WordmarkLogo: React.FC = () => {
  const [scheme, setScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;
    const current = root.getAttribute('data-color-scheme') as 'light' | 'dark';
    setScheme(current);
  }, []);

  return (
    <img
      // If the color scheme is 'light', use the wordmark logo for light backgrounds; otherwise, use the default wordmark logo.
      src={scheme === 'light' ? wordmarkLogoLight : wordmarkLogo}
      height="32px"
    />
  );
};

export const IconLogo: React.FC<React.ComponentPropsWithRef<'svg'>> = ({
  className,
  role = 'img',
  ...otherProps
}) => (
  <svg
    viewBox='0 0 79 79'
    className={classNames('logo logo--icon', className)}
    role={role}
    {...otherProps}
  >
    {role !== 'presentation' && <title>Mastodon</title>}
    <use xlinkHref='#logo-symbol-icon' />
  </svg>
);

export const SymbolLogo: React.FC = () => (
  <img src={logo} alt='Mastodon' className='logo logo--icon' />
);
