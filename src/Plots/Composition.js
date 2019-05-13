import React, { Component } from 'react';

import * as d3 from 'd3';
import * as d3sankey from 'd3-sankey';

import List from '../Components/List';
import Card from '../Components/Card';
import translate from '../Components/Translator';

import './Composition.css';


class CompositionPlot extends Component {
  constructor(props){
    super(props);
    this.data = props.data;
    let group = Object.keys(this.data)[0];

    this.createPlot = this.createPlot.bind(this);
    this.width = "100%";

    this.state = {
      type: 'Taxonomía',
      group: group,
    };

    this.myRef = React.createRef();
    this.handleTypeClick = this.handleTypeClick.bind(this);
    this.handleGroupClick = this.handleGroupClick.bind(this);

    this.structureIndices = null;
    this.protoLinks = null;
    this.height = "100%";
  }

  componentDidMount() {
    if (this.props.labellingIsReady) {
      [this.structureIndices, this.protoLinks] = this.buildStructureIndices(this.state.type);

      this.createPlot();
    }
  }

  componentDidUpdate() {
    if (this.props.labellingIsReady) {
      [this.structureIndices, this.protoLinks] = this.buildStructureIndices(this.state.type);

      this.createPlot();
    }
  }

  buildStructureIndices(type) {
    let species, aux;
    let labelling = this.props.labellingStructure;
    let index = 0;
    let structureIndices = {};
    let protoLinks = [];
    let nodes = {};

    for (species in labelling) {
      if (type === 'Taxonomía') {
        aux = labelling[species].genus;
        protoLinks.push({source: species, target: aux, value: 0});
        structureIndices[species] = [index];
        index++;

        if (!(aux in nodes)) {
          protoLinks.push({source: aux, target: labelling[species].family, value: 0});
          nodes[aux] = index;
          index++;
        }

        structureIndices[species].push(nodes[aux]);

      } else if (type === 'Dieta') {
        aux = labelling[species].eco_feat.diet || ["insectivore"];
        aux = aux[0];
        protoLinks.push({source: species, target: aux, value: 0});
        structureIndices[species] = [index];
        index++;

      } else if (type === 'Estructura de Hábitat') {
        aux = labelling[species].eco_feat.habitat_structure[0];
        protoLinks.push({source: species, target: aux, value: 0});
        structureIndices[species] = [index];
        index++;

      } else if (type === 'Percepción') {
        aux = labelling[species].eco_feat.perception[0];
        protoLinks.push({source: species, target: aux, value: 0});
        structureIndices[species] = [index];
        index++;

      } else if (type === 'Comportamiento de forrajeo') {
        aux = labelling[species].eco_feat.resource_behaviour[0];
        protoLinks.push({source: species, target: aux, value: 0});
        structureIndices[species] = [index];
        index++;

      } else if (type === 'Gremio (Denzinger 2013)') {
        aux = labelling[species].guild["Denzinger_Schnitzler_2013"][0];
        protoLinks.push({source: species, target: aux, value: 0});
        structureIndices[species] = [index];
        index++;

      } else if (type === 'Gremio (Fenton 1990)') {
        aux = labelling[species].guild["Fenton_1990"][0];
        protoLinks.push({source: species, target: aux, value: 0});
        structureIndices[species] = [index];
        index++;

      } else if (type === 'Gremio (Kalko 1996)') {
        aux = labelling[species].guild["Kalko_et_al_1996"][0];
        protoLinks.push({source: species, target: aux, value: 0});
        structureIndices[species] = [index];
        index++;

      } else if (type === 'Gremio (Schnitzler 2003)') {
        aux = labelling[species].guild["Schnitzler_2001_2003"][0];
        protoLinks.push({source: species, target: aux, value: 0});
        structureIndices[species] = [index];
        index++;
      }
    }

    return [structureIndices, protoLinks];
  }

