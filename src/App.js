import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import Header from './Header';
import Middle from './Middle';
import Content from './Content';
import Footer from './Footer';
import {
  CONGLOMERATE_DATA_URL,
  ANPS_URL,
  DATA_STRUCTURE_URL,
  MONTHS } from './utils';

import './App.css';


class App extends Component {
  constructor(props) {
    super(props);

    this.state= {
      selections: [[]],
      currentSelection: 0,
      anpShapesReady: false,
      categoriesLoaded: false,
      anp: null,
      selectedYears: [[]],
      selectedMonths: [[]],
      loading: false,
    };

    this.categories = null;
    this.anpShapes = null;
    this.availableDates = {0: {}};
    this.conglomerateData = {};

    this.onSelect = this.onSelect.bind(this);
    this.selectSuggestion = this.selectSuggestion.bind(this);
    this.clearAnp = this.clearAnp.bind(this);
    this.removeSelection = this.removeSelection.bind(this);

    this.selectGroup = this.selectGroup.bind(this);
    this.addGroup = this.addGroup.bind(this);
    this.removeGroup = this.removeGroup.bind(this);

    this.toggleYear = this.toggleYear.bind(this);
    this.toggleMonth = this.toggleMonth.bind(this);
  }

  aggregateGroupData() {
    if (!this.state.categoriesReady) return null;

    let selectedYears, selectedMonths, id, conglomerateData, recData, year, month, monthName, split;
    let date_column = this.categories.date;
    var data = {};
    let selections = this.state.selections;

    for (var group = 0; group < selections.length; group++) {
      selectedYears = this.state.selectedYears[group];
      selectedMonths = this.state.selectedMonths[group];

      data[group] = [];

      for (var j = 0; j < selections[group].length; j++) {
        id = selections[group][j];

        if (id in this.conglomerateData) {
          conglomerateData = this.conglomerateData[id];

          for (var k = 0; k < conglomerateData.length; k++) {
            recData = conglomerateData[k];

            split = recData[date_column].split('-').map((x) => parseInt(x, 10));
            year = split[0];
            month = split[1] - 1;

            if (selectedYears.indexOf(year) >= 0) {
              monthName = MONTHS[month];
              if (selectedMonths.indexOf(monthName) >= 0) {
                data[group].push(recData);
              }
            }
          }
        }
      }
    }
    return data;
  }

  componentDidMount() {
    this.loadCategories();
    this.loadAnpShapes();
  }

