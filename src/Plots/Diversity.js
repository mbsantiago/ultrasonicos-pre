import React, { Component } from 'react';
import Plot from 'react-plotly.js';

import List from '../Components/List';
import Card from '../Components/Card';

import { MONTHS, addRows, getMean, getStd } from '../utils';

import './Diversity.css';


class DiversityPlot extends Component {
  constructor(props) {
    super(props);

    let categories = {};
    for (var key in props.categories) {
      if (key === 'time' || key === 'date' || key === 'duration' || key === 'bat') continue;
      categories[key] = Object.keys(props.categories[key]);
    }

    this.categories = categories;
    this.levels = Object.keys(categories);
    let level = this.levels[0];

    this.state = {
      selectedLevel: level,
      selectedValue: 'Shannon',
      selectedAggregation: 'Hora',
      selectedDisaggregation: 'Hora',
      disactivatedDisaggregations: [],
      type: 'box',
    };

    this.selectLevel = this.selectLevel.bind(this);
    this.selectDisaggregation = this.selectDisaggregation.bind(this);
    this.selectAggregation = this.selectAggregation.bind(this);

    this.selectValue = this.selectValue.bind(this);
    this.getValue = this.getValueFunction('Shannon');

    this.getAggregator = this.getAggregationFunction('Hora');
    this.getDisaggregator = this.getDisaggregationFunction('Hora');
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
    } else if (agg === 'Mes') {
      return (row) => {
        let date = row[date_col].split('-').slice(0, 2).join('-');
        return date;
      };
    } else if (agg === 'Año') {
      return (row) => {
        let date = row[date_col].split('-')[0];
        return date;
      };
    } else if (agg === 'Todo') {
      return (row) => 'Actividad';
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

  getValueFunction(type) {
    if (type === 'Shannon') {
      return (row, mapping) => {
        let p, col;
        let sum = 0;
        for (let cat in mapping) {
          col = mapping[cat];
          sum += row[col];
        }
        if (sum === 0) return 0;

        let value = 0;
        for (let cat in mapping) {
          col = mapping[cat];
          p = row[col] / sum;
          if (p === 0) continue;
          value += - (p * Math.log(p));
        }
        return value;
      };
    } else if (type === 'Riqueza') {
      return (row, mapping) => {
        let col;
        let sum = 0;
        for (let cat in mapping) {
          col = mapping[cat];
          if (row[col] > 0) {
            sum++;
          }
        }
        return sum;
      };
    } else if (type === 'Simpson') {
      return (row, mapping) => {
        let p, col;
        let sum = 0;
        for (let cat in mapping) {
          col = mapping[cat];
          sum += row[col];
        }

        let value = 0;
        for (let cat in mapping) {
          col = mapping[cat];
          p = row[col] / sum;
          value += p**2;
        }
        return value;
      };
    } else if (type === 'True Diversity') {
      return (row, mapping) => {
        let p, col;
        let sum = 0;
        for (let cat in mapping) {
          col = mapping[cat];
          sum += row[col];
        }
        if (sum === 0) return 0;

        let value = 0;
        for (let cat in mapping) {
          col = mapping[cat];
          p = row[col] / sum;
          if (p === 0) continue;
          value -= (p * Math.log(p));
        }
        return Math.exp(value);
      };
    }
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
    let group, groupData, x, y, row, value, i, key, trace, color, name, agg, err, mean, std;
    let data = this.aggregateData();
    let mapping = this.props.categories[this.state.selectedLevel];
    let plotData = [];

    for (group in data) {
      groupData = data[group];

      if (this.state.type === 'box') {
        x = [];
        y = [];

        for (i = 0; i < groupData.length; i++) {
          row = groupData[i].slice();
          key = this.getDisaggregator(row.pop());
          x.push(key);
          value = this.getValue(row, mapping);
          y.push(value);
        }
      } else if (this.state.type === 'bar') {
        agg = {};

        for (i = 0; i < groupData.length; i++) {
          row = groupData[i].slice();
          key = this.getDisaggregator(row.pop());
          value = this.getValue(row, mapping);

          if (!(key in agg)) {
            agg[key] = [];
          }
          agg[key].push(value);
        }

        x = [];
        y = [];
        err = [];

        for (key in agg) {
          x.push(key);

          mean = getMean(agg[key]);
          std = getStd(agg[key], mean);

          y.push(mean);
          err.push(std);
        }
      }

      color = '#' + Math.floor(Math.random()*16777215).toString(16);
      name = this.props.groupNames[group];

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

    return plotData;
  }

  getLayout() {
    let agg = this.state.selectedAggregation;

    let extra = "";
    if (agg !== 'Todo') {
      extra = ' (por ' + agg.toLowerCase() + ')';
    }
    var layout = {
      yaxis: {
        title: this.state.selectedValue + extra,
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
    let info = ""
    return (
      <Card title="Gráfica de Diversidad" tooltip={info} expand={true} largeModal={true}>
        <Plot
          className='h-100 w-100'
          data={this.getData()}
          layout={this.getLayout()}
          useResizeHandler={true}
        />
      </Card>
    );
  }

  selectLevel(level) {
    this.setState({
      selectedLevel: level,
      selectedCategories: this.categories[level].slice()
    });
  }

  renderLevels() {
    let info = `
    Selecciona la clasificación con la que se agrupan los llamados de murcielago. Se muestra la actividad de cada grupo definido.
    `;
    return (
      <Card
        title="Niveles"
        tooltip={info}
        expand="true"
      >
        <List
          list={this.levels}
          onClick={this.selectLevel}
          selectedItems={[this.state.selectedLevel]}
        />
      </Card>
    );
  }

  getXAxisLayout() {
    if (this.state.selectedDisaggregation === 'Mes') {
      return {
        tickmode: 'array',
        tickvals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        ticktext: MONTHS
      };
    } else {
      return {};
    }
  }

  selectValue(val) {
    this.getValue = this.getValueFunction(val);
    this.setState({selectedValue: val});
  }

  renderValue() {
    let values = ['Shannon', 'Riqueza', 'Simpson', 'True Diversity'];
    let info=`
    Selecciona el indicador de diversidad a graficar.
    `;
    return (
      <Card
        title="Valores"
        tooltip={info}
        expand={true}
      >
        <List
          list={values}
          onClick={this.selectValue}
          selectedItems={this.state.selectedValue}
        />
      </Card>
    );
  }

  handleTypeClick(type) {
    this.setState({
      type: type
    });
  }

  selectDisaggregation(agg) {
    this.getDisaggregator = this.getDisaggregationFunction(agg);
    this.setState({selectedDisaggregation: agg});
  }

  renderDisaggregation() {
    let disaggregationLevels = ['Hora', 'Mes', 'Año', 'No desagregar'];
    let info = `
    Selecciona la escala temporal a la que se desagregan los datos.
    `;
    return (
      <Card
        title="Desagregación"
        tooltip={info}
        expand={true}
      >
        <List
          list={disaggregationLevels}
          onClick={this.selectDisaggregation}
          selectedItems={this.state.selectedDisaggregation}
          disabled={this.state.disabledDisaggregations}
        />
      </Card>
    );
  }

  selectAggregation(agg) {
    let disabled;
    if (agg === 'Hora') {
      disabled = [];
    } else if (agg === 'Día') {
      disabled = ['Hora'];
    } else if (agg === 'Mes') {
      disabled = ['Hora'];
    } else if (agg === 'Año') {
      disabled = ['Hora', 'Mes'];
    } else if (agg === 'Todo') {
      disabled = ['Hora', 'Mes', 'Año'];
    }

    this.getAggregator = this.getAggregationFunction(agg);
    this.setState({
      selectedAggregation: agg,
      disabledDisaggregations: disabled
    });

    if (disabled.indexOf(this.state.selectedDisaggregation) >= 0) {
      if (agg === 'Día') {
        this.selectDisaggregation('Mes');
      } else if (agg === 'Mes')  {
        this.selectDisaggregation('Mes');
      } else if (agg === 'Año')  {
        this.selectDisaggregation('Año');
      } else if (agg === 'Todo')  {
        this.selectDisaggregation('No desagregar');
      }
    }
  }

  renderAggregation() {
    let aggregations = ['Hora', 'Día', 'Mes', 'Año', 'Todo'];
    let info = `
    Selecciona la escala temporal a la cual agregar los datos. Se calcula el nivel de diversidad en esta escala.
    `;
    return (
      <Card
        title="Agregación"
        tooltip={info}
        expand={true}
      >
        <List
          list={aggregations}
          onClick={this.selectAggregation}
          selectedItems={this.state.selectedAggregation}
        />
      </Card>
    );
  }

  render() {
    return (
      <div className="row h-100">
        <div className="col-2 pl-1 pr-1 h-100">
          <div className='row h-50 pb-1'>
            {this.renderLevels()}
          </div>
          <div className='row h-50 pt-1'>
            {this.renderAggregation()}
          </div>
        </div>
        <div className="col-2 pl-1 pr-1 h-100">
          <div className='row h-50 pb-1'>
            {this.renderValue()}
          </div>
          <div className='row h-50 pt-1'>
            {this.renderDisaggregation()}
          </div>
        </div>
        <div className="col-8 h-100">
          {this.renderGraph()}
        </div>
      </div>
    );
  }
}

export default DiversityPlot;
