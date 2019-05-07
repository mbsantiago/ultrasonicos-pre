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


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

class App extends Component {
  constructor(props) {
    super(props);

    let group = uuidv4();
    let groups = new Set([group]);

    let selections = {};
    selections[group] = new Set();

    let selectedYears = {};
    selectedYears[group] = new Set();

    let selectedMonths = {};
    selectedMonths[group] = new Set();

    let groupNames = {};
    groupNames[group] = 'G-' + group.slice(0, 2);

    this.availableDates = {};
    this.availableDates[group] = {};

    this.state= {
      groups: groups,
      groupNames: groupNames,
      selections: selections,
      currentSelection: group,
      selectedYears: selectedYears,
      selectedMonths: selectedMonths,
      anpShapesReady: false,
      categoriesLoaded: false,
      anp: null,
      centerOnGroup: false,
      loading: false,
    };

    this.categories = null;
    this.anpShapes = null;
    this.anpSuggestions = [];
    this.conglomerateData = {};

    this.onSelect = this.onSelect.bind(this);
    this.selectSuggestion = this.selectSuggestion.bind(this);
    this.clearAnp = this.clearAnp.bind(this);
    this.removeSelection = this.removeSelection.bind(this);

    this.selectGroup = this.selectGroup.bind(this);
    this.addGroup = this.addGroup.bind(this);
    this.removeGroup = this.removeGroup.bind(this);
    this.renameGroup = this.renameGroup.bind(this);

    this.toggleYear = this.toggleYear.bind(this);
    this.toggleMonth = this.toggleMonth.bind(this);

    this.doneCentering = this.doneCentering.bind(this);
  }

  aggregateGroupData() {
    let group;

    if (!this.state.categoriesReady) return null;

    let selectedYears, selectedMonths, conglomerateData, recData, year, month, monthName, split;
    let date_column = this.categories.date;
    var data = {};
    let selections = this.state.selections;

    for (group in selections) {
      selectedYears = this.state.selectedYears[group];
      selectedMonths = this.state.selectedMonths[group];

      data[group] = [];
      selections[group].forEach((id) => {
        if (id in this.conglomerateData) {
          conglomerateData = this.conglomerateData[id];

          for (var k = 0; k < conglomerateData.length; k++) {
            recData = conglomerateData[k];

            split = recData[date_column].split('-');
            year = parseInt(split[0], 10);
            month = parseInt(split[1], 10) - 1;

            if (selectedYears.has(year)) {
              monthName = MONTHS[month];
              if (selectedMonths.has(monthName)) {
                data[group].push(recData);
              }
            }
          }
        }
      });
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
          this.anpSuggestions = this.getSuggestions();
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

      selections[state.currentSelection].clear();
      selectedYears[state.currentSelection].clear();
      selectedMonths[state.currentSelection].clear();
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
        let all_selections = state.selections;
        let selection = all_selections[state.currentSelection];

        if (!(id in this.conglomerateData)) {
          this.loadConglomerateData(id);
        }

        if (selection.has(id)) {
          selection.delete(id);
        } else {
          selection.add(id);
        }

        this.availableDates[state.currentSelection] = this.getAvailableDates(selection);
        return {selections: all_selections};
      }
    );
  }

  getSuggestions() {
    if (this.state.anpShapesReady) {
      let names = this.anpShapes[0].features
        .filter(
          feature => feature.geometry !== null
        )
        .map(
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
      let groups = state.groups;
      let groupNames = state.groupNames;

      let newGroup = uuidv4();

      groups.add(newGroup);
      selections[newGroup] = new Set();
      selectedYears[newGroup] = new Set();
      selectedMonths[newGroup] = new Set();
      groupNames[newGroup] = 'G-' + newGroup.slice(0, 2);

      this.availableDates[newGroup] = {};

      return {
        currentSelection: newGroup,
        groups: groups,
        selections: selections,
        selectedYears: selectedYears,
        selectedMonths: selectedMonths,
      };
    });
  }

  removeGroup() {
    this.setState((state) => {
      let newSelection;

      let group = state.currentSelection;
      let groups = state.groups;

      let groupNames = state.groupNames;
      let selections = state.selections;
      let selectedYears = state.selectedYears;
      let selectedMonths = state.selectedMonths;

      groups.delete(group);
      delete groupNames[group];
      delete selections[group];
      delete selectedYears[group];
      delete selectedMonths[group];
      delete this.availableDates[group];

      if (groups.size === 0) {
        newSelection = uuidv4();

        groups.add(newSelection);
        selections[newSelection] = new Set();
        selectedYears[newSelection] = new Set();
        selectedMonths[newSelection] = new Set();
        groupNames[newSelection] = 'G-' + newSelection.slice(0, 2);

        this.availableDates[newSelection] = {};
      } else {
        newSelection = groups.values().next().value;
      }

      return {
        groups: groups,
        selections: selections,
        selectedYears: selectedYears,
        selectedMonths: selectedMonths,
        currentSelection: newSelection,
      };
    });
  }

  selectGroup(g) {
    this.setState(state => {
      if (state.selections[g].size > 0) {
        return {
          currentSelection: g,
          centerOnGroup: true};
      } else {
        return {currentSelection: g};
      }
    });
  }

  renameGroup(name) {
    this.setState(state => {
      let group = state.currentSelection;
      let groupNames = state.groupNames;

      groupNames[group] = name;
      return {groupNames: groupNames};
    });
  }

  getAvailableDates(ids) {
    let split, year, month;

    if (!this.state.categoriesReady) return [];
    let date_col = this.categories.date;

    var dates = {};

    ids.forEach((id) => {
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

    return dates;
  }

  toggleYear(year) {
    let dates = this.availableDates[this.state.currentSelection];

    if (year in dates) {
      this.setState(
        state => {
          let selected = state.selectedYears;
          let currSelection = selected[this.state.currentSelection];

          if (currSelection.has(year)) {
            currSelection.delete(year);
          } else {
            currSelection.add(year);
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
      if (dates[year].has(month)) {
        available = true;
        break;
      }
    }

    if (available) {
      this.setState(
        state => {
          let selected = state.selectedMonths;
          let currSelection = selected[this.state.currentSelection];

          if (currSelection.has(month)) {
            currSelection.delete(month);
          } else {
            currSelection.add(month);
          }

          selected[this.state.currentSelection] = currSelection;

          return {selectedMonths: selected};
        }
      );
    }
  }

  doneCentering(){
    this.setState({centerOnGroup: false});
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
          sugestions={this.anpSuggestions}
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
            groupNames={this.state.groupNames}
            currentGroup={this.state.currentSelection}
            groups={this.state.groups}
            anpShapes={this.anpShapes}
            anpShapesReady={this.state.anpShapesReady}
            centerOnGroup={this.state.centerOnGroup}
            doneCentering={this.doneCentering}
            renameGroup={this.renameGroup}
          />
          <Content
            data={this.aggregateGroupData()}
            groupNames={this.state.groupNames}
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
