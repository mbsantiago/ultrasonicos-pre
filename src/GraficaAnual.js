import BaseGraph from './BaseGraph';


class GraficaAnual extends BaseGraph {
  constructor(props) {
    super(props);

    this.year_col = props.categories.date;
  }

  getDatum(row) {
    return parseInt(row[this.year_col].split('-')[0], 10);
  }

  getXAxisLayout() {
    return {};
  }
}


export default GraficaAnual;
