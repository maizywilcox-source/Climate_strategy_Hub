# Climate Strategy Hub

An interactive React + Vite climate-policy simulator that turns the United States map into a live decision surface. Users can compare geoengineering interventions against sustainability strategies, move a 20-year timeline slider, and watch environmental, health, and economic indicators change in real time.

Live Demo: https://climate-strategy-hub.vercel.app/
Repository: https://github.com/maizywilcox-source/Climate_strategy_Hub

![Climate Strategy Hub preview](./src/assets/hero.png)

## What This App Does

Climate Strategy Hub models how policy choices ripple across the U.S. through:

- map-based visual storytelling
- a 20-year forecasting engine
- environmental and economic KPI dashboards
- hoverable educational popups tied to visible features on the map
- exportable policy-brief PDFs

The current experience includes:

- dynamic state coloring based on environmental harm vs sustainability gains
- animated highway traffic, landfill systems, reforestation zones, biodiversity corridors, and rail overlays
- geoengineering flight paths with climate-risk tradeoff callouts
- scenario controls with accordion explanations and source links
- data-informed indicators for CO2, air pollutants, healthcare costs, temperature, nighttime heat retention, precipitation stress, and ozone / UV damage

## Why It Stands Out

This is not a static dashboard. It is designed as a portfolio-ready simulation that blends:

- React UI engineering
- SVG and CSS map animation
- data storytelling
- systems thinking around climate policy

The goal is to help viewers immediately understand how different interventions can produce visible tradeoffs over time.

## Data Foundations

The simulator uses public-source assumptions and educational modeling anchored to organizations such as:

- NOAA
- EPA
- IPCC
- CMS
- FRA
- USFWS
- USGS
- National Academies

Key source categories include:

- atmospheric CO2 trends
- warming-rate context
- air-pollution and sulfur-dioxide health effects
- forest carbon sinks
- circular-economy and materials guidance
- biodiversity connectivity
- climate water-cycle risks
- rail corridor planning

Source links are surfaced directly inside the UI and scenario explanations.

## Tech Stack

- React 19
- TypeScript
- Vite
- `react-simple-maps`
- `d3-geo`
- `lucide-react`
- `html2canvas`
- `jspdf`

## Quick Start

### Requirements

- Node.js `20.19.0+` or `22.12.0+`
- npm

### Run Locally

```bash
npm install
npm run dev
```

Then open the local URL shown in the terminal, typically:

```text
http://127.0.0.1:5173/
```

## Build And Verify

```bash
npm run build
npm run lint
```

To preview the production build locally:

```bash
npm run preview
```

## Free Public Deployment

The easiest free option for this project is **Vercel**.

### Deploy With GitHub + Vercel

1. Create a new GitHub repository.
2. Push this project to that repository.
3. Go to [Vercel](https://vercel.com/).
4. Click `Add New` -> `Project`.
5. Import your GitHub repository.
6. Let Vercel detect the project as `Vite`.
7. If prompted, use:
   - Build command: `npm run build`
   - Output directory: `dist`
8. Deploy and copy your public `vercel.app` URL into this README.

### Helpful Notes

- No database is required.
- No environment variables are required.
- No demo login is required.
- This project is a frontend-only app and can be hosted as a static site.

## Project Structure

```text
src/
  components/
    Map/
      USAMap.tsx
    UI/
      ControlPanel.tsx
      Dashboard.tsx
      ExportButton.tsx
  store/
    gameState.tsx
  App.tsx
```

## Portfolio / Reviewer Notes

If you are reviewing this project, the fastest way to evaluate it is:

1. Open the live deployment URL.
2. Toggle sustainability and geoengineering controls.
3. Move the 20-year timeline slider.
4. Hover over map features for context, pros, cons, and source-backed notes.
5. Export the scenario as a PDF policy brief.

## Known Setup Note

This repository includes an `.npmrc` file so `npm install` works cleanly despite a peer-dependency mismatch between React 19 and `react-simple-maps`.

## Privacy And Security Notes

- No API keys, passwords, `.env` files, or private backend credentials are required for this project.
- This app is a frontend-only static deployment, so the website itself is safe to keep public.
- If you want the source code repository to be less visible, you can make the GitHub repository private later and keep the Vercel site public.
- Important: any public frontend website still sends JavaScript, images, and client-side logic to the browser, so visitors can inspect shipped frontend code. Public website access and fully private frontend code cannot both be guaranteed at the same time.
- Because of that, never place secrets in React source files, browser code, or public assets.

## Submission Status

- Public live URL is available
- GitHub repository is available
- No setup is required for reviewers
- Local install, build, and lint instructions are documented
- No database, login, or environment configuration is required
