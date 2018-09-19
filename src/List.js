import React, { Component } from 'react';

import './List.css';

class List extends Component {
  renderList() {
    let disabled = this.props.disabled || [];
    let items = this.props.list.map((item) => {
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

    return (
      <div className="row List-row">
        <div className="list-group-flush list-container">
          {items}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className='container-fluid List-external-container'>
        <div className="row title-row">
          <div className="badge">{this.props.title}</div>
        </div>
        {this.renderList()}
      </div>
    );
  }
}

export default List;
