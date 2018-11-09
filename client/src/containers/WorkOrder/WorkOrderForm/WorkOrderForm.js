import React, { Component } from 'react';
import styles from './WorkOrderForm.css';

class WorkOrderForm extends Component {
  render() {
    const {title, description} = {...this.props};

    return(
      <form className={styles.Form} noValidate autoComplete="off">
        <input
          name='title'
          placeholder='Title'
          value={title}
          onChange={e => this.props.onChange(e)}/>
        <input
          name='description'
          placeholder='Description'
          value={description}
          onChange={e => this.props.onChange(e)}/>
      </form>
    );
  }
}

export default WorkOrderForm;
