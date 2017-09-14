import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import Permalink from '../../../components/permalink';
import { remote_preview_url } from '../../../remote_media_detector';

export default class MediaItem extends ImmutablePureComponent {

  static propTypes = {
    media: ImmutablePropTypes.map.isRequired,
  };

  render () {
    const { media } = this.props;
    const status = media.get('status');

    let content, style;

    if (media.get('type') === 'gifv') {
      content = <span className='media-gallery__gifv__label'>GIF</span>;
    }

    style = { backgroundImage: `url(${remote_preview_url(media)})` };

    return (
      <div className='account-gallery__item'>
        <Permalink
          to={`/statuses/${status.get('id')}`}
          href={status.get('url')}
          style={style}
        >
          {content}
        </Permalink>
      </div>
    );
  }

}
