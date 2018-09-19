import React, { Component } from 'react';
import { MONTHS, YEARS } from './utils';

import './Controls.css';


class Controls extends Component {
  constructor(props) {
    super(props);

    this.state = {
      strict: false
    };

    this.handleStrictChange = this.handleStrictChange.bind(this);
  }

  handleStrictChange(strict) {
    this.setState({strict});
  }


  getAvailableMonths() {
    let months = new Set();
    this.props.selectedYears.map((year) => {
      this.props.availableDates[year].map((month) => {
        months.add(month);
        return null;
      });
      return null;
    });

    return [...months.values()];
  }

  renderCalendar() {
    let months = [
      MONTHS.slice(0, 3),
      MONTHS.slice(3, 6),
      MONTHS.slice(6, 9),
      MONTHS.slice(9, 12),
    ];

    let activeMonths = this.getAvailableMonths();

    let rows = months.map((row, i) => {
      let color;
      let columns = row.map((month, j) => {
        let round = '';
        if (activeMonths.indexOf(month) >= 0) {
          if (this.props.selectedMonths.indexOf(month) >= 0) {
            color = ' bg-warning';
          } else {
            color = ' bg-light';
          }
        } else {
          color = ' bg-dark text-white';
        }

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
    let availableYears = Object.keys(this.props.availableDates).map((year) => parseInt(year, 10));

    let years = YEARS.map(
      (year) => {
        let className = "btn";

        let active = availableYears.indexOf(year) >= 0;
        let selected = this.props.selectedYears.indexOf(year) >= 0;

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
          <div className="col-10">{this.renderGroups()}</div>
          <div className="col-1 group-btn" >
            <i
              className="fa fa-plus-square fa-align-left fa-2x"
              onClick={this.props.addGroup}></i>
          </div>
          <div className="group-btn col-1">
            <i
              className="fa fa-minus-square fa-align-left fa-2x"
              onClick={this.props.removeGroup}></i>
          </div>
        </div>
      </div>
    );
  }

  renderGroups() {
    let className = "groups breadcrumb-item";
    let groups = this.props.groups.map(
      (g) => {
        let classNameG, content;
        if (g === this.props.currentGroup){
          classNameG = className +  ' active';
          content = (g + 1);
        } else {
          classNameG = className;
          content = <a href="#">{(g + 1)}</a>;
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
    return (
      <div className="control-container container-fluid">
        <div className="row">
          <div className="col-3"><div className="badge">Años</div></div>
          <div className="col-9"><div className="badge">Calendario</div></div>
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
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="exampleCheck1"/>
              <label className="form-check-label" htmlFor="exampleCheck1"><div className="badge">Estricto</div></label>
            </div>
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
