import React, { Component } from 'react';

import Mapa from './Map';
import Controls from './Controls';


class Middle extends Component {
  render() {
    return (
      <div className="row h-50 mb-2 mt-3">
        <div className="col-7 App-map-container">
          <Mapa
            selection={this.props.selection}
            onSelect={this.props.onSelect}
            anp={this.props.anp}
            clearAnp={this.props.clearAnp}
            anpShapes={this.props.anpShapes}
            anpShapesReady={this.props.anpShapesReady}
            centerOnGroup={this.props.centerOnGroup}
            doneCentering={this.props.doneCentering}
            conglomeratesData={this.props.conglomeratesData}
            conglomeratesDataReady={this.props.conglomeratesDataReady}
            conglomeratesError={this.props.conglomeratesError}
            removeAllConglomerates={this.props.removeAllConglomerates}
            selectAllConglomerates={this.props.selectAllConglomerates}
          />
        </div>
        <div className="col-5 h-100">
          <Controls
            groupNames={this.props.groupNames}
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
            renameGroup={this.props.renameGroup}
            selection={this.props.selection}
            conglomeratesData={this.props.parsedConglomerateData}
            data={this.props.conglomerateData}
            categories={this.props.categories}
            labellingIsReady={this.props.labellingIsReady}
            labellingStructure={this.props.labellingStructure}
          />
        </div>
      </div>
    );
  }
}


export default Middle;
