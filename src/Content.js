import React, { Component } from 'react';
import { PulseLoader } from 'react-spinners';

import ActivityPlot from './Plots/Activity';
import CompositionPlot from './Plots/Composition';
import DiversityPlot from './Plots/Diversity';

import List from './Components/List';
import Card from  './Components/Card';


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
    return (
      <List
        list={graphs}
        selectedItems={[this.state.graph]}
        onClick={this.selectGraph}
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
            labellingIsReady={this.props.labellingIsReady}
            labellingStructure={this.props.labellingStructure}
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
      return (
        <div className="container text-center pt-5">
          <PulseLoader color={'#123abc'}/>
        </div>);
    }
  }

  render() {
    const info = `Seleccióna la gráfica a mostrar.`;

    return (
      <div className="row p-0 h-50 pb-1">
        <div className="col-2 h-100">
          <Card
            title="Gráfica"
            tooltip={info}
            fullWidth={true}
          >
            {this.renderGraphList()}
          </Card>
        </div>
        <div className="col-10 p-0 h-100">
          {this.renderGraph()}
        </div>
      </div>
    );
  }
}


export default Content;
