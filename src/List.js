import React, { Component } from 'react';
import Tooltip from 'rc-tooltip';

import './List.css';
import 'rc-tooltip/assets/bootstrap_white.css';

class List extends Component {
  renderListByList(array) {
    let disabled = this.props.disabled || [];
    let items = array.map((item) => {
      let color;
      let className = "List-item list-group-item list-group-item-action";

      if (disabled.indexOf(item) >= 0) {
        className += " disabled list-group-item-dark";
        return (
          <button
            key={item}
            type="button"
            className={className}
          >
            {item}
          </button>
        );
      }

      if (this.props.selectedItems.indexOf(item) >= 0) {
        color = this.props.color;
      } else {
        color = ' list-group-item-light';
      }
      className = className + color;

      return (
        <button
          key={item}
          type="button"
          className={className}
          onClick={() => this.props.onClick(item)}>
          {item}
        </button>
      );
    });
    return items;
  }

  renderListByMap(dict){
    let disabled = this.props.disabled || [];
    let items = Object.keys(dict).map((key) => {
      let color;
      let className = "List-item list-group-item list-group-item-action";

      if (disabled.indexOf(key) >= 0) {
        className += " disabled list-group-item-dark";
        return (
          <button
            key={key}
            type="button"
            className={className}
          >
            {dict[key]}
          </button>
        );
      }

      if (this.props.selectedItems.indexOf(key) >= 0) {
        color = this.props.color;
      } else {
        color = ' list-group-item-light';
      }
      className = className + color;

      return (
        <button
          key={key}
          type="button"
          className={className}
          onClick={() => this.props.onClick(key)}>
          {dict[key]}
        </button>
      );
    });
    return items;
  }

  renderList() {
    let items;

    if (this.props.list) {
      items = this.renderListByList(this.props.list);
    } else if (this.props.map) {
      items = this.renderListByMap(this.props.map);
    }

    return (
      <div className="row List-row">
        <div className="list-group-flush list-container">
          {items}
        </div>
      </div>
    );
  }

  removeSelection(){
    let options, index;
    if (this.props.list) {
      options = this.props.list;
    } else if (this.props.map) {
      options = Object.keys(this.props.map);
    }

    options.forEach((key) => {
      index = this.props.selectedItems.indexOf(key);

      if (index >= 0) {
        this.props.onClick(key);
      }
    });
  }

  selectAll() {
    let options, index;
    if (this.props.list) {
      options = this.props.list;
    } else if (this.props.map) {
      options = Object.keys(this.props.map);
    }

    options.forEach((key) => {
      index = this.props.selectedItems.indexOf(key);

      if (index < 0) {
        this.props.onClick(key);
      }
    });
  }

  renderButtons() {
    if (this.props.buttons) {
      return (
        <div className="badge float-right">
          <span onClick={() => this.removeSelection()}>&otimes;</span>
          <span onClick={() => this.selectAll()}>&oplus;</span>
        </div>
      )
    }
  }

  render() {
    let buttons = this.renderButtons();

    return (
      <div className='container-fluid List-external-container'>
        <div className="row title-row clearfix">
          <div className="badge float-left">{this.props.title}</div>
          <div className="badge float-right">
            <Tooltip placement="top" trigger={['hover']} overlay={<div className="app-tooltip">{this.props.info}</div>}>
              <i className="fa fa-info"></i>
            </Tooltip>
          </div>
          {buttons}
        </div>
        {this.renderList()}
      </div>
    );
  }
}

export default List;
