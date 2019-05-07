import React, { Component } from 'react';
import { MONTHS, YEARS } from './utils';
import Tooltip from 'rc-tooltip';

import './Controls.css';


class Controls extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.availableMonths = new Set();
  }

  updateAvailableMonths() {
    let months = new Set();

    this.props.selectedYears.forEach((year) => {
      this.props.availableDates[year].forEach((month) => {
        months.add(month);
        return null;
      });
      return null;
    });

    this.availableMonths = months;
  }

  getMonthColor(month) {
    let color;

    if (this.availableMonths.has(month)) {
      if (this.props.selectedMonths.has(month)) {
        color = ' bg-warning';
      } else {
        color = ' bg-light';
      }
    } else {
      color = ' bg-dark text-white';
    }

    return color;
  }

  getMonthClass(i, j) {
    let round = "";

    if (i === 0) {
      if (j === 0) {
        round = " rounded-top-left";
      } else if (j === 2) {
        round = " rounded-top-right";
      }
    } else if (i === 3) {
      if (j === 0) {
        round = " rounded-bottom-left";
      } else if (j === 2) {
        round = " rounded-bottom-right";
      }
    }

    return round;
  }

  renderCalendar() {
    let months = [
      MONTHS.slice(0, 3),
      MONTHS.slice(3, 6),
      MONTHS.slice(6, 9),
      MONTHS.slice(9, 12),
    ];

    this.updateAvailableMonths();

    let rows = months.map((row, i) => {
      let columns = row.map((month, j) => {
        let color = this.getMonthColor(month);
        let round = this.getMonthClass(i, j);

        let className = "calendario-mes col" + color + round;

        return (
          <td
            key={'mes'+month}
            className={className}
            onClick={() => this.props.toggleMonth(month)}>
            {month}
          </td>);
      });

      return (<tr key={'row' + i}>{columns}</tr>);
    });

    return (
      <table className="calendario table table-hover">
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }

  renderYears() {
    let availableYears = this.props.availableDates;

    let years = YEARS.map(
      (year) => {
        let className = "btn";

        let active = (year in availableYears);
        let selected = this.props.selectedYears.has(year);

        if (active) {
          if (selected) {
            className = className + " btn-warning";
          } else {
            className = className + " btn-light";
          }
        } else {
          className = className + " btn-dark";
        }
        return (
          <button
            key={'year' + year}
            type="button"
            className={className}
            onClick={() => this.props.toggleYear(year)}>
            {year}
          </button>);
      }
    );

    return (
      <div className="btn-group-vertical anos">
        {years}
      </div>);
  }

  renderGroupControls() {
    return (
      <div className="control-container container-fluid group-controls">
        <div className="row">
          <div className="badge">Grupos</div>
        </div>
        <div className="row">
          <div className="col-9">{this.renderGroups()}</div>
          <div className="col-1 group-btn" >
            <i
              className="fa fa-plus-square fa-2x"
              onClick={this.props.addGroup}></i>
          </div>
          <div className="group-btn col-1">
            <i
              className="fa fa-minus-square fa-2x"
              onClick={this.props.removeGroup}></i>
          </div>
          <div className="group-btn col-1">
            <Tooltip
              placement="bottom"
              trigger={["click"]}
              overlay={this.getGroupTooltip()}
            >
              <i className="fa fa-wrench fa-2x"></i>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  getGroupTooltip(){
    let groupName = this.props.groupNames[this.props.currentGroup];
    let nameForm = (
      <div className="input-group mb-3">
        <input type="text" className="form-control" onChange={this.handleChange} value={this.state.value} placeholder={groupName}/>
        <div className="input-group-append">
          <button
            className="btn btn-outline-secondary"
            type="button"
            id="button-addon2"
            onClick={() => this.props.renameGroup(this.state.value)}
          >
            Renombrar
          </button>
        </div>
      </div>);
    return nameForm;
  }

  renderGroups() {
    let className = "groups breadcrumb-item";
    let groups = Object.keys(this.props.groupNames).map(
      (g) => {
        let classNameG, content;
        if (g === this.props.currentGroup){
          classNameG = className +  ' active';
          content = this.props.groupNames[g];
        } else {
          classNameG = className;
          content = <a href="#">{this.props.groupNames[g]}</a>;
        }

        return (
          <li
            key={'group' + g}
            className={classNameG}
            onClick={() => this.props.selectGroup(g)}>
            {content}
          </li>);
      }
    );

    return (
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          {groups}
        </ol>
      </nav>);
  }

  renderDateControls() {
    let infoYears = `Selecciona los años que desees añadir al grupo de datos. Negro indica ausencia de datos, blanco disponibilidad, amarillo seleccionado.`;
    let infoCalendar = `Selecciona los meses que desees añadir al grupo de datos. Negro indica ausencia de datos, blanco disponibilidad, amarillo seleccionado.`;

    return (
      <div className="control-container container-fluid">
        <div className="row">
          <div className="col-3">
            <div className="badge float-left">Año</div>
            <div className="badge float-right">
              <Tooltip placement="top" trigger={["hover"]} overlay={<div className='app-tooltip'>{infoYears}</div>}>
                <i className="fa fa-info"></i>
              </Tooltip>
            </div>
          </div>
          <div className="col-9">
            <div className="badge float-left">Calendario</div>
            <div className="badge float-right">
              <Tooltip placement="top" trigger={["hover"]} overlay={<div className='app-tooltip'>{infoCalendar}</div>}>
                <i className="fa fa-info"></i>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-3">{this.renderYears()}</div>
          <div className="col-9">{this.renderCalendar()}</div>
        </div>
      </div>
    );
  }

  renderOtherControls() {
    return (
      <div className="control-container container-fluid">
        <div className="row">
          <div className="col">
          </div>
          <div className="col">
            <div className="badge">Borrar selección</div>
            <button
              onClick={this.props.removeSelection}
              type="button"
              className="close"
              aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="container-fluid">
        {this.renderGroupControls()}
        {this.renderDateControls()}
        {this.renderOtherControls()}
      </div>);
  }
}


export default Controls;
