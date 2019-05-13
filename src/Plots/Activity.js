import React, { Component } from 'react';
import Plot from 'react-plotly.js';

import List from '../Components/List';
import Card from '../Components/Card';
import translate from '../Components/Translator';

import { MONTHS, addRows } from '../utils';
import './Activity.css';


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
    let groupData, row, x, y, trace, color, name, index, datum, i;
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

        x = [];
        y = [];

        for (i = 0; i < groupData.length; i++) {
          row = groupData[i].slice();
          datum = this.getDisaggregator(row.pop());
          x.push(datum);
          y.push(row[index]);
        }

        color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        name = translate(category) + ' ' + this.props.groupNames[group];

        trace = {
          x: x,
          y: y,
          name: name,
          type: this.state.type,
          marker: {color: color},
        };

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
      <Card
        title="Gráfica de Actividad"
        tooltip=""
        expand={true}
        largeModal={true}
      >
        <Plot
          className='h-100 w-100'
          data={this.getData()}
          layout={this.getLayout()}
          useResizeHandler={true}
        />
      </Card>
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
    let info = `
    Selecciona la clasificación con la que se agrupan los llamados de murcielago. Se muestra la actividad de cada grupo definido.
    `;
    return (
      <Card
        title="Niveles"
        tooltip={info}
        fullWidth={true}
        expand={true}
      >
        <List
          list={this.levels}
          onClick={this.selectLevel}
          selectedItems={[this.state.selectedLevel]}
          color={' list-group-item-info'}
        />
      </Card>
    );
  }

  renderCategories() {
    let info=`
    Selecciona las categorías de la clasificación selecionada a incluir en la gráfica.
    `;

    return (
      <Card
        title="Categorías"
        tooltip={info}
        fullWidth={true}
        expand={true}
      >
        <List
          list={this.categories[this.state.selectedLevel]}
          onClick={this.selectCategory}
          selectedItems={this.state.selectedCategories}
          buttons={true}
        />
      </Card>
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
        tickvals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        ticktext: MONTHS
      };
    } else {
      return {};
    }
  }

  renderDisaggregation() {
    let disaggregationLevels = ['Hora', 'Mes', 'Año', 'No desagregar'];
    let info = `
    Selecciona la escala temporal a la que se desagregan los datos.
    `;

    return (
      <Card
        title='Desagregación'
        tooltip={info}
        fullWidth={true}
        expand={true}
      >
        <List
          list={disaggregationLevels}
          onClick={this.selectDisaggregation}
          selectedItems={this.state.selectedDisaggregation}
          color={' list-group-item-success'}
          removeDisabled={true}
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
    let info = `
    Selecciona la escala temporal a la cual agregar los datos. Se calcula el nivel de actividad en esta escala.
    `;
    return (
      <Card
        title="Agregación"
        tooltip={info}
        fullWidth={true}
        expand={true}
      >
        <List
          list={aggregations}
          onClick={this.selectAggregation}
          selectedItems={this.state.selectedAggregation}
          color={' list-group-item-danger'}
        />
      </Card>
    );
  }

  handleTypeClick(type) {
    this.setState({
      type: type
    });
  }

  render() {
    return (
      <div className="row h-100">
        <div className="col-2 pl-1 pr-1 h-100">
          <div className="row h-50 pb-1">
            {this.renderLevels()}
          </div>
          <div className="row h-50 pt-1">
            {this.renderAggregation()}
          </div>
        </div>
        <div className="col-2 pl-1 pr-1 h-100">
          <div className="row h-50 pb-1">
            {this.renderCategories()}
          </div>
          <div className="row h-50 pt-1">
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

export default ActivityPlot;
