import React, { Component } from 'react';
import Tooltip from 'rc-tooltip';

import Modal from './Modal';

import 'rc-tooltip/assets/bootstrap_white.css';


class Card extends Component {
  getID() {
    return this.props.title.replace(/ /g, '-');
  }

  updateModal() {
    setTimeout(function () {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  renderHeader() {
    let headerStyle = {
      height: '2em',
    }

    let expandIcon = "";
    if (this.props.expand) {
      expandIcon = (
        <li className="nav-item h-100 p-0" >
          <Tooltip placement="top" trigger={["hover"]} overlay="Expandir">
            <div className="btn btn-link h-100 pt-0 pr-0" onClick={() => this.updateModal()} data-toggle="modal" data-target={`#${this.getID()}`}>
              <i className="fas fa-expand"></i>
            </div>
          </Tooltip>
        </li>
      );
    }

    return (
      <div className="row" style={headerStyle}>
        <ul className="nav navbar-light justify-content-between h-100 w-100">
          <p className="navbar-item m-0 h-100 p-0 text-truncate" style={{fontSize: '15px', width: '75%'}}>
            <Tooltip placement="top" trigger={["hover"]} overlay={<div className="App-tooltip">{this.props.tooltip}</div>}>
              <span>
                {this.props.title}
              </span>
            </Tooltip>
          </p>
          {expandIcon}
        </ul>
      </div>
    );
  }

  renderModal() {
    if (!this.props.expand) {
      return "";
    }

    return (
      <Modal
        ref={(node) => {this.modal = node;}}
        title={this.props.title}
        id={this.getID()}
        description={this.props.tooltip}
        large={this.props.largeModal || false}
      >
        {this.props.children}
      </Modal>
    );
  }

  render() {
    let withHeader = this.props.title !== "";
    let header = withHeader ? this.renderHeader() : "";
    let extraClasses = this.props.className || "";
    let bodyStyle = {
      height: withHeader? 'calc(100% - 2em)' : '100%',
    }

    return (
      <div className="card shadow-sm mh-100 h-100 w-100">
        <div className={"card-body container-fluid mh-100 "  + extraClasses}>
          {header}
          <div className="row" style={bodyStyle}>
            {this.props.children}
          </div>
        </div>

        {this.renderModal()}
      </div>
    );
  }
}


export default Card;