  loadCategories() {
    fetch(DATA_STRUCTURE_URL)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Data Structure: error at loading');
        }
      })
      .then(data => {
        this.categories = data;
        this.setState({
          categoriesReady: true,
        });
      });
  }

  loadAnpShapes() {
    fetch(ANPS_URL)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('ANP Shapes error at loading');
        }
      })
      .then(data => {
        if (data !== null) {
          this.anpShapes = data;
          this.setState({
            anpShapesReady: true});
        }
      });
  }

  loadConglomerateData(id) {
    let url = CONGLOMERATE_DATA_URL + '?id=' + id;
    this.setState({loading: true});
    fetch(url)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Conglomerates: error at loading');
        }
      })
      .then(data => {
        if (data !== null) {
          this.conglomerateData[id] = data;
        }
      })
      .then(() => this.checkFinishedLoading());
  }

  removeSelection(){
    this.setState(state => {
      let selections = state.selections;
      let selectedYears = state.selectedYears;
      let selectedMonths = state.selectedMonths;

      selections[state.currentSelection] = [];
      selectedYears[state.currentSelection] = [];
      selectedMonths[state.currentSelection] = [];
      this.availableDates[state.currentSelection] = {};
      return {
        selections: selections,
        selectedYears: selectedYears,
        selectedMonths: selectedMonths,
      };
    });
  }

  onSelect(id) {
    this.setState(
      state => {
        let array = state.selections;
        let index = array[state.currentSelection].indexOf(id);

        if (!(id in this.conglomerateData)) {
          this.loadConglomerateData(id);
        }

        if (index >= 0) {
          array[state.currentSelection].splice(index, 1);
        } else {
          array[state.currentSelection].push(id);
        }

        this.availableDates[state.currentSelection] = this.getAvailableDates(array[state.currentSelection]);
        return {selections: array};
      }
    );
  }

  getSuggestions() {
    if (this.state.anpShapesReady) {
      let names = this.anpShapes[0].features.map(
        feature => ({
          name: feature.properties.nombre,
          id: feature.properties.id_07})
      );
      return names;
    } else {
      return [];
    }
  }

  clearAnp() {
    this.setState({anp: null});
  }

  selectSuggestion(selection) {
    this.setState({anp: selection});
  }

  addGroup() {
    this.setState((state) => {
      let selections = state.selections;
      let selectedYears = state.selectedYears;
      let selectedMonths = state.selectedMonths;

      selections.push([]);
      selectedYears.push([]);
      selectedMonths.push([]);

      let groupNmb = selections.length - 1;
      this.availableDates[groupNmb] = {};

      return {
        currentSelection: (selections.length - 1),
        selections: selections,
        selectedYears: selectedYears,
        selectedMonths: selectedMonths,
      };
    });
  }

  removeGroup() {
    if (this.state.selections.length > 1){
      this.setState((state) => {
        let selections = state.selections.slice(0, -1);
        let selectedYears = state.selectedYears.slice(0, -1);
        let selectedMonths = state.selectedMonths.slice(0, -1);

        return {
          selections: selections,
          selectedYears: selectedYears,
          selectedMonths: selectedMonths,
          currentSelection: 0,
        };
      });
    }
  }

  selectGroup(g) {
    this.setState({currentSelection: g});
  }

  getAvailableDates(ids) {
    let split, year, month;

    if (!this.state.categoriesReady) return [];
    let date_col = this.categories.date;

    var dates = {};

    ids.map((id) => {
      if (id in this.conglomerateData) {
        this.conglomerateData[id].map((rec) => {
          split = rec[date_col].split("-");
          year = parseInt(split[0], 10);

          if (isNaN(year)) return null;

          month = parseInt(split[1], 10) - 1;

          if (!(year in dates)) {
            dates[year] = new Set();
          }

          dates[year].add(MONTHS[month]);
          return null;
        });
      }
      return null;
    });

    for (year in dates) {
      dates[year] = [...dates[year].values()];
    }

    return dates;
  }

  toggleYear(year) {
    let dates = this.availableDates[this.state.currentSelection];
    if (year in dates) {
      this.setState(
        state => {
          let selected = state.selectedYears;
          let currSelection = selected[this.state.currentSelection];
          let index = currSelection.indexOf(year);

          if (index >= 0) {
            currSelection.splice(index, 1);
          } else {
            currSelection.push(year);
          }

          selected[this.state.currentSelection] = currSelection;
          return {selectedYears: selected};
        }
      );
    }
  }

  toggleMonth(month) {
    let dates = this.availableDates[this.state.currentSelection];
    let available = false;
    for (let year in dates) {
      if (dates[year].indexOf(month) >= 0) {
        available = true;
        break;
      }
    }

    if (available) {
      this.setState(
        state => {
          let selected = state.selectedMonths;
          let currSelection = selected[this.state.currentSelection];
          let index = currSelection.indexOf(month);

          if (index >= 0) {
            currSelection.splice(index, 1);
          } else {
            currSelection.push(month);
          }

          selected[this.state.currentSelection] = currSelection;

          return {selectedMonths: selected};
        }
      );
    }
  }

  checkFinishedLoading() {
    let selection = this.state.selections[this.state.currentSelection];

    let finished = true;
    for (var i=0; i < selection.length; i++) {
      if (!(selection[i] in this.conglomerateData)) {
        finished = false;
      }
    }

    if (finished) {
      this.availableDates[this.state.currentSelection] = this.getAvailableDates(this.state.selections[this.state.currentSelection]);
      this.setState({loading: false});
    }
  }

  render() {
    let selection = this.state.selections[this.state.currentSelection];

    return (
      <div className="App">
        <Header
          sugestions={this.getSuggestions()}
          selectSuggestion={this.selectSuggestion}
          loading={this.state.loading}/>
        <div className="container-fluid App-container">
          <Middle
            selection={selection}
            onSelect={this.onSelect}
            anp={this.state.anp}
            clearAnp={this.clearAnp}
            removeSelection={this.removeSelection}
            addGroup={this.addGroup}
            removeGroup={this.removeGroup}
            selectGroup={this.selectGroup}
            availableDates={this.availableDates[this.state.currentSelection]}
            selectedYears={this.state.selectedYears[this.state.currentSelection]}
            selectedMonths={this.state.selectedMonths[this.state.currentSelection]}
            toggleYear={this.toggleYear}
            toggleMonth={this.toggleMonth}
            currentGroup={this.state.currentSelection}
            groups={[...this.state.selections.keys()]}
            anpShapes={this.anpShapes}
            anpShapesReady={this.state.anpShapesReady}
          />
          <Content
            data={this.aggregateGroupData()}
            categories={this.categories}
            categoriesReady={this.state.categoriesReady}
          />
          <Footer/>
        </div>
      </div>
    );
  }
}

export default App;
