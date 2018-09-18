import BaseGraph from './BaseGraph';


class GraficaHoras extends BaseGraph {
  constructor(props) {
    super(props);
    this.hour_col = props.categories.time;
  }

  getDatum(row) {
    return parseInt(row[this.hour_col].split(':')[0], 10);
  }

  getXAxisLayout() {
    return {};
  }
}


export default GraficaHoras;
