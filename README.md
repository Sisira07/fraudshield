# Fraudshield
A real-time financial fraud detection dashboard built with React, Chart.js, and Leaflet.js. Simulates a live transaction stream, scores each transaction against a rule-based fraud engine, and visualises results across five interactive views.

## Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| React | 18 | UI & state management (CDN) |
| Babel Standalone | latest | In-browser JSX transpilation |
| Chart.js | 4.4 | Line, doughnut, and bar charts |
| Leaflet.js | 1.9 | Interactive transaction map |
| Google Fonts | — | Bebas Neue · DM Sans · DM Mono |

## External APIs

| API | Data |
|-----|------|
| [FDIC BankFind](https://banks.data.fdic.gov/docs/) | Institution name, total assets, insurance status |
| [CFPB Consumer Complaints](https://api.consumerfinance.gov/) | Complaint volume by product/issue category |

The Bank Lookup tab makes live requests to both APIs — internet access required for that tab only.

## Live Demo
[Click here!](https://fraudshield-green.vercel.app/)
