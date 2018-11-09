import React, {Component} from 'react';
import Image from '../../UI/Image/Image';
import styles from './SpaceImage.css';

class SpaceImage extends Component {

  shouldComponentUpdate(nextProps) {
    const shouldUpdate = !(nextProps.imageFileName === this.props.imageFileName)
    return shouldUpdate
  }

  render() {
    const imageFileName = this.props.imageFileName !== '' ? this.props.imageFileName : 'default.jpg';
    return(
      <div className={styles.SpaceImage}>
        <Image
          imagePath={'spaces/' + imageFileName}
          alt="Space"
          fit="Cover"/>
      </div>
    );
  }
}

export default SpaceImage;
