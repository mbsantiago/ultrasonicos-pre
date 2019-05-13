const DEFAULT_VIEWPORT = {
  center: [23.950464, -102.532867],
  zoom: 5,
};

const BASE = 'https://coati.conabio.gob.mx/apim/';
const DATA_STRUCTURE_URL = BASE + 'metadata/data_structure';
const CONGLOMERATE_DATA_URL = BASE + 'data/conglomerado';
const CONGLOMERATES_URL = BASE + "metadata/conglomerados";
const LABELLING_STRUCTURE_URL = BASE + "metadata/labelling_structure";
const ANPS_URL =  BASE + "metadata/anp_shapes";

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

function addRows(row1, row2) {
  return row1.map((x, i) => x + row2[i]);
}

function getMean(array) {
  return array.reduce((sum, x) => (sum + x), 0) / array.length;
}

function getStd(array, mean) {
  return Math.sqrt(array.reduce((mse, x) => (mse + (x - mean)**2), 0) / array.length);
}

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
  addRows,
  getMean,
  getStd,
};
