/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type TerminationStatus = 'Active' | 'Fast_Shock' | 'Slow_Transition';

export interface GeoMix {
  so2: number;
  alumina: number;
  silverIodide: number;
}

export interface SustainMix {
  reforestation: boolean;
  circularEconomy: boolean;
  highSpeedRail: boolean;
  biodiversityCorridors: boolean;
}

interface GameState {
  timelineYear: number;
  setTimelineYear: (year: number) => void;
  co2Baseline: number;
  geoMix: GeoMix;
  sustainMix: SustainMix;
  setGeoMix: (mix: GeoMix) => void;
  setSustainMix: (mix: SustainMix) => void;
  manufacturingGdp: number;
  smallBizGdp: number;
  qol: number;
  jobs: number;
  aqi: number;
  airPollutantConcentration: number;
  healthcareCosts: number;
  biodiversityIndex: number;
  temperatureAnomaly: number;
  nighttimeHeatRetention: number;
  precipitationStress: number;
  ozoneUvDamage: number;
  toxicity: number;
  environmentalScore: number;
  terminationStatus: TerminationStatus;
}

const GameContext = createContext<GameState | undefined>(undefined);

// Source anchors used for the forecast constants:
// NOAA CO2 trends: https://gml.noaa.gov/ccgg/trends/
// NOAA warming rate context: https://www.climate.gov/news-features/understanding-climate/climate-change-global-temperature
// CMS NHE projections: https://www.cms.gov/data-research/statistics-trends-and-reports/national-health-expenditure-data/projected
// EPA emissions by sector: https://www.epa.gov/ghgemissions/sources-greenhouse-gas-emissions
// EPA materials / circular economy: https://www.epa.gov/smm and https://www.epa.gov/circulareconomy
// EPA forest sink inventory: https://www.epa.gov/ghgemissions/inventory-us-greenhouse-gas-emissions-and-sinks
// NOAA cloud longwave / shortwave balance: https://www.gfdl.noaa.gov/cloud-radiative-effect/
// IPCC AR6 water-cycle response to SRM: https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-8/
// National Academies ozone / UV concerns from SAI: https://www.nationalacademies.org/news/would-solar-geoengineering-help-slow-global-warming
// Contrail night-warming sensitivity: https://www.nature.com/articles/nature04877

const BASE_CO2_PPM = 427.35;
const BASE_TEMPERATURE_ANOMALY = 1.34;
const BASE_PM25_EQ = 8.2;
const BASE_HEALTHCARE_COSTS = 5300;
const BASE_MANUFACTURING_GDP = 2950;
const BASE_SMALL_BIZ_GDP = 12180;
const BASE_JOBS = 161_000_000;
const BASE_QOL = 50;
const BASE_BIODIVERSITY = 58;

