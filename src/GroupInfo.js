import React, { Component } from 'react';

import translate from './Components/Translator';
import { MONTHS } from './utils';

const SEPARATOR = ',';


class GroupInfo extends Component {
  render() {
    let [tableData, summaryData] = this.parseData();
    let years = this.props.selectedYears;
    let months = this.props.selectedMonths;

    return (
      <React.Fragment>
        {this.renderSummary(summaryData)}
        {this.renderDownloadButton(tableData)}
      </React.Fragment>
    );
  }

  renderSummary(data) {
    let summaryData = this.getSummaryData(data);

    return Object.entries(summaryData).map(([title, content]) => {
      return (
        <React.Fragment key={title}>
          <div className="w-100 clearfix">
            <h5 className="float-left">{title}</h5>
            <p className="float-right text-muted">{content}</p>
          </div>
          <hr/>
        </React.Fragment>
      );
    });
  }

  getSummaryData(data) {
    return {
      Nombre: this.props.name,
      Conglomerados: data.conglomerates,
      ANPs: data.anps,
      Años: data.years,
      Meses: data.months,
      Días: data.days,
      Especies: data.species,
      Familias: data.families,
    };
  }

  getCsvHeader() {
    return [
      'Familia',
      'Especie',
      'Dia',
      'Mes',
      'Año',
      'Latitud',
      'Longitud',
      'Incertidumbre',
      'Dieta',
      'ANP'];
  }

  parseData() {
    let aggregatedData = {};
    let selection = this.props.selection;
    selection.forEach((id) => this.addConglomerateInfo(id, aggregatedData));

    let [tableData, summaryData] = this.makeTable(aggregatedData);
    return [tableData, summaryData];
  }

  addConglomerateInfo(id, data) {
    if (!(id in this.props.data)) {
      return;
    }

    if (!(id in data)) {
      data[id] = {};
    }

    this.props.data[id].forEach(row => this.addRowInfo(row, data[id]));
  }

  addRowInfo(row, data) {
    let categories = this.props.categories;

    let date = row[categories.date];
    let [year, month, day] = date.split('-');

    if (!this.props.selectedYears.has(parseInt(year))) {
      return;
    }

    month = MONTHS[parseInt(month) - 1];
    if (!this.props.selectedMonths.has(month)) {
      return;
    }

    if (!(date in data)){
      data[date] = {};
    }

    for (var species in categories.species) {
      if (!(species in data[date])) {
        data[date][species] = 0;
      }

      let value = row[categories.species[species]];
      data[date][species] += value;
    }
  }

  renderDownloadButton(data) {
    let header = this.getCsvHeader();
    data.splice(0, 0, header);

    let csvString = this.getCsvString(data);
    let name = this.getCsvName();

    let csvData = new Blob([csvString], { type: 'text/csv' });
    let csvUrl = URL.createObjectURL(csvData);

    return (
      <a className="card-link" href={csvUrl} target="_blank" rel="noopener noreferrer" download={name}>
        Descargar Datos  <i className="fas fa-download"></i>
      </a>
    );
  }

  getCsvName() {
    return `resumen_${this.props.name}.csv`;
  }

  getCsvString(data) {
    let csvString = '';
    data.forEach((row) => {
      csvString += row.join(SEPARATOR);
      csvString += '\n';
    });

    return csvString;
  }

  makeTable(aggregatedData) {
    let data = [];

    let summary = {
      conglomerates: 0,
      anps: 0,
      years: 0,
      months: 0,
      days: 0,
      species: 0,
      families: 0,
    };

    let anps = new Set();
    let years = new Set();
    let months = new Set();
    let days = new Set();
    let speciesSet = new Set();
    let families = new Set();

    for (var conglomerate_id in aggregatedData) {
      let conglomerate = this.props.conglomeratesData[conglomerate_id];
      let anp = conglomerate.anp_nombre;

      let latitude = conglomerate.grabadora_lat;
      let longitude = conglomerate.grabadora_lon;

      summary.conglomerates += 1;
      if (!(anp === null)) {
        if (!(anps.has(anp))) {
          anps.add(anp);
          summary.anps += 1;
        }
      }

      for (var date in aggregatedData[conglomerate_id]) {
        let [year, month, day] = date.split('-');

        if (!(years.has(year))) {
          years.add(year);
          summary.years += 1;
        }

        if (!(months.has(`${year}-${month}`))) {
          months.add(`${year}-${month}`);
          summary.months += 1;
        }

        if (!(days.has(date))) {
          days.add(date);
          summary.days += 1;
        }

        for (var species in aggregatedData[conglomerate_id][date]) {
          let value = aggregatedData[conglomerate_id][date][species];

          if (value === 0) {
            continue;
          }

          if (!(speciesSet.has(species))) {
            speciesSet.add(species);
            summary.species += 1;
          }

          let family = "";
          let diet = "";

          if (this.props.labellingIsReady) {
            family = this.props.labellingStructure[species].family;
            diet = this.props.labellingStructure[species].eco_feat.diet[0];
          }

          if (!(families.has(family))) {
            families.add(family);
            summary.families += 1;
          }

          data.push([
            family,
            species,
            day,
            month,
            year,
            latitude,
            longitude,
            value,
            translate(diet),
            anp
          ]);
        }
      }
    }

    return [data, summary];
  }
}



export default GroupInfo;
