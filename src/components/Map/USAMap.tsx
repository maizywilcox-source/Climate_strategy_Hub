import React, { useEffect, useMemo, useRef, useState } from 'react';
import { geoAlbersUsa, geoInterpolate, geoPath } from 'd3-geo';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { useGameState } from '../../store/gameState';

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const MAP_WIDTH = 1200;
const MAP_HEIGHT = 720;
const MAP_SCALE = 1300;
const BASE_YEAR = 2026;
const MAP_STAGE_HEIGHT = 760;

type LonLat = [number, number];

interface Corridor {
  id: string;
  points: LonLat[];
}

interface PointAsset {
  id: string;
  coord: LonLat;
}

interface FlightRoute {
  id: string;
  from: string;
  to: string;
  start: LonLat;
  end: LonLat;
}

interface SourceLink {
  label: string;
  url: string;
}

interface HotspotDefinition {
  id: string;
  coord: LonLat;
  icon: string;
  title: string;
  metric: string;
  summary: string;
  data: string;
  pros: string;
  cons: string;
  tone: string;
  visible: boolean;
  popupPlacement?: 'above' | 'below';
  sources: SourceLink[];
}

const HIGHWAYS: Corridor[] = [
  {
    id: 'i5',
    points: [
      [-122.3321, 47.6062],
      [-122.6765, 45.5231],
      [-121.4944, 38.5816],
      [-118.2437, 34.0522],
      [-117.1611, 32.7157],
    ],
  },
  {
    id: 'i10',
    points: [
      [-118.2437, 34.0522],
      [-112.074, 33.4484],
      [-106.485, 31.7619],
      [-98.4936, 29.4241],
      [-95.3698, 29.7604],
      [-90.0715, 29.9511],
      [-81.6557, 30.3322],
    ],
  },
  {
    id: 'i35',
    points: [
      [-93.265, 44.9778],
      [-94.5786, 39.0997],
      [-97.7431, 30.2672],
      [-98.4936, 29.4241],
    ],
  },
  {
    id: 'i70',
    points: [
      [-104.9903, 39.7392],
      [-94.5786, 39.0997],
      [-90.1994, 38.627],
      [-86.1581, 39.7684],
      [-82.9988, 39.9612],
      [-76.6122, 39.2904],
    ],
  },
  {
    id: 'i80',
    points: [
      [-122.4194, 37.7749],
      [-119.8138, 39.5296],
      [-111.891, 40.7608],
      [-95.998, 41.2524],
      [-87.6298, 41.8781],
      [-81.6944, 41.4993],
      [-74.006, 40.7128],
    ],
  },
  {
    id: 'i95',
    points: [
      [-71.0589, 42.3601],
      [-74.006, 40.7128],
      [-75.1652, 39.9526],
      [-77.0369, 38.9072],
      [-80.8431, 35.2271],
      [-84.388, 33.749],
      [-81.6557, 30.3322],
    ],
  },
];

// Western rail alignments lean on existing / planned FRA-recognized corridors:
// California HSR, Cascadia, Colorado Front Range, and Phoenix-Tucson selections.
const RAIL_CORRIDORS: Corridor[] = [
  {
    id: 'west-coast-spine',
    points: [
      [-117.1611, 32.7157],
      [-118.2437, 34.0522],
      [-119.0187, 35.3733],
      [-119.7871, 36.7378],
      [-121.8863, 37.3382],
      [-122.4194, 37.7749],
      [-121.4944, 38.5816],
      [-122.6765, 45.5231],
      [-123.0868, 44.0521],
      [-122.3321, 47.6062],
    ],
  },
  {
    id: 'intermountain-connector',
    points: [
      [-117.1611, 32.7157],
      [-116.5453, 33.8303],
      [-112.074, 33.4484],
      [-111.6513, 35.1983],
      [-108.5506, 39.0639],
      [-104.9903, 39.7392],
      [-104.8202, 41.14],
      [-111.891, 40.7608],
      [-112.4455, 42.8713],
      [-116.2023, 43.615],
    ],
  },
  {
    id: 'northeast-corridor',
    points: [
      [-71.0589, 42.3601],
      [-74.006, 40.7128],
      [-75.1652, 39.9526],
      [-77.0369, 38.9072],
    ],
  },
];

const WASTE_SYSTEMS = [
  {
    id: 'chicago',
    city: [-87.6298, 41.8781] as LonLat,
    landfill: [-87.84, 42.08] as LonLat,
  },
  {
    id: 'detroit',
    city: [-83.0458, 42.3314] as LonLat,
    landfill: [-83.18, 42.54] as LonLat,
  },
  {
    id: 'cleveland',
    city: [-81.6944, 41.4993] as LonLat,
    landfill: [-81.94, 41.62] as LonLat,
  },
  {
    id: 'pittsburgh',
    city: [-79.9959, 40.4406] as LonLat,
    landfill: [-80.18, 40.58] as LonLat,
  },
  {
    id: 'buffalo',
    city: [-78.8784, 42.8864] as LonLat,
    landfill: [-79.07, 42.99] as LonLat,
  },
];

const CIRCULAR_NETWORK: LonLat[] = [
  [-87.6298, 41.8781],
  [-83.0458, 42.3314],
  [-81.6944, 41.4993],
  [-79.9959, 40.4406],
  [-78.8784, 42.8864],
  [-87.6298, 41.8781],
];

const FOREST_SITES = [
  { id: 'olympic', coord: [-121.82, 46.48] as LonLat, hue: '#166534' },
  { id: 'rainier', coord: [-121.7269, 46.8797] as LonLat, hue: '#22c55e' },
  { id: 'redwood', coord: [-123.68, 41.23] as LonLat, hue: '#15803d' },
  { id: 'monongahela', coord: [-79.7468, 38.6985] as LonLat, hue: '#166534' },
  { id: 'smokies', coord: [-83.4895, 35.6118] as LonLat, hue: '#16a34a' },
  { id: 'adirondack', coord: [-74.45, 43.95] as LonLat, hue: '#14532d' },
];

const POLLUTION_SITES: PointAsset[] = [
  { id: 'los-angeles', coord: [-118.2437, 34.0522] },
  { id: 'houston', coord: [-95.3698, 29.7604] },
  { id: 'chicago', coord: [-87.6298, 41.8781] },
  { id: 'new-york', coord: [-73.86, 40.78] },
  { id: 'atlanta', coord: [-84.388, 33.749] },
];

const RESERVES: PointAsset[] = [
  { id: 'yellowstone', coord: [-110.5885, 44.4279] },
  { id: 'northern-rockies', coord: [-114.285, 48.7596] },
  { id: 'smokies', coord: [-83.4895, 35.6118] },
  { id: 'adirondacks', coord: [-74.45, 43.95] },
];

const BIODIVERSITY_CORRIDORS: Corridor[] = [
  {
    id: 'yellowstone-northern-rockies',
    points: [
      [-110.5885, 44.4279],
      [-111.8, 45.5],
      [-113.2, 46.8],
      [-114.285, 48.7596],
    ],
  },
  {
    id: 'appalachian-link',
    points: [
      [-83.4895, 35.6118],
      [-81.4, 36.4],
      [-80.2, 38.2],
      [-78.8784, 42.8864],
    ],
  },
];

