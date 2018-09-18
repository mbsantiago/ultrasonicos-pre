import BaseGraph from './BaseGraph';

import { MONTHS } from './utils';


class GraficaMeses extends BaseGraph {
  constructor(props) {
    super(props);
    this.month_col = props.categories.date;
  }

  getDatum(row) {
    return parseInt(row[this.month_col].split('-')[1], 10);
  }

  getXAxisLayout() {
    return {
      tickmode: 'array',
      tickvals: [...MONTHS.keys()],
      ticktext: MONTHS
    };
  }

}


export default GraficaMeses;
