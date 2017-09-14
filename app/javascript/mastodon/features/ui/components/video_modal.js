import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import Video from '../../video';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { remote_type, remote_url, remote_preview_url } from '../../../remote_media_detector';

export default class VideoModal extends ImmutablePureComponent {

  static propTypes = {
    media: ImmutablePropTypes.map.isRequired,
    time: PropTypes.number,
    onClose: PropTypes.func.isRequired,
  };

  render () {
    const { media, time, onClose } = this.props;

    return (
      <div className='modal-root__modal media-modal'>
        <div>
          <Video
            preview={remote_preview_url(media)}
            src={remote_url(media)}
            startTime={time}
            onCloseVideo={onClose}
          />
        </div>
      </div>
    );
  }

}
