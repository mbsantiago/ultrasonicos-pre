import React, { Component } from 'react';

import Autosuggest from 'react-autosuggest';
import { PulseLoader } from 'react-spinners';
import './Header.css';


class Header extends Component {
  constructor(props){
    super(props);

    this.state = {
      value: '',
      suggestions: []
    };

    this.onChange = this.onChange.bind(this);

    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);

    this.getSuggestionValue = this.getSuggestionValue.bind(this);
    this.renderSuggestion = this.renderSuggestion.bind(this);
  }

  handleClick(value) {
    this.props.selectSuggestion(value);
  }

  renderLoader() {
    if (this.props.loading) {
      return (
        <div className='loader d-inline'>
          <div className='row'>
            <div className='col text-white'>
              Cargando información
            </div>
            <div className='loader-container col'>
              <PulseLoader
                margin="0"
                size={10}
                color="#5cb85c"
              />
            </div>
          </div>
        </div>
      );
    } else {
      return <div></div>;
    }
  }

  render() {
    const { value, suggestions } = this.state;

    const inputProps = {
      placeholder: 'ANP',
      value,
      onChange: this.onChange
    };

    return (
      <nav className="navbar navbar-dark fixed-top bg-dark shadow-sm">
        <a className="navbar-brand" href='/'>Datos Ultrasónicos</a>
        {this.renderLoader()}
        <div className="nav-item btn-toolbar">
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={this.getSuggestionValue}
            renderSuggestion={this.renderSuggestion}
            inputProps={inputProps}
          />
          <button className="search-btn btn btn-link text-warning" onClick={() => this.handleClick(value)}>Centrar</button>
        </div>
      </nav>
    );
  }

  getSuggestions(value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : this.props.sugestions.filter(lang =>
      lang.name.toLowerCase().slice(0, inputLength) === inputValue
    );
  }

  getSuggestionValue(suggestion){
    return suggestion.name;
  }

  renderSuggestion(suggestion) {
    return (
      <div>
        {suggestion.name}
      </div>);
  }

  onChange(event, {newValue}) {
    this.setState({
      value: newValue
    });
  }

  onSuggestionsFetchRequested({ value }) {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  }

  onSuggestionsClearRequested() {
    this.setState({
      suggestions: []
    });
  }
}


export default Header;
