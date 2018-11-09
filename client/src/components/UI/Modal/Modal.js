import React, { Component }from 'react';
import styles from './Modal.css';
import Aux from '../../../hoc/Aux/Aux';
import Backdrop from '../Backdrop/Backdrop';

class modal extends Component {

  static defaultProps = {
    show: false,
    handleModelCloseClick: () => {},
    width: 'content',
    height: 'content'
  };

  render() {

    const {show, handleModelCloseClick, width, height, children} = {...this.props}

      let modal = null;
      if (show) {
        modal = (
          <Aux>
            <Backdrop show={show} clicked={handleModelCloseClick}/>
            <div
              className={styles.Modal} style={{'width': width, 'height': height}}> {children}
            </div>
          </Aux>
        );
      }
    return (
      modal
    );
  }

}

export default modal;
 /*
import React, { Component }from 'react';
import styles from './Modal.css';
import Aux from '../../../hoc/Aux/Aux';
import Backdrop from '../Backdrop/Backdrop';

class modal extends Component {

  static defaultProps = {
    show: false,
    handleModelCloseClick: () => {},
    width: 'content',
    height: 'content'};

  render() {

    const {show, handleModelCloseClick, width, height} = {...this.props}

    let modal = null;
    // if (show) {
      // modal = (

      // );
    // }
    return (
         { show ? <Aux><Backdrop show={show} clicked={handleModelCloseClick}/><div className={styles.Modal} style={{'width': width, 'height': height }}> this.children </div></Aux>: null}
    );
  }

}


export default modal;
 */
