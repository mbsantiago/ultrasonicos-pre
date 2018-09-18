import React, { Component } from 'react';

import Mapa from './Map';
import Controls from './Controls';


class Middle extends Component {
  render() {
    return (
      <div className="row App-middle-container">
        <div className="col-8 App-map-container middle-box">
          <Mapa
            selection={this.props.selection}
            onSelect={this.props.onSelect}
            anp={this.props.anp}
            clearAnp={this.props.clearAnp}
            anpShapes={this.props.anpShapes}
            anpShapesReady={this.props.anpShapesReady}
        />
        </div>
        <div className="col-4 App-controls-container middle-box">
          <Controls
            removeSelection={this.props.removeSelection}
            addGroup={this.props.addGroup}
            selectGroup={this.props.selectGroup}
            removeGroup={this.props.removeGroup}
            currentGroup={this.props.currentGroup}
            availableDates={this.props.availableDates}
            selectedYears={this.props.selectedYears}
            selectedMonths={this.props.selectedMonths}
            toggleYear={this.props.toggleYear}
            toggleMonth={this.props.toggleMonth}
            groups={this.props.groups}
          />
        </div>
      </div>
    );
  }
}


export default Middle;
