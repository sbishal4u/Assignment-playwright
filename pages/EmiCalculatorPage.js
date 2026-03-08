export class EmiCalculatorPage {
  constructor(page) {
    this.page = page;

    // Inputs
    this.loanAmountInput = page.locator('#loanamount');
    this.interestRateInput = page.locator('#loaninterest');
    this.loanTenureInput = page.locator('#loanterm');

    // Sliders
    this.sliderTracks = page.locator('.ui-slider');
    this.sliderHandles = page.locator('.ui-slider-handle');

    // EMI value
    this.emiValue = page.locator('#emiamount span');

    // Table rows
    this.tableRows = page.locator('table tbody tr');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async moveSlider(trackLocator, handleLocator, min, max, targetValue) {
    const box = await trackLocator.boundingBox();
    if (!box) throw new Error('Slider track not found');

    const ratio = (targetValue - min) / (max - min);
    const x = box.x + box.width * ratio;
    const y = box.y + box.height / 2;

    await handleLocator.hover();
    await this.page.mouse.down();
    await this.page.mouse.move(x, y, { steps: 20 });
    await this.page.mouse.up();
  }

  async setLoanAmountBySlider(value) {
    await this.moveSlider(
      this.sliderTracks.nth(0),
      this.sliderHandles.nth(0),
      0,
      20000000,
      value
    );
  }

  async setInterestRateBySlider(value) {
    await this.moveSlider(
      this.sliderTracks.nth(1),
      this.sliderHandles.nth(1),
      5,
      20,
      value
    );
  }

  async setLoanTenureBySlider(value) {
    await this.moveSlider(
      this.sliderTracks.nth(2),
      this.sliderHandles.nth(2),
      1,
      30,
      value
    );
  }

  async getLoanAmount() {
    return await this.loanAmountInput.inputValue();
  }

  async getInterestRate() {
    return await this.interestRateInput.inputValue();
  }

  async getLoanTenure() {
    return await this.loanTenureInput.inputValue();
  }

  async getEmiText() {
    return await this.emiValue.textContent();
  }

  async getTableData(cleanNumber) {
    const rowCount = await this.tableRows.count();
    const data = [];

    for (let i = 0; i < rowCount; i++) {
      const row = this.tableRows.nth(i);
      const cells = row.locator('td');
      const cellCount = await cells.count();

      if (cellCount < 6) continue;

      const yearText = await cells.nth(0).textContent();
      const principalText = await cells.nth(1).textContent();
      const interestText = await cells.nth(2).textContent();
      const totalPaymentText = await cells.nth(3).textContent();
      const balanceText = await cells.nth(4).textContent();

      data.push({
        year: Number((yearText || '').replace(/[^\d]/g, '')),
        principal: cleanNumber(principalText),
        interest: cleanNumber(interestText),
        totalPayment: cleanNumber(totalPaymentText),
        balance: cleanNumber(balanceText),
      });
    }

    return data;
  }

  async getChartData() {
    return await this.page.evaluate(() => {
      const chart = window.Highcharts?.charts?.find(c => c);
      if (!chart) return null;

      const categories = chart.xAxis[0]?.categories || [];

      const principalSeries = chart.series.find(s => /principal/i.test(s.name));
      const interestSeries = chart.series.find(s => /interest/i.test(s.name));
      const balanceSeries = chart.series.find(s => /balance/i.test(s.name));

      if (!principalSeries || !interestSeries || !balanceSeries) return null;

      return categories.map((year, i) => ({
        year: Number(year),
        principal: Number(principalSeries.yData[i] || 0),
        interest: Number(interestSeries.yData[i] || 0),
        balance: Number(balanceSeries.yData[i] || 0),
      }));
    });
  }
}