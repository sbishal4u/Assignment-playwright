import { test, expect } from '@playwright/test';
import { EmiCalculatorPage } from '../pages/EmiCalculatorPage';
import { cleanNumber, calculateEMI } from '../utils/emiUtils';

test('Validate EMI calculator using Page Object Model', async ({ page }) => {
  const emiPage = new EmiCalculatorPage(page);

  const loanAmount = 5000000;
  const interestRate = 9;
  const tenureYears = 20;

  await emiPage.goto();

  // Move sliders
  await emiPage.setLoanAmountBySlider(loanAmount);
  await emiPage.setInterestRateBySlider(interestRate);
  await emiPage.setLoanTenureBySlider(tenureYears);

  await page.waitForTimeout(2000);

  // Read updated values from input fields
  const actualLoanAmount = cleanNumber(await emiPage.getLoanAmount());
  const actualInterestRate = cleanNumber(await emiPage.getInterestRate());
  const actualLoanTenure = cleanNumber(await emiPage.getLoanTenure());

  expect(actualLoanAmount).toBeGreaterThan(0);
  expect(actualInterestRate).toBeGreaterThan(0);
  expect(actualLoanTenure).toBeGreaterThan(0);

  // EMI validation using formula
  const uiEmi = cleanNumber(await emiPage.getEmiText());
  const calculatedEmi = calculateEMI(
    actualLoanAmount,
    actualInterestRate,
    actualLoanTenure
  );

  expect(Math.abs(uiEmi - calculatedEmi)).toBeLessThanOrEqual(2);

  // Table validation
  const tableData = await emiPage.getTableData(cleanNumber);

  expect(tableData.length).toBeGreaterThan(0);

  for (const row of tableData) {
    expect(Math.abs((row.principal + row.interest) - row.totalPayment)).toBeLessThanOrEqual(2);
  }

  for (let i = 1; i < tableData.length; i++) {
    expect(tableData[i].balance).toBeLessThanOrEqual(tableData[i - 1].balance);
  }

  const lastRow = tableData[tableData.length - 1];
  expect(lastRow.balance).toBeLessThanOrEqual(5);

  // Chart vs Table validation
  const chartData = await emiPage.getChartData();

  if (chartData) {
    const compareCount = Math.min(chartData.length, tableData.length);

    for (let i = 0; i < compareCount; i++) {
      expect(chartData[i].year).toBe(tableData[i].year);
      expect(Math.abs(chartData[i].principal - tableData[i].principal)).toBeLessThanOrEqual(2);
      expect(Math.abs(chartData[i].interest - tableData[i].interest)).toBeLessThanOrEqual(2);
      expect(Math.abs(chartData[i].balance - tableData[i].balance)).toBeLessThanOrEqual(2);
    }
  }
});