// Route selection is grounded in OAG's recent busiest-domestic-route reporting,
// then restricted to mainland corridors so animated SRM tracks stay over U.S. land.
const FLIGHT_ROUTES: FlightRoute[] = [
  { id: 'jfk-lax', from: 'JFK', to: 'LAX', start: [-73.7781, 40.6413], end: [-118.4085, 33.9416] },
  { id: 'lga-ord', from: 'LGA', to: 'ORD', start: [-73.874, 40.7769], end: [-87.9073, 41.9742] },
  { id: 'lax-sfo', from: 'LAX', to: 'SFO', start: [-118.4085, 33.9416], end: [-122.379, 37.6213] },
  { id: 'den-phx', from: 'DEN', to: 'PHX', start: [-104.6737, 39.8561], end: [-112.0116, 33.4342] },
  { id: 'atl-mco', from: 'ATL', to: 'MCO', start: [-84.4277, 33.6407], end: [-81.3081, 28.4312] },
  { id: 'atl-lga', from: 'ATL', to: 'LGA', start: [-84.4277, 33.6407], end: [-73.874, 40.7769] },
  { id: 'atl-fll', from: 'ATL', to: 'FLL', start: [-84.4277, 33.6407], end: [-80.1527, 26.0726] },
  { id: 'lax-las', from: 'LAX', to: 'LAS', start: [-118.4085, 33.9416], end: [-115.1523, 36.0801] },
  { id: 'ewr-mco', from: 'EWR', to: 'MCO', start: [-74.1745, 40.6895], end: [-81.3081, 28.4312] },
  { id: 'den-las', from: 'DEN', to: 'LAS', start: [-104.6737, 39.8561], end: [-115.1523, 36.0801] },
  { id: 'sea-den', from: 'SEA', to: 'DEN', start: [-122.3088, 47.4502], end: [-104.6737, 39.8561] },
  { id: 'lax-iah', from: 'LAX', to: 'IAH', start: [-118.4085, 33.9416], end: [-95.3368, 29.9902] },
  { id: 'dca-atl', from: 'DCA', to: 'ATL', start: [-77.0377, 38.8512], end: [-84.4277, 33.6407] },
  { id: 'iad-den', from: 'IAD', to: 'DEN', start: [-77.4558, 38.9531], end: [-104.6737, 39.8561] },
  { id: 'ord-lax', from: 'ORD', to: 'LAX', start: [-87.9073, 41.9742], end: [-118.4085, 33.9416] },
  { id: 'sfo-jfk', from: 'SFO', to: 'JFK', start: [-122.379, 37.6213], end: [-73.7781, 40.6413] },
  { id: 'sfo-sea', from: 'SFO', to: 'SEA', start: [-122.379, 37.6213], end: [-122.3088, 47.4502] },
  { id: 'den-ord', from: 'DEN', to: 'ORD', start: [-104.6737, 39.8561], end: [-87.9073, 41.9742] },
  { id: 'dfw-den', from: 'DFW', to: 'DEN', start: [-97.0403, 32.8998], end: [-104.6737, 39.8561] },
  { id: 'bos-dca', from: 'BOS', to: 'DCA', start: [-71.0052, 42.3656], end: [-77.0377, 38.8512] },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const mixColor = (from: [number, number, number], to: [number, number, number], t: number) => {
  const ratio = clamp(t, 0, 1);
  const [r1, g1, b1] = from;
  const [r2, g2, b2] = to;
  return `rgb(${Math.round(r1 + (r2 - r1) * ratio)}, ${Math.round(
    g1 + (g2 - g1) * ratio,
  )}, ${Math.round(b1 + (b2 - b1) * ratio)})`;
};

const makeLineString = (coordinates: LonLat[]) => ({
  type: 'LineString' as const,
  coordinates,
});

const USAMap: React.FC = () => {
  const {
    toxicity,
    environmentalScore,
    geoMix,
    sustainMix,
    timelineYear,
    setTimelineYear,
    healthcareCosts,
    co2Baseline,
    temperatureAnomaly,
    airPollutantConcentration,
    nighttimeHeatRetention,
    precipitationStress,
    ozoneUvDamage,
  } = useGameState();

  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const hoverCloseTimerRef = useRef<number | null>(null);

  const clearHoverCloseTimer = () => {
    if (hoverCloseTimerRef.current !== null) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  };

  const openHotspot = (hotspotId: string) => {
    clearHoverCloseTimer();
    setHoveredHotspotId(hotspotId);
  };

  const closeHotspotSoon = (hotspotId: string) => {
    clearHoverCloseTimer();
    hoverCloseTimerRef.current = window.setTimeout(() => {
      setHoveredHotspotId((current) => (current === hotspotId ? null : current));
      hoverCloseTimerRef.current = null;
    }, 320);
  };

  useEffect(() => () => clearHoverCloseTimer(), []);

  const totalGeoPlanes = geoMix.so2 + geoMix.alumina + geoMix.silverIodide;

  const projection = useMemo(
    () => geoAlbersUsa().translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]).scale(MAP_SCALE),
    [],
  );

  const pathBuilder = useMemo(() => geoPath(projection), [projection]);

  const projectPoint = (coord: LonLat) => projection(coord) as [number, number] | null;

  const linePath = (points: LonLat[]) => pathBuilder(makeLineString(points)) ?? '';

  const routePath = (start: LonLat, end: LonLat) => {
    const interpolate = geoInterpolate(start, end);
    const points = Array.from({ length: 30 }, (_, index) => interpolate(index / 29) as LonLat);
    return linePath(points);
  };

  const highwayPaths = HIGHWAYS.map((corridor) => ({ ...corridor, d: linePath(corridor.points) }));
  const railPaths = RAIL_CORRIDORS.map((corridor) => ({ ...corridor, d: linePath(corridor.points) }));
  const biodiversityPaths = BIODIVERSITY_CORRIDORS.map((corridor) => ({
    ...corridor,
    d: linePath(corridor.points),
  }));
  const flightPaths = FLIGHT_ROUTES.map((route) => ({
    ...route,
    d: routePath(route.start, route.end),
    midpoint: geoInterpolate(route.start, route.end)(0.52) as LonLat,
  }));

  const visibleFlightCount =
    totalGeoPlanes === 0
      ? 0
      : Math.min(FLIGHT_ROUTES.length, 4 + Math.round((totalGeoPlanes / 300) * 16));

  const visibleFlights = flightPaths.slice(0, visibleFlightCount);

  const aerosolTint = useMemo(() => {
    const total = Math.max(totalGeoPlanes, 1);
    const red = Math.round((253 * geoMix.so2 + 229 * geoMix.alumina + 103 * geoMix.silverIodide) / total);
    const green = Math.round((224 * geoMix.so2 + 231 * geoMix.alumina + 232 * geoMix.silverIodide) / total);
    const blue = Math.round((71 * geoMix.so2 + 235 * geoMix.alumina + 249 * geoMix.silverIodide) / total);
    return `rgb(${red}, ${green}, ${blue})`;
  }, [geoMix, totalGeoPlanes]);

  const calculateUSColor = () => {
    const neutral: [number, number, number] = [246, 248, 252];
    const deepRed: [number, number, number] = [127, 29, 29];
    const deepGreen: [number, number, number] = [20, 83, 45];

    if (environmentalScore > 0) {
      return mixColor(neutral, deepGreen, environmentalScore / 100);
    }

    const pressure = Math.max(toxicity, Math.abs(environmentalScore));
    return mixColor(neutral, deepRed, pressure / 100);
  };

  const usColor = calculateUSColor();
  const trafficOpacity = sustainMix.highSpeedRail ? 0.28 : 0.95;
  const smokeOpacity = sustainMix.highSpeedRail ? 0.08 : 0.52;
  const railOpacity = sustainMix.highSpeedRail ? 1 : 0;
  const landfillOpacity = sustainMix.circularEconomy ? 0.18 : 0.92;
  const landfillScale = sustainMix.circularEconomy ? 0.55 : 1;
  const loopOpacity = sustainMix.circularEconomy ? 0.95 : 0;
  const barrenOpacity = sustainMix.reforestation ? 0.25 : 0.95;
  const treeOpacity = sustainMix.reforestation ? 1 : 0;
  const reserveOpacity = sustainMix.biodiversityCorridors ? 0.65 : 1;
  const corridorOpacity = sustainMix.biodiversityCorridors ? 0.95 : 0;
  const geoPollutionOpacity = clamp(totalGeoPlanes / 135, 0, 0.92);
  const deadPlantOpacity = clamp(geoPollutionOpacity * (sustainMix.reforestation ? 0.55 : 1), 0, 0.9);
  const yearLabel = `${BASE_YEAR + timelineYear}`;
  const hotspots: HotspotDefinition[] = [
    {
      id: 'roads',
      coord: [-97.2, 39.2] as LonLat,
      icon: '🛣',
      title: 'Highway Traffic Network',
      metric: 'Baseline intercity road traffic layer',
      summary:
        'These thick corridors represent the default car- and truck-heavy mobility system before rail mode shift is turned on.',
      data:
        'EPA inventories identify transportation as the largest U.S. greenhouse-gas sector, with road travel and freight a major share of that burden.',
      pros: 'Roads provide nationwide flexibility and fast access to existing communities and freight corridors.',
      cons: 'They lock in tailpipe pollution, heat, congestion, and high per-trip emissions when vehicles stay fossil-fuel intensive.',
      tone: '#334155',
      visible: true,
      sources: [
        {
          label: 'EPA Transportation Emissions',
          url: 'https://www.epa.gov/ghgemissions/sources-greenhouse-gas-emissions',
        },
      ],
    },
    {
      id: 'srm-flights',
      coord: [-98.2, 37.4] as LonLat,
      icon: '✈',
      title: 'Aerosol Flight Network',
      metric: `Deployment index ${totalGeoPlanes}/300`,
      summary:
        'These paths represent repeated aerosol-delivery flights for solar-radiation modification.',
      data:
        'The National Academies notes the 1991 Pinatubo eruption cooled global temperature by roughly 0.5°C for a year or more, but a deliberate system would require continuous upkeep.',
      pros: 'Rapid temperature masking is possible when the aerosol shield is sustained.',
      cons: 'It adds pollution, governance risk, and a large rebound risk if the program stops abruptly.',
      tone: '#f97316',
      visible: totalGeoPlanes > 0,
      sources: [
        {
          label: 'NASEM Solar Geoengineering',
          url: 'https://www.nationalacademies.org/news/would-solar-geoengineering-help-slow-global-warming',
        },
        {
          label: 'IPCC AR6 Ch. 4',
          url: 'https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-4',
        },
      ],
    },
    {
      id: 'night-heat',
      coord: [-85.2, 40.8] as LonLat,
      icon: '☾',
      title: 'Nighttime Heat Retention',
      metric: `+${nighttimeHeatRetention.toFixed(2)}°C overnight penalty`,
      summary:
        'Persistent contrails and thin cloudiness can trap outgoing longwave heat after sunset instead of letting the surface cool efficiently.',
      data:
        'A Nature study found night flights produced a disproportionate share of contrail warming in a regional case study, and the National Academies notes persistent contrails warm especially at night.',
      pros: 'Some of the same cloudiness can reflect daylight while the trail lasts.',
      cons: 'Hotter nights worsen heat stress, lower nighttime recovery, and shrink the daily cooling window.',
      tone: '#1d4ed8',
      visible: totalGeoPlanes > 0,
      sources: [
        {
          label: 'Nature 2006',
          url: 'https://www.nature.com/articles/nature04877',
        },
        {
          label: 'NASEM Contrails',
          url: 'https://www.nationalacademies.org/based-on-science/are-contrails-harmful-to-the-environment',
        },
      ],
    },
    {
      id: 'precipitation-stress',
      coord: [-107.7, 39.1] as LonLat,
      icon: '☔',
      title: 'Precipitation Stress',
      metric: `Stress index ${precipitationStress.toFixed(0)}/100`,
      summary:
        'The model treats water stress as a regional side effect of altered cloud and radiation patterns, especially across already water-limited western landscapes.',
      data:
        'IPCC AR6 says solar-radiation modification changes the hydrological cycle are theoretically expected, with increasing concern for regional water availability.',
      pros: 'If surface heat drops, evaporative demand and acute heat pressure can ease in some locations.',
      cons: 'Rain and snow patterns can shift unevenly, so some regions may trade heat relief for drought or runoff instability.',
      tone: '#0f766e',
      visible: totalGeoPlanes > 0 || timelineYear > 0,
      sources: [
        {
          label: 'IPCC AR6 Ch. 8',
          url: 'https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-8/',
        },
        {
          label: 'WMO Weather Modification',
          url: 'https://public.wmo.int/content/wmo-statement-weather-modification',
        },
      ],
    },
    {
      id: 'ozone-uv',
      coord: [-100.1, 46.7] as LonLat,
      icon: 'UV',
      title: 'Ozone / UV Damage',
      metric: `Damage index ${ozoneUvDamage.toFixed(0)}/100`,
      summary:
        'This indicator captures extra ecological and health risk when aerosol strategies perturb ozone chemistry and increase ultraviolet exposure pressure.',
      data:
        'The National Academies highlights that stratospheric aerosol injection can reduce ozone, and the ozone layer is what blocks too much harmful UV from reaching the surface.',
      pros: 'Cooling can reduce some direct heat hazards if it works as intended.',
      cons: 'More ozone loss raises UV exposure risk for people, crops, and ecosystems even when temperatures look better.',
      tone: '#f59e0b',
      visible: totalGeoPlanes > 0,
      sources: [
        {
          label: 'NASEM Ozone Risk',
          url: 'https://www.nationalacademies.org/news/would-solar-geoengineering-help-slow-global-warming',
        },
        {
          label: 'IPCC AR6 Ch. 4',
          url: 'https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-4',
        },
      ],
    },
    {
      id: 'hsr',
      coord: [-119.1, 36.9] as LonLat,
      icon: '🚄',
      title: 'High-Speed Rail Corridor',
      metric: 'Three intercity rail spines animated',
      summary:
        'The active rail overlay follows a West Coast spine plus an intermountain connector to illustrate mode shift away from road and short-haul flights.',
      data:
        'FRA corridor planning and California / Cascadia / Front Range / Phoenix-Tucson programs informed the rail alignment logic shown here.',
      pros: 'Cuts highway and short-hop aviation emissions while supporting construction and operations jobs.',
      cons: 'Requires large capital build-out and long lead times before the full emissions payoff arrives.',
      tone: '#0ea5e9',
      visible: sustainMix.highSpeedRail,
      sources: [
        {
          label: 'FRA HSR Timeline',
          url: 'https://railroads.fra.dot.gov/rail-network-development/passenger-rail/high-speed-rail/HSR-timeline',
        },
        {
          label: 'FRA Corridor Pipeline',
          url: 'https://railroads.fra.dot.gov/sites/fra.dot.gov/files/2024-04/FY2024%20Corridor%20Identification%20%26%20Development%20Project%20Pipeline%20Report.pdf',
        },
      ],
    },
    {
      id: 'circular',
      coord: [-84.2, 42.45] as LonLat,
      icon: '↺',
      title: 'Circular Economy Loop',
      metric: 'Five industrial cities linked in a reuse network',
      summary:
        'The glowing loop represents remanufacturing, reuse, and recovery replacing one-way flows into landfill zones.',
      data:
        'EPA treats source reduction, reuse, and materials recovery as core circular-economy strategies for cutting waste and upstream materials emissions.',
      pros: 'Shrinks landfill burden, reduces waste-system pollution, and builds more resilient regional supply chains.',
      cons: 'Requires redesigning products, logistics, and local industrial capacity rather than a simple one-step switch.',
      tone: '#14b8a6',
      visible: true,
      sources: [
        {
          label: 'EPA Circular Economy',
          url: 'https://www.epa.gov/circulareconomy',
        },
        {
          label: 'EPA SMM',
          url: 'https://www.epa.gov/smm',
        },
      ],
    },
    {
      id: 'reforestation',
      coord: [-120.95, 45.95] as LonLat,
      icon: '🌲',
      title: 'Reforestation Cluster',
      metric: `${FOREST_SITES.length} anchored forest recovery zones`,
      summary:
        'Tree anchors sit on real forested regions to show carbon removal and habitat restoration growing over degraded land.',
      data:
        'EPA inventories show forests and harvested wood products already operate as a major U.S. carbon sink, so expansion compounds over time rather than instantly.',
      pros: 'Pulls carbon from the atmosphere, cools surfaces, improves habitat, and filters particles locally.',
      cons: 'Benefits mature over years to decades and can be reversed by wildfire, drought, or poor stewardship.',
      tone: '#15803d',
      visible: true,
      popupPlacement: 'below' as const,
      sources: [
        {
          label: 'EPA GHG Inventory',
          url: 'https://www.epa.gov/ghgemissions/inventory-us-greenhouse-gas-emissions-and-sinks',
        },
        {
          label: 'IPCC AR6 WG3',
          url: 'https://www.ipcc.ch/report/ar6/wg3/',
        },
      ],
    },
    {
      id: 'biodiversity',
      coord: [-111.8, 45.8] as LonLat,
      icon: '🦬',
      title: 'Biodiversity Corridor',
      metric: 'Habitat bridges extend between isolated reserves',
      summary:
        'These corridor patches connect fragmented habitat so species can move, adapt, and recover across larger landscapes.',
      data:
        'USGS and USFWS connectivity work repeatedly identifies habitat linkage as a core resilience strategy under climate stress.',
      pros: 'Improves species movement, genetic exchange, and ecosystem resilience under warming pressure.',
      cons: 'Land assembly, cross-jurisdiction coordination, and long ecological timelines make delivery difficult.',
      tone: '#65a30d',
      visible: true,
      popupPlacement: 'below' as const,
      sources: [
        {
          label: 'USGS Connectivity',
          url: 'https://www.usgs.gov/programs/climate-adaptation-science-centers/science/habitat-connectivity',
        },
        {
          label: 'USFWS Corridors',
          url: 'https://www.fws.gov/story/keeping-connections-wild',
        },
      ],
    },
    {
      id: 'waste',
      coord: [-83.45, 42.32] as LonLat,
      icon: '🗑',
      title: 'Landfill / Waste Zone',
      metric: 'Linear take-make-dispose chain',
      summary:
        'These gray mounds and arrows show the baseline one-way materials economy, where cities send waste outward instead of looping value back.',
      data:
        'EPA materials-management guidance treats landfilling as a high-loss end state compared with source reduction, reuse, and recovery.',
      pros: 'It is operationally familiar and easy to understand in today’s infrastructure.',
      cons: 'It concentrates methane, trucking, local pollution, and upstream extraction pressure instead of reducing material demand.',
      tone: '#64748b',
      visible: true,
      sources: [
        {
          label: 'EPA SMM',
          url: 'https://www.epa.gov/smm',
        },
        {
          label: 'EPA Circular Economy',
          url: 'https://www.epa.gov/circulareconomy',
        },
      ],
    },
  ].filter((hotspot) => hotspot.visible);

  const hoveredHotspot = hotspots.find((hotspot) => hotspot.id === hoveredHotspotId) ?? null;

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 26,
        border: '1px solid rgba(148,163,184,0.35)',
        background: 'rgba(255,255,255,0.75)',
        boxShadow: '0 28px 80px rgba(15,23,42,0.22)',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: MAP_STAGE_HEIGHT,
          overflow: 'hidden',
          background:
            'linear-gradient(180deg, rgba(219,234,254,1) 0%, rgba(191,219,254,1) 52%, rgba(224,242,254,1) 100%)',
        }}
      >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 18% 18%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 34%), radial-gradient(circle at 82% 20%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 28%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
        <ComposableMap
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          projection="geoAlbersUsa"
          projectionConfig={{ scale: MAP_SCALE }}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={usColor}
                  stroke="#94a3b8"
                  strokeWidth={0.7}
                  style={{
                    default: { outline: 'none', transition: 'fill 700ms ease' },
                    hover: { fill: usColor, outline: 'none', cursor: 'default' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>
        </ComposableMap>
      </div>

      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'auto' }}
      >
        <defs>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="routeGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="loopGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="50%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <marker id="wasteArrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
          </marker>
        </defs>

        {highwayPaths.map((corridor) => (
          <g key={`highway-${corridor.id}`}>
            <path
              id={`highway-path-${corridor.id}`}
              d={corridor.d}
              fill="none"
              stroke="rgba(15,23,42,0.42)"
              strokeWidth={11}
              strokeLinecap="round"
            />
            <path
              d={corridor.d}
              fill="none"
              stroke="rgba(30,41,59,0.75)"
              strokeWidth={5}
              strokeLinecap="round"
            />
            {!sustainMix.highSpeedRail && (
              <path
                d={corridor.d}
                fill="none"
                stroke="rgba(248,250,252,0.28)"
                strokeWidth={1.6}
                strokeDasharray="2 16"
                className="dash-flow"
              />
            )}
            {Array.from({ length: sustainMix.highSpeedRail ? 1 : 2 }).map((_, index) => (
              <CarSprite
                key={`car-${corridor.id}-${index}`}
                pathId={`highway-path-${corridor.id}`}
                opacity={trafficOpacity}
                dur={`${10 + index * 1.8}s`}
                begin={`${index * 1.1}s`}
              />
            ))}
            {Array.from({ length: sustainMix.highSpeedRail ? 2 : 5 }).map((_, index) => (
              <circle
                key={`traffic-${corridor.id}-${index}`}
                r={sustainMix.highSpeedRail ? 2.5 : 3.2}
                fill={sustainMix.highSpeedRail ? '#cbd5e1' : '#0f172a'}
                opacity={trafficOpacity}
              >
                <animateMotion
                  dur={`${8 + index * 1.4}s`}
                  repeatCount="indefinite"
                  begin={`${index * 0.9}s`}
                  rotate="auto"
                >
                  <mpath href={`#highway-path-${corridor.id}`} />
                </animateMotion>
              </circle>
            ))}
          </g>
        ))}

        {POLLUTION_SITES.map((site, index) => {
          const point = projectPoint(site.coord);
          if (!point) return null;

          return (
            <g key={`pollution-${site.id}`}>
              <PollutionHaze
                x={point[0]}
                y={point[1] + 8}
                opacity={Math.max(smokeOpacity * 0.55, geoPollutionOpacity * 0.42)}
                scale={1 + index * 0.08}
              />
              <SmokeCloud
                x={point[0]}
                y={point[1]}
                opacity={smokeOpacity + geoPollutionOpacity * 0.18}
                delay={index * 0.35}
              />
              {geoPollutionOpacity > 0.14 && (
                <DeadPlantCluster
                  x={point[0] + 20}
                  y={point[1] + 26}
                  opacity={deadPlantOpacity}
                  scale={0.9}
                />
              )}
            </g>
          );
        })}

        {railPaths.map((corridor) => (
          <g
            key={`rail-${corridor.id}`}
            opacity={railOpacity}
            style={{ transition: 'opacity 650ms ease' }}
          >
            <path
              id={`rail-path-${corridor.id}`}
              d={corridor.d}
              fill="none"
              stroke="rgba(15,23,42,0.18)"
              strokeWidth={16}
              strokeLinecap="round"
            />
            <path
              d={corridor.d}
              fill="none"
              stroke="#334155"
              strokeWidth={8}
              strokeLinecap="round"
            />
            <path
              d={corridor.d}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray="3 12"
              className="dash-flow-fast"
            />
            <TrainSprite
              pathId={`rail-path-${corridor.id}`}
              dur={corridor.id === 'northeast-corridor' ? '7.2s' : '8.8s'}
              begin="0s"
              color="#38bdf8"
              windowColor="#e0f2fe"
              scale={corridor.id === 'intermountain-connector' ? 0.95 : 1.05}
            />
            <TrainSprite
              pathId={`rail-path-${corridor.id}`}
              dur={corridor.id === 'northeast-corridor' ? '9s' : '10.4s'}
              begin="1.4s"
              color="#0f172a"
              windowColor="#bae6fd"
              scale={corridor.id === 'west-coast-spine' ? 1 : 0.92}
            />
          </g>
        ))}

        {WASTE_SYSTEMS.map((system) => {
          const city = projectPoint(system.city);
          const landfill = projectPoint(system.landfill);
          if (!city || !landfill) return null;

          return (
            <g key={`waste-${system.id}`}>
              <circle cx={city[0]} cy={city[1]} r={4} fill="#334155" />
              <path
                d={`M ${city[0]} ${city[1]} Q ${(city[0] + landfill[0]) / 2} ${city[1] - 18} ${landfill[0]} ${landfill[1]}`}
                fill="none"
                stroke="rgba(100,116,139,0.75)"
                strokeWidth={2.4}
                strokeDasharray="8 9"
                markerEnd="url(#wasteArrow)"
              />
              <g
                transform={`translate(${landfill[0]} ${landfill[1]}) scale(${landfillScale})`}
                style={{ opacity: landfillOpacity, transition: 'opacity 700ms ease, transform 700ms ease' }}
              >
                <ellipse cx="0" cy="0" rx="18" ry="12" fill="#94a3b8" opacity="0.38" />
                <ellipse cx="-5" cy="-3" rx="12" ry="8" fill="#64748b" opacity="0.75" />
                <ellipse cx="7" cy="2" rx="10" ry="6" fill="#475569" opacity="0.88" />
              </g>
            </g>
          );
        })}

        <path
          d={linePath(CIRCULAR_NETWORK)}
          fill="none"
          stroke="url(#loopGradient)"
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={loopOpacity}
          style={{ transition: 'opacity 700ms ease' }}
        />
        {sustainMix.circularEconomy &&
          CIRCULAR_NETWORK.slice(0, -1).map((coord, index) => {
            const point = projectPoint(coord);
            if (!point) return null;
            return (
              <RecycleGlyph
                key={`loop-node-${index}`}
                x={point[0]}
                y={point[1]}
                scale={0.72}
                delay={`${index * 0.2}s`}
              />
            );
          })}

        {FOREST_SITES.map((site) => {
          const point = projectPoint(site.coord);
          if (!point) return null;

          return (
            <g key={`forest-${site.id}`}>
              <ellipse
                cx={point[0]}
                cy={point[1] + 8}
                rx={22}
                ry={13}
                fill="#9a3412"
                opacity={barrenOpacity}
                style={{ transition: 'opacity 700ms ease' }}
              />
              {geoPollutionOpacity > 0.12 && (
                <>
                  <PollutionHaze
                    x={point[0]}
                    y={point[1] + 10}
                    opacity={deadPlantOpacity * 0.55}
                    scale={0.8}
                  />
                  <DeadPlantCluster
                    x={point[0] - 16}
                    y={point[1] + 18}
                    opacity={deadPlantOpacity}
                    scale={0.9}
                  />
                </>
              )}
              <TreeCluster
                x={point[0]}
                y={point[1]}
                hue={site.hue}
                opacity={treeOpacity}
              />
            </g>
          );
        })}

        {RESERVES.map((reserve) => {
          const point = projectPoint(reserve.coord);
          if (!point) return null;

          return (
            <g key={`reserve-${reserve.id}`} opacity={reserveOpacity} style={{ transition: 'opacity 700ms ease' }}>
              <circle cx={point[0]} cy={point[1]} r={11} fill="rgba(34,197,94,0.26)" stroke="#15803d" strokeWidth={2.5} />
              <circle cx={point[0]} cy={point[1]} r={4.2} fill="#166534" />
              {sustainMix.biodiversityCorridors && (
                <WildlifeGlyph x={point[0] + 14} y={point[1] - 10} scale={0.75} opacity={corridorOpacity} />
              )}
            </g>
          );
        })}

        {biodiversityPaths.map((corridor) => (
          <g
            key={`biodiversity-${corridor.id}`}
            opacity={corridorOpacity}
            style={{ transition: 'opacity 700ms ease' }}
          >
            <path
              d={corridor.d}
              fill="none"
              stroke="rgba(34,197,94,0.24)"
              strokeWidth={22}
              strokeLinecap="round"
              filter="url(#softGlow)"
            />
            <path
              d={corridor.d}
              fill="none"
              stroke="rgba(22,163,74,0.75)"
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray="4 14"
              className="dash-flow-slow"
            />
            {corridor.points.map((coord, pointIndex) => {
              const point = projectPoint(coord);
              if (!point) return null;
              return (
                <TreeCluster
                  key={`corridor-tree-${corridor.id}-${pointIndex}`}
                  x={point[0]}
                  y={point[1] - 4}
                  hue={pointIndex % 2 === 0 ? '#22c55e' : '#15803d'}
                  opacity={corridorOpacity}
                  scale={0.68}
                />
              );
            })}
            {(() => {
              const midpointIndex = Math.floor(corridor.points.length / 2);
              const wildlifePoint = projectPoint(corridor.points[midpointIndex]);
              if (!wildlifePoint) return null;
              return (
                <WildlifeGlyph
                  x={wildlifePoint[0] + 10}
                  y={wildlifePoint[1] - 12}
                  scale={0.9}
                  opacity={corridorOpacity}
                />
              );
            })()}
          </g>
        ))}

        {geoPollutionOpacity > 0.14 &&
          visibleFlights.slice(0, Math.min(visibleFlights.length, 8)).map((route, index) => {
            const point = projectPoint(route.midpoint);
            if (!point) return null;
            return (
              <g key={`aerosol-impact-${route.id}`}>
                <PollutionHaze
                  x={point[0]}
                  y={point[1] + 10}
                  opacity={geoPollutionOpacity * 0.55}
                  scale={0.8 + index * 0.04}
                />
                <DeadPlantCluster
                  x={point[0] + 8}
                  y={point[1] + 24}
                  opacity={deadPlantOpacity * 0.95}
                  scale={0.72}
                />
              </g>
            );
          })}

        {visibleFlights.map((route, index) => (
          <g key={`flight-${route.id}`}>
            <path
              id={`flight-path-${route.id}`}
              d={route.d}
              fill="none"
              stroke={aerosolTint}
              strokeWidth={1.9}
              strokeLinecap="round"
              opacity={0.75}
              filter="url(#routeGlow)"
              strokeDasharray="8 12"
              className="dash-flow"
            />
            <PlaneSprite
              pathId={`flight-path-${route.id}`}
              dur={`${9 + (index % 5)}s`}
              begin={`${index * 0.35}s`}
              scale={0.82}
            />
          </g>
        ))}

        {totalGeoPlanes > 0 && (() => {
          const point = projectPoint([-85.2, 40.8] as LonLat);
          if (!point) return null;
          return <NightHeatGlyph x={point[0]} y={point[1]} opacity={0.88} />;
        })()}

        {(totalGeoPlanes > 0 || timelineYear > 0) && (() => {
          const point = projectPoint([-107.7, 39.1] as LonLat);
          if (!point) return null;
          return (
            <PrecipitationStressGlyph
              x={point[0]}
              y={point[1]}
              opacity={0.84}
            />
          );
        })()}

        {totalGeoPlanes > 0 && (() => {
          const point = projectPoint([-100.1, 46.7] as LonLat);
          if (!point) return null;
          return <UvBurstGlyph x={point[0]} y={point[1]} opacity={0.9} />;
        })()}

        <g>
          {highwayPaths.map((corridor) => (
            <path
              key={`hover-road-${corridor.id}`}
              d={corridor.d}
              fill="none"
              stroke="rgba(0,0,0,0.001)"
              strokeWidth={24}
              strokeLinecap="round"
              style={{ pointerEvents: 'stroke', cursor: 'help' }}
              onMouseEnter={() => openHotspot('roads')}
              onMouseLeave={() => closeHotspotSoon('roads')}
            />
          ))}

          {railOpacity > 0 &&
            railPaths.map((corridor) => (
              <path
                key={`hover-rail-${corridor.id}`}
                d={corridor.d}
                fill="none"
                stroke="rgba(0,0,0,0.001)"
                strokeWidth={24}
                strokeLinecap="round"
                style={{ pointerEvents: 'stroke', cursor: 'help' }}
                onMouseEnter={() => openHotspot('hsr')}
                onMouseLeave={() => closeHotspotSoon('hsr')}
              />
            ))}

          {WASTE_SYSTEMS.map((system) => {
            const city = projectPoint(system.city);
            const landfill = projectPoint(system.landfill);
            if (!city || !landfill) return null;

            return (
              <g key={`hover-waste-${system.id}`}>
                <path
                  d={`M ${city[0]} ${city[1]} Q ${(city[0] + landfill[0]) / 2} ${city[1] - 18} ${landfill[0]} ${landfill[1]}`}
                  fill="none"
                  stroke="rgba(0,0,0,0.001)"
                  strokeWidth={18}
                  style={{ pointerEvents: 'stroke', cursor: 'help' }}
                  onMouseEnter={() => openHotspot('waste')}
                  onMouseLeave={() => closeHotspotSoon('waste')}
                />
                <circle
                  cx={landfill[0]}
                  cy={landfill[1]}
                  r={22}
                  fill="rgba(0,0,0,0.001)"
                  style={{ pointerEvents: 'all', cursor: 'help' }}
                  onMouseEnter={() => openHotspot('waste')}
                  onMouseLeave={() => closeHotspotSoon('waste')}
                />
              </g>
            );
          })}

          {sustainMix.circularEconomy && (
            <path
              d={linePath(CIRCULAR_NETWORK)}
              fill="none"
              stroke="rgba(0,0,0,0.001)"
              strokeWidth={20}
              strokeLinecap="round"
              style={{ pointerEvents: 'stroke', cursor: 'help' }}
              onMouseEnter={() => openHotspot('circular')}
              onMouseLeave={() => closeHotspotSoon('circular')}
            />
          )}

          {FOREST_SITES.map((site) => {
            const point = projectPoint(site.coord);
            if (!point) return null;
            return (
              <circle
                key={`hover-forest-${site.id}`}
                cx={point[0]}
                cy={point[1]}
                r={28}
                fill="rgba(0,0,0,0.001)"
                style={{ pointerEvents: 'all', cursor: 'help' }}
                onMouseEnter={() => openHotspot('reforestation')}
                onMouseLeave={() => closeHotspotSoon('reforestation')}
              />
            );
          })}

          {RESERVES.map((reserve) => {
            const point = projectPoint(reserve.coord);
            if (!point) return null;
            return (
              <circle
                key={`hover-reserve-${reserve.id}`}
                cx={point[0]}
                cy={point[1]}
                r={24}
                fill="rgba(0,0,0,0.001)"
                style={{ pointerEvents: 'all', cursor: 'help' }}
                onMouseEnter={() => openHotspot('biodiversity')}
                onMouseLeave={() => closeHotspotSoon('biodiversity')}
              />
            );
          })}

          {sustainMix.biodiversityCorridors &&
            biodiversityPaths.map((corridor) => (
              <path
                key={`hover-biodiversity-${corridor.id}`}
                d={corridor.d}
                fill="none"
                stroke="rgba(0,0,0,0.001)"
                strokeWidth={26}
                strokeLinecap="round"
                style={{ pointerEvents: 'stroke', cursor: 'help' }}
                onMouseEnter={() => openHotspot('biodiversity')}
                onMouseLeave={() => closeHotspotSoon('biodiversity')}
              />
            ))}

          {visibleFlights.map((route) => (
            <path
              key={`hover-flight-${route.id}`}
              d={route.d}
              fill="none"
              stroke="rgba(0,0,0,0.001)"
              strokeWidth={16}
              strokeLinecap="round"
              style={{ pointerEvents: 'stroke', cursor: 'help' }}
              onMouseEnter={() => openHotspot('srm-flights')}
              onMouseLeave={() => closeHotspotSoon('srm-flights')}
            />
          ))}

          {POLLUTION_SITES.map((site) => {
            const point = projectPoint(site.coord);
            if (!point) return null;
            return (
              <g key={`hover-pollution-${site.id}`}>
                <circle
                  cx={point[0]}
                  cy={point[1]}
                  r={22}
                  fill="rgba(0,0,0,0.001)"
                  style={{ pointerEvents: 'all', cursor: 'help' }}
                  onMouseEnter={() => openHotspot('ozone-uv')}
                  onMouseLeave={() => closeHotspotSoon('ozone-uv')}
                />
                <circle
                  cx={point[0] + 22}
                  cy={point[1] + 24}
                  r={18}
                  fill="rgba(0,0,0,0.001)"
                  style={{ pointerEvents: 'all', cursor: 'help' }}
                  onMouseEnter={() => openHotspot('ozone-uv')}
                  onMouseLeave={() => closeHotspotSoon('ozone-uv')}
                />
              </g>
            );
          })}

          {totalGeoPlanes > 0 && (() => {
            const point = projectPoint([-85.2, 40.8] as LonLat);
            if (!point) return null;
            return (
              <circle
                cx={point[0]}
                cy={point[1]}
                r={26}
                fill="rgba(0,0,0,0.001)"
                style={{ pointerEvents: 'all', cursor: 'help' }}
                onMouseEnter={() => openHotspot('night-heat')}
                onMouseLeave={() => closeHotspotSoon('night-heat')}
              />
            );
          })()}

          {(totalGeoPlanes > 0 || timelineYear > 0) && (() => {
            const point = projectPoint([-107.7, 39.1] as LonLat);
            if (!point) return null;
            return (
              <ellipse
                cx={point[0]}
                cy={point[1]}
                rx={30}
                ry={22}
                fill="rgba(0,0,0,0.001)"
                style={{ pointerEvents: 'all', cursor: 'help' }}
                onMouseEnter={() => openHotspot('precipitation-stress')}
                onMouseLeave={() => closeHotspotSoon('precipitation-stress')}
              />
            );
          })()}

          {totalGeoPlanes > 0 && (() => {
            const point = projectPoint([-100.1, 46.7] as LonLat);
            if (!point) return null;
            return (
              <circle
                cx={point[0]}
                cy={point[1]}
                r={24}
                fill="rgba(0,0,0,0.001)"
                style={{ pointerEvents: 'all', cursor: 'help' }}
                onMouseEnter={() => openHotspot('ozone-uv')}
                onMouseLeave={() => closeHotspotSoon('ozone-uv')}
              />
            );
          })()}
        </g>
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, rgba(253,224,71,${(geoMix.so2 / 100) * 0.12}) 0%, rgba(253,224,71,0) 58%), linear-gradient(180deg, rgba(229,231,235,${(geoMix.alumina / 100) * 0.1}) 0%, rgba(229,231,235,0) 65%), linear-gradient(180deg, rgba(103,232,249,${(geoMix.silverIodide / 100) * 0.1}) 0%, rgba(103,232,249,0) 70%)`,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 18px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.76)',
          border: '1px solid rgba(148,163,184,0.5)',
          boxShadow: '0 16px 30px rgba(15,23,42,0.12)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Continental U.S. Scenario
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{yearLabel}</div>
      </div>

      {geoPollutionOpacity > 0.14 && (
        <div
          style={{
            position: 'absolute',
            top: 94,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 14px',
            borderRadius: 16,
            background: 'rgba(127,29,29,0.78)',
            border: '1px solid rgba(248,113,113,0.55)',
            color: '#fee2e2',
            fontSize: 12,
            boxShadow: '0 14px 26px rgba(127,29,29,0.24)',
            maxWidth: 360,
            textAlign: 'center',
          }}
        >
          EPA notes high sulfur-oxide pollution can damage foliage, decrease growth, and
          acid deposition can leave trees with brown or dead leaves and needles.
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        {hotspots.map((hotspot) => {
          const point = projectPoint(hotspot.coord);
          if (!point) return null;

          return (
            <MapHotspot
              key={hotspot.id}
              hotspot={hotspot}
              point={point}
              active={hoveredHotspot?.id === hotspot.id}
              onActivate={() => openHotspot(hotspot.id)}
              onDeactivate={() => closeHotspotSoon(hotspot.id)}
            />
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 152,
          right: 24,
          padding: '8px 12px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.72)',
          border: '1px solid rgba(148,163,184,0.45)',
          color: '#334155',
          fontSize: 12,
          backdropFilter: 'blur(8px)',
        }}
      >
        Hover roads, plants, rail, waste zones, and climate effects for details
      </div>

      <MetricBadge
        label="Air Pollutants"
        value={`${airPollutantConcentration.toFixed(1)} ug/m3`}
        sublabel="PM2.5-equivalent"
        style={{ top: 24, left: 24 }}
      />
      <MetricBadge
        label="Healthcare Costs"
        value={`$${(healthcareCosts / 1000).toFixed(2)}T`}
        sublabel="CMS-linked growth track"
        style={{ top: 24, right: 24 }}
      />
      <MetricBadge
        label="CO2 Baseline"
        value={`${co2Baseline.toFixed(1)} ppm`}
        sublabel="NOAA atmospheric track"
        style={{ bottom: 28, left: 24 }}
      />
      <MetricBadge
        label="Temperature"
        value={`+${temperatureAnomaly.toFixed(2)} C`}
        sublabel="Relative to preindustrial"
        style={{ bottom: 28, right: 24 }}
      />
      </div>
      <div
        style={{
          padding: '18px 24px 20px',
          background: 'rgba(248,250,252,0.96)',
          borderTop: '1px solid rgba(148,163,184,0.4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            marginBottom: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Timeline Slider
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              Year +{timelineYear} projection
            </div>
          </div>
          <div style={{ color: '#334155', fontSize: 13 }}>
            Outside the map view so the U.S. animation stays unobstructed
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="20"
          step="1"
          value={timelineYear}
          onChange={(event) => setTimelineYear(Number(event.target.value))}
          style={{
            width: '100%',
            height: 8,
            borderRadius: 999,
            appearance: 'none',
            cursor: 'pointer',
            background:
              'linear-gradient(90deg, rgba(59,130,246,0.95) 0%, rgba(34,197,94,0.95) 50%, rgba(245,158,11,0.95) 100%)',
            outline: 'none',
          }}
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            marginTop: 10,
            color: '#475569',
            fontSize: 12,
          }}
        >
          {[0, 5, 10, 15, 20].map((year) => (
            <div key={year} style={{ textAlign: year === 0 ? 'left' : year === 20 ? 'right' : 'center' }}>
              {BASE_YEAR + year}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .dash-flow {
          animation: dashFlow 9s linear infinite;
        }

        .dash-flow-fast {
          animation: dashFlow 4.5s linear infinite;
        }

        .dash-flow-slow {
          animation: dashFlow 12s linear infinite;
        }

        @keyframes dashFlow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -140; }
        }

        @keyframes smokeLift {
          0% { transform: translateY(0px) scale(0.92); opacity: 0.15; }
          50% { transform: translateY(-14px) scale(1); opacity: 0.42; }
          100% { transform: translateY(-26px) scale(1.08); opacity: 0; }
        }

      `}</style>
    </div>
  );
};

