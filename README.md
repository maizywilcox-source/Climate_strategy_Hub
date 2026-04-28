# Climate Strategy Hub

An interactive React + Vite climate-policy simulator that turns the United States map into a live decision surface. Users can compare geoengineering interventions against sustainability strategies, move a 20-year timeline slider, and watch environmental, health, and economic indicators change in real time.

Live Demo: https://climate-strategy-hub.vercel.app/
Repository: https://github.com/maizywilcox-source/Climate_strategy_Hub

![Climate Strategy Hub preview](./src/assets/hero.png)

## What It Is

Climate Strategy Hub is an educational climate-policy simulation focused on the United States. It helps users explore how different environmental decisions can affect pollution, temperature, healthcare costs, biodiversity, and long-term sustainability over a 20-year period.

Instead of presenting climate data as a static report, the project turns those ideas into a visual and interactive map experience. Users can toggle strategies, compare tradeoffs, and hover over map features to understand what each policy or risk means.

## Why I Built It

I built this project to make climate strategy easier to understand for people who are not climate scientists or policy experts. Climate change discussions often feel abstract, technical, or disconnected from daily life. I wanted to create something more visual and immediate so a user could see how choices in transportation, land use, waste systems, biodiversity, and geoengineering might shape the future.

I was especially interested in combining environmental storytelling with interactive technology. The goal was not just to display information, but to help users learn through exploration and comparison.

## How I Built It

I built the app as a React and TypeScript project using Vite for development and deployment. The U.S. visualization is rendered with `react-simple-maps` and `d3-geo`, while the forecasting and scenario logic are managed through a shared React state layer in `gameState.tsx`.

The app combines several layers:

- a map engine that colors states based on environmental conditions
- SVG and CSS-based animations for roads, rail, waste systems, forests, biodiversity corridors, and flight paths
- a 20-year timeline slider that updates modeled impacts over time
- interactive popups that explain map features, tradeoffs, and supporting data
- a dashboard and export tool that turn the simulation into a policy-style presentation

I also used public environmental and climate references from organizations like NOAA, EPA, IPCC, CMS, FRA, USFWS, and USGS so the educational content and model assumptions were grounded in real-world source material.

## How This Project Meets The Criteria

### Clarity

The project is designed so a reviewer can quickly understand both the problem and the solution. The interface shows environmental choices directly on the U.S. map, and the README explains the app’s purpose, setup, and live deployment clearly.

### Usefulness

This project is useful as an educational tool for helping people understand tradeoffs in climate policy. It translates difficult topics such as pollution exposure, reforestation, biodiversity loss, and geoengineering risk into a format that is easier to explore and discuss.

### Creativity

The project combines data storytelling, climate-policy simulation, and animated geographic interaction in a way that is more immersive than a standard dashboard. The use of policy toggles, timeline-based changes, and visual environmental scenarios gives the app a distinct identity.

### Execution

The app is fully deployed, interactive, and usable without setup. It includes a working live URL, GitHub repository, build process, linting, and a functioning interface that responds to user inputs in real time.

### Polish & Thoughtfulness

The project includes hover explanations, visual state changes, a public deployment, documentation, source-backed educational notes, and export functionality. These details were added to make the experience feel complete, understandable, and presentation-ready.

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

### Use The Live Version

The fastest way to review or use this project is to open the deployed site:

Live Demo: https://climate-strategy-hub.vercel.app/

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

## Access Notes

The project is already publicly deployed, so reviewers do not need to create their own copy to test it.

- Live site: https://climate-strategy-hub.vercel.app/
- Source code: https://github.com/maizywilcox-source/Climate_strategy_Hub
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
