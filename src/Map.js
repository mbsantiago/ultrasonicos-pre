import React, { createRef, Component } from 'react';

import {
  Map,
  TileLayer,
  LayerGroup,
  LayersControl,
  WMSTileLayer,
  GeoJSON,
  Circle,
  Tooltip} from 'react-leaflet';
import Control from 'react-leaflet-control';
import * as turf from '@turf/turf';
import {CONGLOMERATES_URL, DEFAULT_VIEWPORT} from './utils';

import './Map.css';
import 'leaflet/dist/leaflet.css';

const { BaseLayer, Overlay } = LayersControl;




class Mapa extends Component {
  constructor(props) {
    super(props);

    this.mapRef = createRef();
    this.state = {
      viewport: DEFAULT_VIEWPORT,
      conglomeratesData: null,
      conglomeratesDataReady: false,
      conglomeratesError: null,
    };
  }

  componentDidMount() {
    this.loadConglomerates();
  }

  componentDidUpdate() {
    this.selectAnp();
  }

  loadConglomerates() {
    fetch(CONGLOMERATES_URL)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Conglomerates: error at loading');
        }
      })
      .then(data => {
        if (data === null) {
          this.setState({conglomeratesError: "Null shapes"});
        } else {
          this.setState({
            conglomeratesData: data,
            conglomeratesDataReady: true});
        }
      });
  }

  centerOnAnp(feature) {
    let [minLon, minLat, maxLon, maxLat] = turf.bbox(feature);
    this.mapRef.current.leafletElement.flyToBounds([
      [minLat, minLon],
      [maxLat, maxLon]
    ]);

    this.state.conglomeratesData.map(
      (d) => {
        let point = [-d.grabadora_lon, d.grabadora_lat];
        let isIn = turf.booleanPointInPolygon(point, feature);
        if (isIn) {
          if (this.props.selection.indexOf(d.conglomerado_id) < 0) {
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
        attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
        url='https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      />
    );
  }

  getConglomerateColor(d) {
    if (this.props.selection.indexOf(d.conglomerado_id) >= 0) {
      return "orange";
    } else {
      return "blue";
    }
  }

  renderConglomerates(){
    if (this.state.conglomeratesError !== null) {
      return "Conglomerados: Error";
    } else if (this.state.conglomeratesDataReady) {
      let conglomerados = this.state.conglomeratesData.map(
        (d) => (
          <Circle
            center={[d.grabadora_lat, -d.grabadora_lon]}
            key={'Conglomerado' + d.conglomerado_id}
            fillColor={this.getConglomerateColor(d)}
            opacity={0.7}
            stroke={true}
            weight={1}
            color={this.getConglomerateColor(d)}
            onClick={() => this.onClickConglomerate(d.conglomerado_id)}
            radius={500}>
            <Tooltip>{'Conglomerado ' + d.conglomerado_id}</Tooltip>
          </Circle>
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
      opacity: 0.8,
    };

    if (this.props.anpShapesReady) {
      return (
        <Overlay checked name={'ANP'}>
          <GeoJSON
            data={this.props.anpShapes}
            style={style}
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
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
            url='https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
          />
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
    return (
      <Control position="bottomleft" >
        <button
          className='btn'
          onClick={() => this.onClickReset()}
        >
          <i className="fa fa-home"></i>
        </button>
      </Control>
    );
  }

  onClickReset() {
    this.setState({viewport: DEFAULT_VIEWPORT});
    this.props.clearAnp();
  }

  onViewportChanged(viewport) {
    this.setState({ viewport });
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


    return (
      <Map
        className="Mapa"
        ref={this.mapRef}
        onViewportChanged={(viewport) => this.onViewportChanged(viewport)}
        viewport={this.state.viewport}
      >
        {basicTileLayer}
        {layerControls}
        {homeButton}
      </Map>);
  }
}


export default Mapa;
