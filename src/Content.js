import React, { Component } from 'react';
import List from './List';
import BaseGraph from './BaseGraph';

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
    const graphs = ['Actividad', 'Composicion (Sankey)'];

    return (
      <List
        list={graphs}
        title={'Gráfica'}
        selectedItems={[this.state.graph]}
        onClick={this.selectGraph}
        color={' list-group-item-primary'}
      />
    );
  }

  renderGraph() {
    if (this.props.categoriesReady) {
      if (this.state.graph === 'Actividad') {
        return (
          <BaseGraph
            data={this.props.data}
            categories={this.props.categories}
          />
        );
      }
    } else {
      return "loading";
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