const BAU_CO2_GROWTH_PER_YEAR = 2.6;
const BAU_TEMPERATURE_GROWTH_PER_YEAR = 0.02;
const BAU_PM25_GROWTH_PER_YEAR = 0.08;
const BAU_HEALTHCARE_GROWTH_RATE = 0.056;
const BAU_MANUFACTURING_GROWTH_RATE = 0.012;
const BAU_SMALL_BIZ_GROWTH_RATE = 0.021;
const BAU_JOBS_GROWTH_RATE = 0.003;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const roundTo = (value: number, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const pm25ToAqi = (pm25: number) => {
  const breakpoints = [
    { cLow: 0, cHigh: 12, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
  ];

  const band = breakpoints.find(({ cLow, cHigh }) => pm25 >= cLow && pm25 <= cHigh);
  if (!band) {
    return pm25 > 150.4 ? 201 : 0;
  }

  const { cLow, cHigh, iLow, iHigh } = band;
  return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (pm25 - cLow) + iLow);
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timelineYear, setTimelineYear] = useState(0);
  const [geoMix, setGeoMix] = useState<GeoMix>({
    so2: 0,
    alumina: 0,
    silverIodide: 0,
  });

  const [sustainMix, setSustainMix] = useState<SustainMix>({
    reforestation: false,
    circularEconomy: false,
    highSpeedRail: false,
    biodiversityCorridors: false,
  });

  const derivedState = useMemo(() => {
    const totalGeoPlanes = geoMix.so2 + geoMix.alumina + geoMix.silverIodide;
    const geoScale = totalGeoPlanes / 300;

    let co2Baseline = BASE_CO2_PPM;
    let temperatureAnomaly = BASE_TEMPERATURE_ANOMALY;
    let airPollutantConcentration = BASE_PM25_EQ;
    let healthcareCosts = BASE_HEALTHCARE_COSTS;
    let manufacturingGdp = BASE_MANUFACTURING_GDP;
    let smallBizGdp = BASE_SMALL_BIZ_GDP;
    let jobs = BASE_JOBS;
    let qol = BASE_QOL;
    let biodiversityIndex = BASE_BIODIVERSITY;
    let nighttimeHeatRetention = 0.03;
    let precipitationStress = 6;
    let ozoneUvDamage = 3;

    const geoCoolingOffset =
      geoMix.so2 * 0.00055 + geoMix.alumina * 0.00035 + geoMix.silverIodide * 0.00025;

    const geoPmPenalty =
      geoMix.so2 * 0.012 + geoMix.alumina * 0.009 + geoMix.silverIodide * 0.006;

    const geoCo2PenaltyPerYear =
      geoMix.so2 * 0.00035 + geoMix.alumina * 0.00025 + geoMix.silverIodide * 0.00015;

    const geoHealthcarePenaltyRate = geoScale * 0.01;

    // The slider selects a future year. We step the model year-by-year so baseline
    // growth is linear in time while policy benefits accumulate as systems mature.
    for (let year = 1; year <= timelineYear; year += 1) {
      co2Baseline += BAU_CO2_GROWTH_PER_YEAR + geoCo2PenaltyPerYear;
      temperatureAnomaly += BAU_TEMPERATURE_GROWTH_PER_YEAR + geoScale * 0.0015;
      airPollutantConcentration += BAU_PM25_GROWTH_PER_YEAR + geoScale * 0.09;
      healthcareCosts *= 1 + BAU_HEALTHCARE_GROWTH_RATE + geoHealthcarePenaltyRate;
      manufacturingGdp *= 1 + BAU_MANUFACTURING_GROWTH_RATE;
      smallBizGdp *= 1 + BAU_SMALL_BIZ_GROWTH_RATE;
      jobs *= 1 + BAU_JOBS_GROWTH_RATE;
      biodiversityIndex -= 0.35;
      qol -= 0.08;
      precipitationStress += 0.22;

      if (sustainMix.reforestation) {
        const maturityFactor = 1 + year * 0.04;
        co2Baseline -= 0.18 * maturityFactor;
        temperatureAnomaly -= 0.0028 * maturityFactor;
        airPollutantConcentration -= 0.03 * maturityFactor;
        healthcareCosts *= 0.9982;
        biodiversityIndex += 1.0 * maturityFactor;
        jobs += 95_000;
        qol += 0.26;
        precipitationStress -= 0.12;
      }

      if (sustainMix.circularEconomy) {
        const materialsLoopFactor = 1 + year * 0.03;
        co2Baseline -= 0.15 * materialsLoopFactor;
        airPollutantConcentration -= 0.055 * materialsLoopFactor;
        healthcareCosts *= 0.9964;
        manufacturingGdp *= year < 6 ? 0.998 : 1.003;
        smallBizGdp *= 1.004;
        biodiversityIndex += 0.28;
        jobs += 70_000;
        qol += 0.2;
        precipitationStress -= 0.05;
      }

      if (sustainMix.highSpeedRail) {
        const corridorScale = 1 + year * 0.02;
        co2Baseline -= 0.09 * corridorScale;
        temperatureAnomaly -= 0.0012 * corridorScale;
        airPollutantConcentration -= 0.045 * corridorScale;
        healthcareCosts *= 0.9972;
        smallBizGdp *= 1.0035;
        jobs += 82_000;
        qol += 0.22;
        nighttimeHeatRetention -= 0.002;
      }

      if (sustainMix.biodiversityCorridors) {
        const habitatScale = 1 + year * 0.025;
        temperatureAnomaly -= 0.0008 * habitatScale;
        airPollutantConcentration -= 0.015 * habitatScale;
        healthcareCosts *= 0.999;
        biodiversityIndex += 1.1 * habitatScale;
        jobs += 35_000;
        qol += 0.12;
        precipitationStress -= 0.09;
      }
    }

    const nightMitigation =
      (sustainMix.highSpeedRail ? 0.09 + timelineYear * 0.004 : 0) +
      (sustainMix.circularEconomy ? 0.035 + timelineYear * 0.0015 : 0);

    nighttimeHeatRetention = clamp(
      0.03 + geoScale * (0.12 + timelineYear * 0.022) - nightMitigation,
      0.02,
      0.85,
    );

    const hydroBuffer =
      (sustainMix.reforestation ? 2.6 + timelineYear * 0.22 : 0) +
      (sustainMix.biodiversityCorridors ? 1.8 + timelineYear * 0.18 : 0) +
      (sustainMix.circularEconomy ? 1.2 + timelineYear * 0.1 : 0) +
      (sustainMix.highSpeedRail ? 0.9 + timelineYear * 0.08 : 0);

    precipitationStress = clamp(
      precipitationStress + geoScale * (6 + timelineYear * 0.42) - hydroBuffer,
      0,
      100,
    );

    const ecosystemShield =
      (sustainMix.reforestation ? 2.2 + timelineYear * 0.12 : 0) +
      (sustainMix.biodiversityCorridors ? 1.8 + timelineYear * 0.14 : 0);

    ozoneUvDamage = clamp(
      3 +
        geoScale * (8 + timelineYear * 0.75) +
        geoMix.so2 * 0.07 +
        geoMix.alumina * 0.05 -
        ecosystemShield,
      0,
      60,
    );

    airPollutantConcentration = clamp(airPollutantConcentration + geoPmPenalty, 4.5, 30);
    temperatureAnomaly = clamp(temperatureAnomaly - geoCoolingOffset, 0.8, 3.5);
    biodiversityIndex = clamp(biodiversityIndex, 10, 100);
    qol = clamp(qol, 10, 100);

    airPollutantConcentration = clamp(
      airPollutantConcentration + nighttimeHeatRetention * 0.35 + precipitationStress * 0.012,
      4.5,
      30,
    );

    temperatureAnomaly = clamp(temperatureAnomaly + nighttimeHeatRetention * 0.05, 0.8, 3.5);
    healthcareCosts += nighttimeHeatRetention * 120 + ozoneUvDamage * 18;
    biodiversityIndex = clamp(
      biodiversityIndex - precipitationStress * 0.22 - ozoneUvDamage * 0.15,
      10,
      100,
    );
    qol = clamp(
      qol - nighttimeHeatRetention * 4.5 - precipitationStress * 0.08 - ozoneUvDamage * 0.07,
      10,
      100,
    );

    const pollutionPressure = clamp((airPollutantConcentration - 5) / 8, 0, 1);
    const geoToxicityPressure =
      (geoMix.so2 * 0.35 + geoMix.alumina * 0.22 + geoMix.silverIodide * 0.12) / 100;

    const toxicity = clamp(
      pollutionPressure * 70 +
        geoToxicityPressure * 35 +
        nighttimeHeatRetention * 18 +
        precipitationStress * 0.28 +
        ozoneUvDamage * 0.42,
      0,
      100,
    );

    let sustainabilityScore = 0;
    if (sustainMix.reforestation) sustainabilityScore += 22 + timelineYear * 1.2;
    if (sustainMix.circularEconomy) sustainabilityScore += 20 + timelineYear * 1.0;
    if (sustainMix.highSpeedRail) sustainabilityScore += 18 + timelineYear * 0.9;
    if (sustainMix.biodiversityCorridors) sustainabilityScore += 16 + timelineYear * 0.9;
    sustainabilityScore = clamp(sustainabilityScore, 0, 100);

    const environmentalScore = clamp(sustainabilityScore - toxicity, -100, 100);

    let terminationStatus: TerminationStatus = 'Active';
    if (totalGeoPlanes > 0 && sustainabilityScore < 35) {
      terminationStatus = 'Fast_Shock';
    } else if (totalGeoPlanes > 0 && sustainabilityScore < 65) {
      terminationStatus = 'Slow_Transition';
    }

    return {
      manufacturingGdp: roundTo(manufacturingGdp, 1),
      smallBizGdp: roundTo(smallBizGdp, 1),
      qol: roundTo(qol, 1),
      jobs: Math.round(jobs),
      aqi: pm25ToAqi(airPollutantConcentration),
      airPollutantConcentration: roundTo(airPollutantConcentration),
      healthcareCosts: roundTo(healthcareCosts, 1),
      biodiversityIndex: roundTo(biodiversityIndex, 1),
      temperatureAnomaly: roundTo(temperatureAnomaly),
      nighttimeHeatRetention: roundTo(nighttimeHeatRetention),
      precipitationStress: roundTo(precipitationStress, 1),
      ozoneUvDamage: roundTo(ozoneUvDamage, 1),
      co2Baseline: roundTo(co2Baseline),
      toxicity: roundTo(toxicity),
      environmentalScore: roundTo(environmentalScore),
      terminationStatus,
    };
  }, [geoMix, sustainMix, timelineYear]);

  return (
    <GameContext.Provider
      value={{
        timelineYear,
        setTimelineYear,
        geoMix,
        sustainMix,
        setGeoMix,
        setSustainMix,
        ...derivedState,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
};
