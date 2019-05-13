import React, { Component } from 'react';
import { MONTHS, YEARS } from './utils';
import Tooltip from 'rc-tooltip';

import Card from './Components/Card';
import List from './Components/List';
import Modal from './Components/Modal';
import GroupInfo from './GroupInfo';


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
        color = ' list-group-item-warning';
      } else {
        color = ' list-group-item-light';
      }
    } else {
      color = ' list-group-item-secondary';
    }

    return color;
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
      let columns = row.map((month) => {
        let color = this.getMonthColor(month);

        return (
          <div
            key={`mes-${month}`}
            className={`col p-1 m-1 ${color}`}
            onClick={() => this.props.toggleMonth(month)}>
            {month}
          </div>);
      });

      return (<div className="row" key={'row' + i}>{columns}</div>);
    });

    return (
      <div className="container p-0 text-center">
        {rows}
      </div>
    );
  }

  renderYears() {
    let availableYears = this.props.availableDates;
    let selectedItems = [...this.props.selectedYears.values()];
    let disabled = YEARS.filter(year => !(year in availableYears));

    return (
      <List
        list={YEARS}
        selectedItems={selectedItems}
        buttons={true}
        disabled={disabled}
        onClick={(year) => this.props.toggleYear(year)}
      />);
  }

  renderGroupList() {
    return Object.keys(this.props.groupNames).map(
      (g) => {
        let content = this.props.groupNames[g];
        let active = g === this.props.currentGroup ? " active" : ""

        return (
          <div
            key={'group' + g}
            className={`dropdown-item w-100 text-truncate${active}`}
            onClick={() => this.props.selectGroup(g)}>
            {content}
          </div>);
      }
    );
  }

  renderGroupControls() {
    let name = this.props.groupNames[this.props.currentGroup];
    let groupInfo = "Un grupo es una colección de bla bla bla";

    return (
      <Card title="">
        <ul className="nav justify-content-between h-100 w-100">
          <p className="nav-item btn text-center align-middle h-100 pl-0" style={{fontSize: '15px'}}>
            <Tooltip
              placement="bottom"
              trigger={["hover"]}
              overlay={<div className="App-tooltip">{groupInfo}</div>}
            >
              <span>Grupo</span>
            </Tooltip>
          </p>
          <li className="nav-item" style={{width: '40%'}}>
            <div className="dropdown">
              <Tooltip
                placement="top"
                trigger={["hover"]}
                overlay="seleccionar grupo"
              >
                <button className="btn btn-link dropdown-toggle w-100 text-truncate" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  {name}
                </button>
              </Tooltip>
              <div className="dropdown-menu w-100" aria-labelledby="dropdownMenuButton">
                {this.renderGroupList()}
              </div>
            </div>
          </li>
          <li className="nav-item">
            <Tooltip
              placement="bottom"
              trigger={["hover"]}
              overlay="Añadir grupo"
            >
              <div className="btn btn-link nav-link">
                <i
                  className="fas fa-plus"
                  onClick={this.props.addGroup}>
                </i>
              </div>
            </Tooltip>
          </li>
          <li className="nav-item">
            <Tooltip
              placement="bottom"
              trigger={["hover"]}
              overlay="Eliminar grupo"
            >
              <div className="btn btn-link nav-link">
                <i
                  className="fas fa-minus"
                  onClick={this.props.removeGroup}>
                </i>
              </div>
            </Tooltip>
          </li>
          <li className="nav-item">
            <Tooltip
              placement="bottom"
              trigger={["hover"]}
              overlay="Información del grupo"
            >
              <div className="btn btn-link nav-link" data-toggle="modal" data-target="#groupInfo">
                <i className="fas fa-info"></i>
              </div>
            </Tooltip>
          </li>
          <li className="nav-item pr-0">
            <Tooltip
              placement="left"
              trigger={["click"]}
              overlay={this.getGroupTooltip()}
            >
              <div className="btn btn-link nav-link">
                <i className="fas fa-edit"></i>
              </div>
            </Tooltip>
          </li>
        </ul>
        <Modal title="Información de grupo" id="groupInfo">
          <GroupInfo
            selection={this.props.selection}
            data={this.props.data}
            conglomeratesData={this.props.conglomeratesData}
            name={name}
            categories={this.props.categories}
            labellingIsReady={this.props.labellingIsReady}
            labellingStructure={this.props.labellingStructure}
            selectedYears={this.props.selectedYears}
            selectedMonths={this.props.selectedMonths}
          />
        </Modal>
      </Card>
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
    let className = "groups breadcrumb-item align-middle";
    let groups = Object.keys(this.props.groupNames).map(
      (g) => {
        let classNameG, content;
        if (g === this.props.currentGroup){
          classNameG = className +  ' active';
          content = this.props.groupNames[g];
        } else {
          classNameG = className;
          content = <div className="btn btn-link">{this.props.groupNames[g]}</div>;
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
      <nav className="h-100" aria-label="breadcrumb">
        <ol className="breadcrumb mb-0 h-100">
          {groups}
        </ol>
      </nav>);
  }

  renderDateControls() {
    let infoYears = `Selecciona los años que desees añadir al grupo de datos. Negro indica ausencia de datos, blanco disponibilidad, amarillo seleccionado.`;
    let infoCalendar = `Selecciona los meses que desees añadir al grupo de datos. Negro indica ausencia de datos, blanco disponibilidad, amarillo seleccionado.`;

    return (
      <React.Fragment>
        <div className="col-3 pl-0 pr-1 h-100">
          <Card
            title="Año"
            tooltip={infoYears}
          >
            {this.renderYears()}
          </Card>
        </div>
        <div className="col-9 pr-0 pl-1 h-100">
          <Card
            title="Calendario"
            tooltip={infoCalendar}
          >
            {this.renderCalendar()}
          </Card>
        </div>
      </React.Fragment>
    );
  }

  render() {
    return (
      <React.Fragment>
        <div className="row mb-1 h-25">
          {this.renderGroupControls()}
        </div>
        <div className="row h-75">
          {this.renderDateControls()}
        </div>
      </React.Fragment>
    );
  }
}


export default Controls;
