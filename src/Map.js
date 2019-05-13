import React, { createRef, Component } from 'react';

import {
  Map,
  TileLayer,
  LayerGroup,
  LayersControl,
  WMSTileLayer,
  GeoJSON,
  Pane,
  CircleMarker,
  Tooltip} from 'react-leaflet';
import RcTooltip from 'rc-tooltip';
import Control from 'react-leaflet-control';
import * as turf from '@turf/turf';
import { CompactPicker } from 'react-color';

import {DEFAULT_VIEWPORT} from './utils';
import Card from './Components/Card';

import 'leaflet/dist/leaflet.css';

const { BaseLayer, Overlay } = LayersControl;


class Mapa extends Component {
  constructor(props) {
    super(props);

    this.mapRef = createRef();
    this.state = {
      viewport: DEFAULT_VIEWPORT,
      displayColorPicker: {
        primary: false,
        secondary: false
      },
      color: {
        primary: {
          r: '241',
          g: '112',
          b: '19',
          a: '1',
        },
        secondary: {
          r: '151',
          g: '112',
          b: '240',
          a: '1',
        },
      }
    };
  }

  componentDidUpdate() {
    this.selectAnp();
    this.selectGroup();
  }

  centerOnAnp(feature) {
    let [minLon, minLat, maxLon, maxLat] = turf.bbox(feature);
    this.mapRef.current.leafletElement.flyToBounds([
      [minLat, minLon],
      [maxLat, maxLon]
    ]);

    this.props.conglomeratesData.map(
      (d) => {
        let point = [-d.grabadora_lon, d.grabadora_lat];
        let isIn = turf.booleanPointInPolygon(point, feature);
        if (isIn) {
          if (!this.props.selection.has(d.conglomerado_id)) {
            this.props.onSelect(d.conglomerado_id);
          }
        }
        return null;
      }
    );
  }

  onEachAnp(feature, layer) {
    layer.on({
      click: () => this.centerOnAnp(feature)
    });

    layer.bindTooltip(feature.properties.nombre);
  }

  onClickConglomerate(id){
    this.props.onSelect(id);
  }

  renderBasicTileLayer() {
    return (
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      />
    );
  }

  getConglomerateColor(d) {
    if (this.props.selection.has(d.conglomerado_id)) {
      return `rgba(${ this.state.color.secondary.r }, ${ this.state.color.secondary.g }, ${ this.state.color.secondary.b }, ${ this.state.color.secondary.a })`;
    } else {
      return `rgba(${ this.state.color.primary.r }, ${ this.state.color.primary.g }, ${ this.state.color.primary.b }, ${ this.state.color.primary.a })`;
    }
  }

  centerOnConglomerates() {
    if (this.props.conglomeratesDataReady) {
      if (this.props.selection.size > 0){
        let conglomerates = this.props.conglomeratesData.filter(d => this.props.selection.has(d.conglomerado_id));
        let coordinates = conglomerates.map(d => {
          let lat = d.grabadora_lat;
          let lon = d.grabadora_lon;
          return [-lon, lat];
        });

        let [minLon, minLat, maxLon, maxLat] = turf.bbox(turf.buffer(turf.multiPoint(coordinates), 50));
        this.mapRef.current.leafletElement.flyToBounds([
          [minLat, minLon],
          [maxLat, maxLon]
        ]);
      }
    }
  }

  renderConglomerates(){
    if (this.props.conglomeratesError !== null) {
      return "Conglomerados: Error";
    } else if (this.props.conglomeratesDataReady) {
      let conglomerados = this.props.conglomeratesData.map(
        (d) => (
          <CircleMarker
            center={[d.grabadora_lat, -d.grabadora_lon]}
            key={'Conglomerado' + d.conglomerado_id}
            fillColor={this.getConglomerateColor(d)}
            opacity={0.7}
            stroke={true}
            weight={1}
            pane="conglomerados"
            color={this.getConglomerateColor(d)}
            onClick={() => this.onClickConglomerate(d.conglomerado_id)}
            radius={3}>
            <Tooltip>{'Conglomerado ' + d.conglomerado_id}</Tooltip>
          </CircleMarker>
        )
      );

      return (
        <Overlay checked name='conglomerados'>
          <LayerGroup>
            {conglomerados}
          </LayerGroup>
        </Overlay>
      );
    } else {
      return null;
    }
  }

  renderAnpShapes() {
    let style = {
      color: "black",
      weight: 1,
      opacity: 0.5,
    };

    if (this.props.anpShapesReady) {
      return (
        <Overlay checked name={'ANP'}>
          <GeoJSON
            data={this.props.anpShapes}
            style={style}
            pane="ANP"
            onEachFeature={(feature, layer) => this.onEachAnp(feature, layer)}
          />
        </Overlay>);
    } else {
      return null;
    }
  }

  renderLayerControls() {
    let anpShapes = this.renderAnpShapes();
    let conglomerates = this.renderConglomerates();

    return (
      <LayersControl position="topright">
        <BaseLayer checked name="Base">
          {this.renderBasicTileLayer()}
        </BaseLayer>
        <BaseLayer name="Integridad Ecológica">
          <WMSTileLayer
            transparent
            format='image/png'
            layers='MEX_IE3C_250m:ie3c_2014_250m'
            attribution='CONABIO'
            url='http://webportal.conabio.gob.mx:8085/geoserver/MEX_IE3C_250m/wms?'
          />
        </BaseLayer>
        <BaseLayer name="Cobertura de Suelo">
          <WMSTileLayer
            transparent
            format='image/png'
            layers='MEX_LC_Landsat_8C:MEX_LC_2015_Landsat_8C'
            attribution='CONABIO'
            url='http://webportal.conabio.gob.mx:8085/geoserver/MEX_LC_Landsat_8C/wms?'
          />
        </BaseLayer>
        {anpShapes}
        {conglomerates}
      </LayersControl>
    );
  }

