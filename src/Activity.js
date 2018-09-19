import React, { Component } from 'react';
import Plot from 'react-plotly.js';

import List from './List';
import { MONTHS } from './utils';
import './Activity.css';


function addRows(row1, row2) {
  return row1.map((x, i) => x + row2[i]);
}


class ActivityPlot extends Component {
  constructor(props) {
    super(props);

    let categories = {};
    for (var key in props.categories) {
      if (key === 'time' || key === 'date' || key === 'duration') continue;
      categories[key] = Object.keys(props.categories[key]);
    }

    this.categories = categories;
    this.levels = Object.keys(categories);

    let level = this.levels[0];
    let selectedCategories = categories[level].slice();

    this.state = {
      selectedLevel: level,
      selectedCategories: selectedCategories,
      selectedAggregation: 'Hora',
      selectedDisaggregation: 'Hora',
      disabledDisaggregations: [],
      type: 'box',
    };

    this.selectLevel = this.selectLevel.bind(this);
    this.selectDisaggregation = this.selectDisaggregation.bind(this);
    this.selectAggregation = this.selectAggregation.bind(this);

    this.selectCategory = this.selectCategory.bind(this);

    this.getAggregator = this.getAggregationFunction('Hora');
    this.getDisaggregator = this.getDisaggregationFunction('Hora');
  }

  aggregateData() {
    let i, row2, row, key, groupData, agg, rows;
    let data = this.props.data;
    let newData = {};

    let date_col = this.props.categories.date;
    let time_col = this.props.categories.time;
    let duration_col = this.props.categories.duration;

    for (var group in data) {
      groupData = data[group];
      agg = {};

      for (i = 0; i < groupData.length; i++) {
        row = groupData[i].slice();
        key = this.getAggregator(row);

        row[date_col] = 0;
        row[time_col] = 0;
        row[duration_col] = 0;

        if (!(key in agg)) {
          agg[key] = row;
        } else {
          agg[key] = addRows(agg[key], row);
        }
      }

      rows = [];
      for (key in agg) {
        row2 = agg[key].slice();
        row2.push(key);
        row2.push(key);

        rows.push(row2);
      }

      newData[group] = rows;
    }

    return newData;
  }

  getData() {
    let groupData, row, x, y, trace, color, name, groupNmbr, index, datum, mean, std, err, agg, i;
    let data = this.aggregateData();
    let mapping = this.props.categories[this.state.selectedLevel];
    let plotData = [];

    for (var group in data){
      groupData = data[group];

      for (var category in mapping) {
        if (this.state.selectedCategories.indexOf(category) < 0) {
          continue;
        }

        index = mapping[category];

        if (this.state.type === 'box') {
          x = [];
          y = [];

          for (i = 0; i < groupData.length; i++) {
            row = groupData[i].slice();
            datum = this.getDisaggregator(row.pop());
            x.push(datum);
            y.push(row[index]);
          }
        } else if (this.state.type === 'bar') {
          agg = {};

          for (i = 0; i < groupData.length; i++) {
            row = groupData[i].slice();
            datum = this.getDisaggregator(row.pop());

            if (!(datum in agg)) {
              agg[datum] =  [];
            }
            agg[datum].push(row[index]);
          }

          x = [];
          y = [];
          err = [];

          for (var key in agg) {
            x.push(key);

            mean = agg[key].reduce((sum, x) => (sum + x), 0) / agg[key].length;
            std = Math.sqrt(agg[key].reduce((mse, x) => (mse + (x - mean)**2)) / (agg[key].length - 1));

            y.push(mean);
            err.push(std);
          }
        }

        color = '#' + Math.floor(Math.random()*16777215).toString(16);
        groupNmbr = parseInt(group, 10) + 1;
        name = category + ' grupo ' + groupNmbr;

        trace = {
          x: x,
          y: y,
          name: name,
          type: this.state.type,
          marker: {color: color},
        };

        if (this.state.type === 'bar') {
          trace['error_y'] = {
            type: 'data',
            array: err,
            visible: true,
          };
        }

        plotData.push(trace);
      }
    }
    return plotData;
  }

  getAggregationFunction(agg) {
    let date_col = this.props.categories.date;
    let time_col = this.props.categories.time;

    if (agg === 'Hora') {
      return (row) => {
        let date = row[date_col];
        let time = row[time_col].split(':')[0];
        return `${date}-${time}`;
      };
    } else if (agg === 'Día') {
      return (row) => {
        let date = row[date_col];
        return date;
      };
    }
  }

