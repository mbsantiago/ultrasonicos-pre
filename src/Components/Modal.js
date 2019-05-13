import React, { Component } from 'react';


class Modal extends Component {
  render() {
    let description = "";
    if (this.props.description) {
      description = (
        <p>{this.props.description}</p>
      );
    }

    let contentStyle = {};
    let dialogStyle = {};
    let modalStyle = {};

    if (this.props.large) {
      contentStyle = {
        width: '90vw',
        height: '90vh'
      };
      dialogStyle = {
        marginLeft: '5vw',
        marginRight: '5vw',
      };
      modalStyle = {
        overflowY: 'hidden',
      };
    }

    return (
      <div ref={node => {this.modal = node}} className="modal fade" style={modalStyle} id={this.props.id} tabIndex="-1" role="dialog" aria-labelledby={`${this.props.id}Label`} aria-hidden="true">
        <div className="modal-dialog" role="document" style={dialogStyle}>
          <div className="modal-content" style={contentStyle}>
            <div className="modal-header">
              <h5 className="modal-title" id={`${this.props.id}Label`}>{this.props.title}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body h-75 w-100">
              {description}
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}


export default Modal;
