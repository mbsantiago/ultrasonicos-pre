import React, { Component } from 'react';
import { PulseLoader } from 'react-spinners';
import List from './List';

import ActivityPlot from './Activity';
import CompositionPlot from './Composition';
import DiversityPlot from './Diversity';

import './Content.css';


class Content extends Component {
  constructor(props) {
    super(props);

    this.state = {
      graph: 'Actividad',
    };

    this.selectGraph = this.selectGraph.bind(this);
  }

  selectGraph(graph) {
    this.setState({graph: graph});
  }

  renderGraphList() {
    const graphs = ['Actividad', 'Composición', 'Diversidad'];
    const info = `
    Seleccióna la gráfica a mostrar.
    `;

    return (
      <List
        list={graphs}
        title={'Gráfica'}
        selectedItems={[this.state.graph]}
        onClick={this.selectGraph}
        color={' list-group-item-primary'}
        info={info}
      />
    );
  }

  renderGraph() {
    if (this.props.categoriesReady) {
      if (this.state.graph === 'Actividad') {
        return (
          <ActivityPlot
            data={this.props.data}
            categories={this.props.categories}
            groupNames={this.props.groupNames}
          />
        );
      } else if (this.state.graph === 'Composición') {
        return (
          <CompositionPlot
            data={this.props.data}
            categories={this.props.categories}
            groupNames={this.props.groupNames}
          />
        );
      } else if (this.state.graph === 'Diversidad') {
        return (
          <DiversityPlot
            data={this.props.data}
            categories={this.props.categories}
            groupNames={this.props.groupNames}
          />
        );
      }
    } else {
      let style = {
        width: "100%",
        height: "100%",
        "textAlign": "center",
        "verticalAlign": "middle",
      };
      return <div style={style}><PulseLoader color={'#123abc'}/></div>;
    }
  }

  render() {
    return (
      <div className="App-content-container container-fluid">
        <div className='row App-content-row'>
          <div className="content-column col-1">
            {this.renderGraphList()}
          </div>
          <div className="content-column col-11">
            {this.renderGraph()}
          </div>
        </div>
      </div>
    );
  }
}


export default Content;