  renderHomeButton() {
    const styles = {
      cover: {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
      color: {
        primary: {
          height: '10px',
          width: '10px',
          borderRadius: '2px',
          background: `rgba(${ this.state.color.primary.r }, ${ this.state.color.primary.g }, ${ this.state.color.primary.b }, ${ this.state.color.primary.a })`,
        },
        secondary: {
          height: '10px',
          width: '10px',
          borderRadius: '2px',
          background: `rgba(${ this.state.color.secondary.r }, ${ this.state.color.secondary.g }, ${ this.state.color.secondary.b }, ${ this.state.color.secondary.a })`,
        }
      },
    };

    return (
      <React.Fragment>
        <Control position="bottomleft">
          <RcTooltip placement="right" trigger={["hover"]} overlay="Reestablecer la vista">
            <button
              className='btn btn-light m-1 leaflet-control leaflet-bar'
              onClick={() => this.onClickReset()}
            >
              <i className="fa fa-home"></i>
            </button>
          </RcTooltip>
        </Control>
        <Control position="bottomleft">
            <div>
              <RcTooltip placement="right" trigger={["hover"]} overlay="Seleccionar el color de los conglomerados inactivos">
                <div className="btn btn-light leaflet-control leaflet-bar m-1 p-1" onClick={ () => this.handleClick('primary') }>
                  <div className="container-fluid" style={ styles.color.primary } />
                </div>
              </RcTooltip>
              { this.state.displayColorPicker.primary ?
                  <div>
                    <div style={ styles.cover } onClick={ () => this.handleClose('primary') }/>
                    <CompactPicker triangle="left" color={ this.state.color.primary } onChange={ (color) => this.handleChange(color, 'primary') } />
                  </div> :
                  null
              }
            </div>
        </Control>
        <Control position="bottomleft">
            <div>
              <RcTooltip placement="right" trigger={["hover"]} overlay="Seleccionar el color de los conglomerados activos">
                <div className="btn btn-light leaflet-control leaflet-bar m-1 p-1" onClick={ () => this.handleClick('secondary') }>
                  <div className="container-fluid" style={ styles.color.secondary } />
                </div>
              </RcTooltip>
              { this.state.displayColorPicker.secondary ?
                  <div>
                    <div style={ styles.cover } onClick={ () => this.handleClose('secondary') }/>
                    <CompactPicker triangle="left" color={ this.state.color.secondary } onChange={ (color) => this.handleChange(color, 'secondary') } />
                  </div> :
                  null
              }
            </div>
        </Control>
      </React.Fragment>
    );
  }

  handleClick = (selection) => {
    this.setState(state => {
      state.displayColorPicker[selection] = !state.displayColorPicker[selection];
      return state
    });
  };

  handleClose = (selection) => {
    this.setState(state => {
      state.displayColorPicker[selection] = false;
      return state;
    })
  };

  handleChange = (color, selection) => {
    this.setState(state => {
      state.color[selection] = color.rgb;
      return state;
    });
  };

  renderSelectionButtons() {
    return (
      <Control position="bottomright">
        <RcTooltip placement="top" trigger={["hover"]} overlay="Seleccionar todos los conglomerados">
          <button
            className='btn btn-light m-1 leaflet-bar'
            onClick={() => this.props.selectAllConglomerates()}
          >
            <i className="fas fa-plus"></i>
          </button>
        </RcTooltip>
        <RcTooltip placement="top" trigger={["hover"]} overlay="Eliminar selección">
          <button
            className='btn btn-light m-1 leaflet-bar'
            onClick={() => this.props.removeAllConglomerates()}
          >
            <i className="fas fa-times"></i>
          </button>
        </RcTooltip>
      </Control>
    );
  }

  onClickReset() {
    this.setState({viewport: DEFAULT_VIEWPORT});
    this.props.clearAnp();
  }

  onViewportChanged(viewport) {
    this.setState({viewport});
  }

  selectGroup() {
    if (this.props.centerOnGroup) {
      this.centerOnConglomerates();
      this.props.doneCentering();
    }
  }

  selectAnp() {
    if (this.props.anp !== null) {
      let selection = this.props.anpShapes[0].features.filter(
        feature => (feature.properties.nombre === this.props.anp)
      );

      if (selection.length > 0) {
        this.centerOnAnp(selection[0]);
      }

      this.props.clearAnp();
    }
  }

  render() {
    let basicTileLayer = this.renderBasicTileLayer();
    let layerControls = this.renderLayerControls();
    let homeButton = this.renderHomeButton();
    let selectionButtons = this.renderSelectionButtons()

    return (
      <Card title="" className="p-0">
        <Map
          className="h-100 w-100"
          ref={this.mapRef}
          onViewportChanged={(viewport) => this.onViewportChanged(viewport)}
          viewport={this.state.viewport}
        >
          <Pane name={'ANP'}/>
          <Pane name={'conglomerados'}/>

          {basicTileLayer}
          {layerControls}
          {homeButton}
          {selectionButtons}
        </Map>
      </Card>);
  }
}


export default Mapa;
