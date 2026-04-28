# Climate Strategy Hub

Climate Strategy Hub is an interactive React application that turns climate policy into something visual, explorable, and easier to understand. Instead of reading a static report, users can work through a live U.S. map, test different environmental choices, and watch how those decisions change pollution, temperature, biodiversity, healthcare costs, and economic outcomes over time.

**Live Demo: https://climate-strategy-hub.vercel.app/**
Repository: https://github.com/maizywilcox-source/Climate_strategy_Hub

![Climate Strategy Hub preview](./src/assets/hero.png)

## Project Summary

This project is a climate-policy simulator focused on the United States. It was designed to help people see that supporting the environment and investing in long-term solutions can also improve economic stability, public health, and quality of life. The app uses an interactive map, scenario controls, and a 20-year timeline to show how environmental choices can create very different futures.

I wanted to make something that felt informative without being dry. A lot of climate conversations are important, but they can also feel distant, overly technical, or discouraging. This app was built to make those ideas more approachable through movement, comparison, and visual storytelling so that a general audience could better understand how climate decisions affect everyday life.

## What The App Does

Climate Strategy Hub lets users explore tradeoffs between short-term interventions and long-term sustainability strategies. It focuses on how different policies influence the environment, but also how those same decisions connect to jobs, health, transportation, and local quality of life.

Inside the app, users can:

- toggle sustainability strategies such as reforestation, biodiversity corridors, circular economy systems, and high-speed rail
- experiment with geoengineering-related interventions and compare their risks
- move a timeline slider across a 20-year window to see how effects build over time
- hover over map features to read short explanations, tradeoffs, and source-backed notes
- export the current scenario as a PDF policy brief

The goal is not to predict the exact future with perfect certainty. The goal is to help users understand patterns: long-term investment in sustainable systems can reduce harm, support healthier communities, and create benefits that extend beyond the environment alone.

## Why I Built It

I made this project because I wanted people to better understand that environmental progress and economic well-being do not have to be in conflict. A lot of public discussion treats climate action like a sacrifice, when in many cases long-term investment can improve public health, reduce costs, and support more resilient communities.

I also wanted to present this topic in a way that feels engaging rather than intimidating. That is why the app leans so heavily on animated map features, visual feedback, hover interactions, and a timeline-based simulation. My intention was to build something the general public could actually enjoy using while still learning something meaningful from it.

## How I Built It

The application was built with React, TypeScript, and Vite. The main map experience is rendered with `react-simple-maps` and `d3-geo`, while the simulation logic is centralized in `gameState.tsx` so the controls, visuals, and dashboard metrics all react to the same live scenario state.

Some of the most important technical pieces are:

- dynamic state coloring based on environmental conditions
- SVG and CSS-driven overlays for highways, rail, landfill systems, reforestation, wildlife corridors, and flight paths
- a 20-year forecast engine that updates pollution, temperature, healthcare, biodiversity, and economic indicators
- interactive hover popups that explain visuals with pros, cons, and supporting notes
- PDF export functionality for turning a live scenario into a shareable summary

I grounded the educational notes and model assumptions in public sources such as NOAA, EPA, IPCC, CMS, FRA, USFWS, and USGS so the simulation would feel more thoughtful and credible rather than purely decorative.

## Why This Project Works

This project was designed to be clear, useful, and visually memorable. Rather than separating environmental data from economic or health outcomes, it shows how those systems are connected. The interactive design also makes it easier for a reviewer to immediately understand the idea without needing setup or a long explanation first.

It is meant to be both educational and accessible:

- the live version opens instantly in the browser
- the interface responds in real time
- the visuals help communicate differences between choices quickly
- the project is documented for anyone who wants to understand or run it locally

## Reviewer Notes

For a quick review, the best path is:

1. Open the live site.
2. Test the policy toggles and geoengineering controls.
3. Move the 20-year timeline slider.
4. Hover over map features to read the educational popups.
5. Export a scenario as a PDF if you want to see the presentation side of the project.

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

**https://climate-strategy-hub.vercel.app/**

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

- Live site: **https://climate-strategy-hub.vercel.app/**
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
