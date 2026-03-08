# EMI Calculator Automation using Playwright

This project contains automation tests for an EMI Calculator using Playwright and JavaScript.

## Prerequisites

Install the following tools:

Node.js  
npm  
VS Code

Check installation:

node -v
npm -v

## Install Playwright

Open terminal and run:

npm init -y
npm init playwright@latest
npx playwright install

## Run Tests

Run all tests:

npx playwright test

Run with browser visible:

npx playwright test --headed

Run only Chromium:

npx playwright test --project=chromium

## View Test Report

npx playwright show-report

## Framework Structure

pages → Page Object Model  
tests → Test cases  
utils → Utility functions

## Author

Bishal Shah