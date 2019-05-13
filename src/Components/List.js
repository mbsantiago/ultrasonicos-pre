import React, { Component } from 'react';

import translate from './Translator';
import './List.css';


class List extends Component {
  renderListByList(array) {
    let disabled = this.props.disabled || [];
    let items = array.map((item) => {
      let color;
      let className = "list-group-item list-group-item-action";

      if (disabled.indexOf(item) >= 0) {
        if (this.props.removeDisabled) {
          return "";
        }

        className += " list-group-item-secondary";
        return (
          <button
            key={item}
            type="button"
            className={className}
          >
            {translate(item)}
          </button>
        );
      }

      if (this.props.selectedItems.indexOf(item) >= 0) {
        color = ' list-group-item-warning';
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
          {translate(item)}
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
        if (this.props.removeDisabled) {
          return "";
        }

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

  render() {
    let items;

    if (this.props.list) {
      items = this.renderListByList(this.props.list);
    } else if (this.props.map) {
      items = this.renderListByMap(this.props.map);
    }

    return (
      <div className="list-group-flush list-container mh-100">
        {items}
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
}

export default List;