  preprocessData() {
    let datum, i, j, col, value, index, species;

    let group = this.state.group;

    if (!(group in this.props.data)) {
      group = Object.keys(this.props.data)[0];
      this.setState({group: group});
    }

    let data = this.props.data[group];
    let mapping = this.props.categories.species;

    let structureIndices = this.structureIndices;
    let allLinks = JSON.parse(JSON.stringify(this.protoLinks));

    for (i = 0; i < data.length; i++) {
      datum = data[i];

      for (species in mapping) {
        col = mapping[species];
        value = parseInt(datum[col], 10);

        if (value === 0) {
          continue;
        }

        for (j = 0; j < structureIndices[species].length; j++) {
          index = structureIndices[species][j];
          allLinks[index]['value'] += value;
        }
      }
    }

    allLinks = allLinks.filter((d) => d.value  > 0);

    let source, target;
    let links = [];
    let nodes = [];
    let indices = {};
    index = 0;
    for (i = 0; i < allLinks.length; i++) {
      source = allLinks[i].source;
      target = allLinks[i].target;
      value = allLinks[i].value;

      if (!(source in indices)) {
        nodes.push({name: source});
        indices[source] = index;
        index++;
      }

      if (!(target in indices)) {
        nodes.push({name: target});
        indices[target] = index;
        index++;
      }

      links.push({source: indices[source], target: indices[target], value: value});
    }

    return {nodes: nodes, links: links};
  }

  createPlot() {
    const data = this.preprocessData();

    const clientHeight = this.myRef.current.parentElement.clientHeight;
    let factor = this.state.type === 'Taxonomía'? 1: 2;

    let height = Math.max(7 * factor * data.links.length, clientHeight);
    this.height = height;

    let width = this.myRef.current.parentElement.clientWidth;
    let margin = {left: 0, right: 0, bottom: 5, top: 5};

    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    const { nodes, links } = d3sankey.sankey()
      .nodeWidth(15)
      .nodePadding(7)
      .extent([[1, 1], [width - 1, height - 5]])(JSON.parse(JSON.stringify(data)));

    const color = d3.scaleOrdinal(d3.schemeSet3);
    function format(d) {
      const f = d3.format(",.1f");
      return `${f(d)} pasos/día`;
    }

    const svg = d3.select(this.myRef.current);
    svg.selectAll("*").remove();

    svg.append("g")
      .attr("stroke", "#000")
      .selectAll("rect")
      .data(nodes)
      .enter().append("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("fill", d => color(d.name))
      .append("title")
      .text(d => `${d.name}\n${format(d.value)}`);

    const link = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.5)
      .selectAll("g")
      .data(links)
      .enter().append("g")
      .style("mix-blend-mode", "multiply");

    const gradient = link.append("linearGradient")
      .attr("id", d => (d.uid = 'link' + d.index))
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", d => d.source.x1)
      .attr("x2", d => d.target.x0);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", d => color(d.source.name));

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", d => color(d.target.name));

    link.append("path")
      .attr("d", d3sankey.sankeyLinkHorizontal())
      .attr("stroke", d => 'url(' + window.location.href + '#' + d.uid + ')')
      .attr("stroke-width", d => Math.max(1, d.width));

    svg.append("g")
      .style("font", "10px sans-serif")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .text(d => translate(d.name));

    svg.attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  }

  handleTypeClick(type) {
    [this.structureIndices, this.protoLinks] = this.buildStructureIndices(type);
    this.setState({type: type});
  }

  renderButtons() {
    let options = ['Taxonomía', 'Estructura de Hábitat', 'Dieta', 'Comportamiento de forrajeo', 'Percepción'];
    let info = `
    Sistema de clasificación a usar.
    `;
    return (
      <Card
        title="Nivel"
        tooltip={info}
        expand={true}
      >
        <List
          list={options}
          selectedItems={[this.state.type]}
          onClick={this.handleTypeClick}
        />
      </Card>
    );
  }

  handleGroupClick(group) {
    this.setState({group: group});
  }

  renderGroupButtons() {
    let info = `
    Selecciona el grupo a analizar.
    `;
    return (
      <Card
        title="Grupo"
        tooltip={info}
        expand={true}
      >
        <List
          map={this.props.groupNames}
          selectedItems={[this.state.group]}
          onClick={this.handleGroupClick}
        />
      </Card>
    );
  }

  renderGraph() {
    return (
      <Card title="Gráfica de Composición" tooltip="">
        <div className="svg-container p-0 m-0">
          <svg
            ref={this.myRef}
            width={this.width}
            height={this.height}
            margin={10}
          >
          </svg>
        </div>
      </Card>
    );
  }

  render() {
    return (
      <div className='row h-100'>
        <div className="col-2 h-100">
          {this.renderButtons()}
        </div>
        <div className="col-2 h-100">
          {this.renderGroupButtons()}
        </div>
        <div className="col-8 h-100">
          {this.renderGraph()}
        </div>
      </div>);
  }
}

export default CompositionPlot;