const MapHotspot = ({
  hotspot,
  point,
  active,
  onActivate,
  onDeactivate,
}: {
  hotspot: HotspotDefinition;
  point: [number, number];
  active: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) => {
  const xRatio = point[0] / MAP_WIDTH;
  const yRatio = point[1] / MAP_HEIGHT;
  const horizontalAnchor = xRatio < 0.2 ? 'left' : xRatio > 0.8 ? 'right' : 'center';
  const showBelow =
    hotspot.popupPlacement === 'below'
      ? true
      : hotspot.popupPlacement === 'above'
        ? false
        : yRatio < 0.18;

  const tooltipTransform =
    horizontalAnchor === 'left'
      ? 'translate(0, 0)'
      : horizontalAnchor === 'right'
        ? 'translate(-100%, 0)'
        : 'translate(-50%, 0)';

  return (
    <div
      style={{
        position: 'absolute',
        left: `${(point[0] / MAP_WIDTH) * 100}%`,
        top: `${(point[1] / MAP_HEIGHT) * 100}%`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto',
        zIndex: active ? 45 : 30,
      }}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
    >
      <button
        type="button"
        aria-label={hotspot.title}
        style={{
          width: 38,
          height: 38,
          borderRadius: 999,
          border: `2px solid ${hotspot.tone}`,
          background: active ? hotspot.tone : 'rgba(255,255,255,0.84)',
          color: active ? '#ffffff' : hotspot.tone,
          display: 'grid',
          placeItems: 'center',
          fontSize: hotspot.icon === 'UV' ? 11 : 17,
          fontWeight: 800,
          boxShadow: active
            ? `0 0 0 8px ${hotspot.tone}22, 0 12px 24px rgba(15,23,42,0.18)`
            : '0 10px 20px rgba(15,23,42,0.14)',
          transition: 'transform 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease',
          transform: active ? 'scale(1.08)' : 'scale(1)',
          cursor: 'pointer',
        }}
      >
        {hotspot.icon}
      </button>

      {active && (
        <div
          style={{
            position: 'absolute',
            top: showBelow ? 44 : 'auto',
            bottom: showBelow ? 'auto' : 44,
            left:
              horizontalAnchor === 'left'
                ? 0
                : horizontalAnchor === 'right'
                  ? 38
                  : 19,
            width: 268,
            maxHeight: 250,
            overflowY: 'auto',
            padding: 13,
            borderRadius: 18,
            border: `1px solid ${hotspot.tone}66`,
            background: 'rgba(255,255,255,0.96)',
            boxShadow: '0 20px 40px rgba(15,23,42,0.18)',
            backdropFilter: 'blur(12px)',
            transform: tooltipTransform,
            color: '#0f172a',
            overscrollBehavior: 'contain',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: hotspot.tone,
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: hotspot.icon === 'UV' ? 9 : 14,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {hotspot.icon}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{hotspot.title}</div>
              <div style={{ fontSize: 11, color: hotspot.tone, fontWeight: 700 }}>{hotspot.metric}</div>
            </div>
          </div>

          <div style={{ color: '#334155', fontSize: 11, lineHeight: 1.55 }}>{hotspot.summary}</div>

          <div
            style={{
              marginTop: 9,
              padding: '9px 10px',
              borderRadius: 12,
              background: `${hotspot.tone}12`,
              border: `1px solid ${hotspot.tone}33`,
              color: '#1e293b',
              fontSize: 11,
              lineHeight: 1.55,
            }}
          >
            <strong>Data:</strong> {hotspot.data}
          </div>

          <div style={{ marginTop: 9, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div
              style={{
                padding: '8px 9px',
                borderRadius: 12,
                background: 'rgba(34,197,94,0.1)',
                color: '#166534',
                fontSize: 11,
                lineHeight: 1.5,
              }}
            >
              <strong>Pros:</strong> {hotspot.pros}
            </div>
            <div
              style={{
                padding: '8px 9px',
                borderRadius: 12,
                background: 'rgba(239,68,68,0.08)',
                color: '#991b1b',
                fontSize: 11,
                lineHeight: 1.5,
              }}
            >
              <strong>Cons:</strong> {hotspot.cons}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
            {hotspot.sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: hotspot.tone,
                  textDecoration: 'none',
                  fontSize: 10,
                  padding: '5px 8px',
                  borderRadius: 999,
                  border: `1px solid ${hotspot.tone}55`,
                  background: 'rgba(248,250,252,0.85)',
                }}
              >
                {source.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricBadge = ({
  label,
  value,
  sublabel,
  style,
}: {
  label: string;
  value: string;
  sublabel: string;
  style: React.CSSProperties;
}) => (
  <div
    style={{
      position: 'absolute',
      minWidth: 170,
      padding: '14px 16px',
      borderRadius: 18,
      background: 'rgba(255,255,255,0.74)',
      border: '1px solid rgba(148,163,184,0.48)',
      boxShadow: '0 18px 32px rgba(15,23,42,0.12)',
      backdropFilter: 'blur(12px)',
      ...style,
    }}
  >
    <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
      {label}
    </div>
    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{value}</div>
    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{sublabel}</div>
  </div>
);

const CarSprite = ({
  pathId,
  opacity,
  dur,
  begin,
}: {
  pathId: string;
  opacity: number;
  dur: string;
  begin: string;
}) => (
  <g opacity={opacity}>
    <g filter="url(#softGlow)">
      <rect x="-8" y="-4.5" width="16" height="8" rx="2.8" fill="#f8fafc" />
      <rect x="-5.5" y="-8" width="11" height="5.5" rx="2" fill="#cbd5e1" />
      <circle cx="-4.5" cy="4.2" r="2.1" fill="#0f172a" />
      <circle cx="4.5" cy="4.2" r="2.1" fill="#0f172a" />
      <rect x="-3.5" y="-6.4" width="3.5" height="2.5" rx="0.8" fill="#0ea5e9" />
      <rect x="0.8" y="-6.4" width="3.5" height="2.5" rx="0.8" fill="#0ea5e9" />
    </g>
    <animateMotion dur={dur} repeatCount="indefinite" begin={begin} rotate="auto">
      <mpath href={`#${pathId}`} />
    </animateMotion>
  </g>
);

const TrainSprite = ({
  pathId,
  dur,
  begin,
  color,
  windowColor,
  scale,
}: {
  pathId: string;
  dur: string;
  begin: string;
  color: string;
  windowColor: string;
  scale: number;
}) => (
  <g filter="url(#softGlow)">
    <g transform={`scale(${scale})`}>
      <rect x="-15" y="-7" width="28" height="14" rx="6" fill={color} />
      <polygon points="13,-7 22,0 13,7" fill={color} />
      <rect x="-10.5" y="-3.8" width="4" height="3.2" rx="0.8" fill={windowColor} />
      <rect x="-4.5" y="-3.8" width="4" height="3.2" rx="0.8" fill={windowColor} />
      <rect x="1.5" y="-3.8" width="4" height="3.2" rx="0.8" fill={windowColor} />
      <circle cx="16.5" cy="0" r="1.6" fill="#fde68a" />
      <circle cx="-8.5" cy="7.2" r="1.8" fill="#0f172a" />
      <circle cx="8.5" cy="7.2" r="1.8" fill="#0f172a" />
    </g>
    <animateMotion dur={dur} repeatCount="indefinite" begin={begin} rotate="auto">
      <mpath href={`#${pathId}`} />
    </animateMotion>
  </g>
);

const PlaneSprite = ({
  pathId,
  dur,
  begin,
  scale,
}: {
  pathId: string;
  dur: string;
  begin: string;
  scale: number;
}) => (
  <g filter="url(#routeGlow)">
    <g transform={`scale(${scale})`}>
      <path
        d="M-12 1 L-2 1 L6 9 L10 9 L7 1 L14 1 L18 4 L22 4 L18 0 L22 -4 L18 -4 L14 -1 L7 -1 L10 -9 L6 -9 L-2 -1 L-12 -1 Z"
        fill="#f8fafc"
        stroke="#0f172a"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="16.5" cy="0" r="1.5" fill="#bae6fd" />
    </g>
    <animateMotion dur={dur} repeatCount="indefinite" begin={begin} rotate="auto">
      <mpath href={`#${pathId}`} />
    </animateMotion>
  </g>
);

const TreeCluster = ({
  x,
  y,
  hue,
  opacity,
  scale = 1,
}: {
  x: number;
  y: number;
  hue: string;
  opacity: number;
  scale?: number;
}) => (
  <g
    transform={`translate(${x} ${y})`}
    style={{ opacity, transition: 'opacity 700ms ease' }}
  >
    <g
      style={{
        transform: `scale(${opacity > 0 ? scale : scale * 0.35})`,
        transformOrigin: 'center',
        transformBox: 'fill-box',
        transition: 'transform 700ms ease',
      }}
    >
      <rect x="-1.8" y="3" width="3.6" height="10" rx="1.8" fill="#7c2d12" />
      <circle cx="-5.5" cy="0" r="6.5" fill={hue} />
      <circle cx="5.2" cy="1.2" r="6.2" fill="#22c55e" />
      <circle cx="0.4" cy="-5.8" r="7.4" fill="#16a34a" />
    </g>
  </g>
);

const PollutionHaze = ({
  x,
  y,
  opacity,
  scale = 1,
}: {
  x: number;
  y: number;
  opacity: number;
  scale?: number;
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <ellipse cx="0" cy="0" rx="26" ry="14" fill="rgba(71,85,105,0.35)" />
    <ellipse cx="-12" cy="4" rx="18" ry="10" fill="rgba(51,65,85,0.28)" />
    <ellipse cx="12" cy="2" rx="16" ry="8" fill="rgba(100,116,139,0.24)" />
  </g>
);

const DeadPlantCluster = ({
  x,
  y,
  opacity,
  scale = 1,
}: {
  x: number;
  y: number;
  opacity: number;
  scale?: number;
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <path d="M0 0 C-1 -6 -1 -10 0 -14" stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <path d="M-1 -8 C-5 -11 -7 -15 -8 -18" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M0 -9 C4 -11 6 -14 7 -18" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M-8 -18 L-13 -17 L-9 -22 Z" fill="#b45309" />
    <path d="M7 -18 L12 -17 L8 -22 Z" fill="#92400e" />
    <path d="M12 -2 C11 -7 11 -10 12 -13" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M11 -8 C15 -11 17 -15 18 -18" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M18 -18 L23 -17 L19 -22 Z" fill="#b45309" />
  </g>
);

const RecycleGlyph = ({
  x,
  y,
  scale,
  delay,
}: {
  x: number;
  y: number;
  scale: number;
  delay: string;
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} filter="url(#softGlow)">
    <circle cx="0" cy="0" r="10" fill="rgba(20,184,166,0.2)" stroke="#2dd4bf" strokeWidth="1.6" />
    <path d="M-2 -7 L4 -7 L1 -11 Z" fill="#99f6e4">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from={`0 0 0`}
        to={`360 0 0`}
        dur="5s"
        begin={delay}
        repeatCount="indefinite"
      />
    </path>
    <path d="M6 0 L6 6 L10 3 Z" fill="#99f6e4">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from={`0 0 0`}
        to={`360 0 0`}
        dur="5s"
        begin={delay}
        repeatCount="indefinite"
      />
    </path>
    <path d="M-8 3 L-4 7 L-10 8 Z" fill="#99f6e4">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from={`0 0 0`}
        to={`360 0 0`}
        dur="5s"
        begin={delay}
        repeatCount="indefinite"
      />
    </path>
  </g>
);

const WildlifeGlyph = ({
  x,
  y,
  scale,
  opacity,
}: {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} filter="url(#softGlow)">
    <path
      d="M-8 4 C-7 -1 -2 -6 4 -6 C9 -6 13 -2 13 2 C13 7 8 10 2 10 L-3 10 C-6 10 -8 7 -8 4 Z"
      fill="#14532d"
    />
    <circle cx="-2" cy="-7" r="3.2" fill="#166534" />
    <path d="M-5 -9 L-8 -14" stroke="#365314" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M1 -9 L4 -14" stroke="#365314" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10.5" cy="-2.5" r="2" fill="#22c55e" />
    <path d="M9 -2 L14 -4 L13 0 Z" fill="#22c55e" />
  </g>
);

const NightHeatGlyph = ({
  x,
  y,
  opacity,
}: {
  x: number;
  y: number;
  opacity: number;
}) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity} filter="url(#softGlow)">
    <circle cx="0" cy="0" r="17" fill="rgba(30,64,175,0.16)" />
    <path
      d="M-5 -14 C-1 -6 -1 6 -10 12 C0 13 10 6 11 -7 C11 -11 8 -15 3 -17 C6 -17 1 -16 -5 -14 Z"
      fill="#1d4ed8"
    />
    <path d="M-20 14 C-10 8 3 8 18 14" stroke="rgba(249,115,22,0.9)" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M-12 19 C-4 15 7 15 18 20" stroke="rgba(251,191,36,0.8)" strokeWidth="3" strokeLinecap="round" fill="none" />
  </g>
);

const PrecipitationStressGlyph = ({
  x,
  y,
  opacity,
}: {
  x: number;
  y: number;
  opacity: number;
}) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity} filter="url(#softGlow)">
    <ellipse cx="0" cy="0" rx="26" ry="18" fill="rgba(180,83,9,0.15)" />
    <path d="M-14 -6 C-11 -14 2 -17 10 -11 C17 -15 25 -7 21 1 C18 8 11 9 0 9 C-10 9 -17 5 -17 -1 C-17 -3 -16 -5 -14 -6 Z" fill="#0f766e" />
    <path d="M-8 13 L-4 21" stroke="#67e8f9" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M2 13 L6 21" stroke="#67e8f9" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M12 13 L16 21" stroke="#67e8f9" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M-18 22 C-9 16 6 16 20 23" stroke="#b45309" strokeWidth="3.4" strokeLinecap="round" fill="none" />
  </g>
);

const UvBurstGlyph = ({
  x,
  y,
  opacity,
}: {
  x: number;
  y: number;
  opacity: number;
}) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity} filter="url(#softGlow)">
    <circle cx="0" cy="0" r="11" fill="#facc15" />
    {Array.from({ length: 10 }).map((_, index) => {
      const angle = (Math.PI * 2 * index) / 10;
      const x1 = Math.cos(angle) * 16;
      const y1 = Math.sin(angle) * 16;
      const x2 = Math.cos(angle) * 24;
      const y2 = Math.sin(angle) * 24;
      return (
        <line
          key={`uv-ray-${index}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
        />
      );
    })}
    <text x="0" y="4" textAnchor="middle" fontSize="8" fontWeight="800" fill="#78350f">
      UV
    </text>
  </g>
);

const SmokeCloud = ({
  x,
  y,
  opacity,
  delay,
}: {
  x: number;
  y: number;
  opacity: number;
  delay: number;
}) => (
  <g transform={`translate(${x} ${y})`} style={{ opacity, transition: 'opacity 700ms ease' }}>
    <g style={{ animation: `smokeLift 4.4s ease-in-out ${delay}s infinite` }}>
      <circle cx="0" cy="0" r="9" fill="rgba(71,85,105,0.35)" />
      <circle cx="8" cy="-5" r="7" fill="rgba(100,116,139,0.28)" />
      <circle cx="-7" cy="-4" r="6" fill="rgba(148,163,184,0.24)" />
    </g>
  </g>
);

export default USAMap;
