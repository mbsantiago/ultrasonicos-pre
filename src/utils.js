const DATA_STRUCTURE_URL = 'http://nodo5:9312/metadata/data_structure';
const CONGLOMERATE_DATA_URL = 'http://nodo5:9312/data/conglomerado';
const DEFAULT_VIEWPORT = {
  center: [23.950464, -102.532867],
  zoom: 5,
};
const CONGLOMERATES_URL = "http://nodo5:9312/metadata/conglomerados";
const LABELLING_STRUCTURE_URL = "http://nodo5:9312/metadata/labelling_structure";
const ANPS_URL = "http://snmb.conabio.gob.mx/api_anps/v1/anps";
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];
const HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
  15, 16, 17, 18, 19, 20, 21, 22, 23];
const YEARS = [2014, 2015, 2016, 2017];

export {
  CONGLOMERATE_DATA_URL,
  ANPS_URL,
  MONTHS,
  DEFAULT_VIEWPORT,
  CONGLOMERATES_URL,
  HOURS,
  YEARS,
  DATA_STRUCTURE_URL,
  LABELLING_STRUCTURE_URL,
};
