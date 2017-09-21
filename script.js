(function() {
  const $ = (x) => document.querySelector(x);

  function handleEvent(e) {
      if (e.keyCode === 13) {
        main();
        $("#salary").blur();
      }
    };


  function setup() {
    $("#salary").addEventListener("keypress", handleEvent);
    $("#salary").addEventListener("blur", main);
    $("#salary").focus();
  }
  setup();

  function main() {
    const GROSS_INCOME = parseFloat($("#salary").value.replace(/[^0-9|\.]/gi, '')) || 0;
    const STANDARD_DEDUCTION = 6350;
    const PERSONAL_EXEMPTION = 4050;
    const FEDERAL_AGI = GROSS_INCOME - STANDARD_DEDUCTION - PERSONAL_EXEMPTION;
    const STATE_AGI = GROSS_INCOME - 2300 - 2700;

    const FEDERAL_INCOME_TAX = getFederalIncomeTax(FEDERAL_AGI, 2017);
    const FICA_TAX = getFICATax(GROSS_INCOME, 2017);
    const STATE_INCOME_TAX = getStateTax("GA", STATE_AGI, 2017);

    const locale = "EN-us";
    const options = {
    	style: "currency",
    	currency: "USD"
    };

    $("#salary").value = GROSS_INCOME.toLocaleString(locale, options);
    $("#federal-income-tax").value = FEDERAL_INCOME_TAX.toLocaleString(locale, options);
    $("#FICA-tax").value = FICA_TAX.toLocaleString(locale, options);
    $("#state-tax").value = STATE_INCOME_TAX.toLocaleString(locale, options);
    $("#take-home-pay").value = (GROSS_INCOME - FEDERAL_INCOME_TAX - FICA_TAX - STATE_INCOME_TAX).toLocaleString(locale, options);

    console.log('\n');
    console.log(`Federal Income Tax for ${GROSS_INCOME} is`, FEDERAL_INCOME_TAX);
    console.log(`FICA tax for ${GROSS_INCOME} is`, FICA_TAX);
    console.log(`State Tax:`, STATE_INCOME_TAX);
    console.log(`Total Taxes:`, FEDERAL_INCOME_TAX + FICA_TAX);
    console.log(`TAKE HOME PAY:`, GROSS_INCOME - FEDERAL_INCOME_TAX - FICA_TAX - STATE_INCOME_TAX);
  }

  function getFederalIncomeTax(AGI, year) {
    let ranges = [
      [0, 9325],
      [9325, 37950],
      [37950, 91900],
      [91900, 191650],
      [191650, 416700],
      [416700, 418400],
      [418400, Infinity]
    ];
    let rates = [
      0.1,
      0.15,
      0.25,
      0.33,
      0.35,
      0.396,
      0.396
    ]

    let data = [{
      "year": 2017,
      "region": "USA",
      "ranges": [[0, 9325], [9325, 37950], [37950, 91900], [91900, 191650], [191650, 416700], [416700, 418400], [418400, false]],
      "rates": [0.1, 0.15, 0.25, 0.33, 0.35, 0.396, 0.396]
    }];

    data = data.filter(function(d) {
      return d.year == year && d.region == "USA";
    })[0];

    return getProgressiveTax(ranges, rates, AGI);
  }

  function getFICATax(GROSS_INCOME, year) {
    return GROSS_INCOME * (0.062 + 0.0145);
  }

  function getStateTax(state, AGI, year) {
    let data = [{
      "year": 2017,
      "region": "GA",
      "ranges": [[0, 750], [750, 2250], [2250, 3750], [3750, 5250], [5250, 7000], [7000, false]],
      "rates": [0.01, 0.02, 0.03, 0.04, 0.05, 0.06]
    }];

    data = data.filter(function(d) {
      return d.year == year && d.region == state;
    })[0];

    return getProgressiveTax(data.ranges, data.rates, AGI);
  }

  function getProgressiveTax(ranges, rates, AGI) {
    if (AGI < 0) {
      return 0; // probs covered by standrd deduction and personal exemption
    }

    return ranges.map(function(range, index) {
      let tax_from_bracket;
      if (range[1] === false) {
        range[1] = Infinity;
      }

      if (range[0] < AGI && AGI >= range[1]) { // AGI completely in bracket
        tax_from_bracket = (range[1] - range[0]) * rates[index];
      } else if (range[0] < AGI && AGI < range[1]) { // AGI partially in bracket/last bracket
        tax_from_bracket = (AGI - range[0]) * rates[index];
      } else { // AGI not in bracket
        tax_from_bracket = 0;
      }

      console.log(`From bracket ${range[0]} to ${range[1]} -- ${rates[index]}: ${tax_from_bracket}`);
      return tax_from_bracket;
    }).reduce((a, b) => a + b);
  }

})();