  getDisaggregationFunction(agg){
    if (agg === 'Hora') {
      return (datum) => {
        return parseInt(datum.split('-').pop(), 10);
      };
    } else if (agg === 'Año') {
      return (datum) => {
        return parseInt(datum.split('-')[0], 10);
      };
    } else if (agg === 'Mes') {
      return (datum) => {
        return parseInt(datum.split('-')[1], 10);
      };
    } else if (agg === 'No desagregar') {
      return (datum) => 'Actividad';
    }
  }

  getLayout() {
    var layout = {
      yaxis: {
        title: 'Pasos por ' + this.state.selectedAggregation,
        zeroline: false
      },
      margin: {
        l: 70,
        r: 20,
        b: 30,
        t: 20,
        pad: 5
      },
    };

    let key = this.state.type + 'mode';
    layout[key] = 'group';
    layout['xaxis'] = this.getXAxisLayout();
    return layout;
  }

  renderGraph() {
    return (
      <Plot
        className='App-plot'
        data={this.getData()}
        layout={this.getLayout()}
      />
    );
  }

  selectCategory(cat) {
    this.setState((state) => {
      let selectedCategories = state.selectedCategories;
      let index = selectedCategories.indexOf(cat);
      if (index >= 0) {
        selectedCategories.splice(index, 1);
      } else {
        selectedCategories.push(cat);
      }

      return {selectedCategories: selectedCategories};
    });
  }

  selectLevel(level) {
    this.setState({
      selectedLevel: level,
      selectedCategories: this.categories[level].slice()
    });
  }

  renderLevels() {
    return (
      <List
        list={this.levels}
        title={'Niveles'}
        onClick={this.selectLevel}
        selectedItems={[this.state.selectedLevel]}
        color={' list-group-item-info'}
      />
    );
  }

  renderCategories() {
    return (
      <List
        list={this.categories[this.state.selectedLevel]}
        title={'Categorías'}
        onClick={this.selectCategory}
        selectedItems={this.state.selectedCategories}
        color={' list-group-item-warning'}
      />
    );
  }

  selectDisaggregation(agg) {
    this.getDisaggregator = this.getDisaggregationFunction(agg);
    this.setState({selectedDisaggregation: agg});
  }

  getXAxisLayout() {
    if (this.state.selectedDisaggregation === 'Mes') {
      return {
        tickmode: 'array',
        tickvals: [...MONTHS.keys()],
        ticktext: MONTHS
      };
    } else {
      return {};
    }
  }

  renderDisaggregation() {
    let disaggregationLevels = ['Hora', 'Mes', 'Año', 'No desagregar'];
    return (
      <List
        list={disaggregationLevels}
        title={'Desagregar por'}
        onClick={this.selectDisaggregation}
        selectedItems={this.state.selectedDisaggregation}
        color={' list-group-item-success'}
        disabled={this.state.disabledDisaggregations}
      />
    );
  }

  selectAggregation(agg) {
    let disabled;
    if (agg === 'Hora') {
      disabled = [];
    } else if (agg === 'Día') {
      disabled = ['Hora'];
    }

    this.getAggregator = this.getAggregationFunction(agg);
    this.setState({
      selectedAggregation: agg,
      disabledDisaggregations: disabled
    });

    if (disabled.indexOf(this.state.selectedDisaggregation) >= 0) {
      if (agg === 'Día') {
        this.selectDisaggregation('Mes');
      }
    }
  }

  renderAggregation() {
    let aggregations = ['Hora', 'Día'];
    return (
      <List
        list={aggregations}
        title={'Agregar por'}
        onClick={this.selectAggregation}
        selectedItems={this.state.selectedAggregation}
        color={' list-group-item-danger'}
      />
    );
  }

  handleTypeClick(type) {
    this.setState({
      type: type
    });
  }

  renderTypeButtons() {
    let inputs = [['caja', 'box'], ['barra', 'bar']].map((type) => {
      return (
        <div key={'form'+type} className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="inlineRadioOptions"
            onClick={() => this.handleTypeClick(type[1])}
            id={type[0]} value={type[0]}/>
          <label className="form-check-label" htmlFor={type[0]}>{type[0]}</label>
        </div>
      );
    });

    return (
      <div className="container type-buttons-container">
        {inputs}
      </div>
    );
  }

  render() {
    return (
      <div className="container-fluid graph-container">
        <div className="row graph-row">
          <div className="col-2 content-column">
            <div className='list-container-50'>
              {this.renderLevels()}
            </div>
            <div className='list-container-50'>
              {this.renderAggregation()}
            </div>
          </div>
          <div className="col-2 content-column">
            <div className='list-container-50'>
              {this.renderCategories()}
            </div>
            <div className='list-container-50'>
              {this.renderDisaggregation()}
            </div>
          </div>
          <div className="col-8 plot-container">
            <div className="row type-row">
              {this.renderTypeButtons()}
            </div>
            <div className="row graph-row">
              {this.renderGraph()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ActivityPlot;
