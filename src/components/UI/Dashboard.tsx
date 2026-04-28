import React, { useState } from 'react';
import { useGameState } from '../../store/gameState';
import { Activity, AlertTriangle, AlertCircle, Info, Wind } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    manufacturingGdp, smallBizGdp, qol, jobs, aqi, 
    healthcareCosts, biodiversityIndex, temperatureAnomaly,
    terminationStatus, co2Baseline, geoMix, sustainMix
  } = useGameState();

  const totalGeoPlanes = geoMix.so2 + geoMix.alumina + geoMix.silverIodide;
  const isGeoOnly = totalGeoPlanes > 0 && !Object.values(sustainMix).some(v => v);

  return (
    <div className="flex flex-col gap-4 p-5 text-white font-sans w-full">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
          Secondary Dashboard
        </span>
        <p className="text-sm text-gray-400">
          Economic, health, and biosphere indicators that complement the live map.
        </p>
      </div>

      {/* Warning Panels */}
      {isGeoOnly && (
        <div className="bg-orange-900/40 border border-orange-500 rounded p-3 flex items-start gap-2">
          <AlertTriangle className="text-orange-400 mt-1 flex-shrink-0" size={18} />
          <p className="text-sm text-orange-200">
            <strong>Warning:</strong> Net cooling is partially negated by nighttime heat trapping (Aerosol Greenhouse Effect).
          </p>
        </div>
      )}

      {terminationStatus === 'Fast_Shock' && (
        <div className="bg-red-900/40 border border-red-500 rounded p-3 flex items-start gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] fade-in">
          <AlertCircle className="text-red-400 mt-1 flex-shrink-0" size={18} />
          <p className="text-sm text-red-200">
            <strong>Termination Shock Risk:</strong> Fast Shock (+3°C spike in 24mos) if aerosol injection abruptly halts! Maintain &gt;50% sustainability.
          </p>
        </div>
      )}

      {/* Global Environmental KPI */}
      <div className="grid grid-cols-2 gap-3">
        <Meter label="Temperature" value={`+${temperatureAnomaly.toFixed(2)}°C`} icon={<Activity size={16} />} color="text-red-400" />
        <Meter label="CO2 Baseline" value={`${co2Baseline} ppm`} icon={<Wind size={16} />} color="text-gray-400" />
      </div>

      <hr className="border-gray-800" />

      {/* Economy KPI with Reference Link */}
      <div className="relative">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Economy & Jobs</span>
          <InfoIcon source={"US Real Data References:\nMfg GDP Base: $2.95T (NAM 2025)\nSmall Biz GDP Base: $12.0T (43.5% of $28T total US GDP)\nHealthcare Cost Base: $5.3T (CMS 2024 Projections)"} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Meter label="Mfg GDP" value={`$${(manufacturingGdp / 1000).toFixed(2)}T`} sub={manufacturingGdp < 2950 ? "Dropping" : "Stable"} />
          <Meter label="Small Biz GDP" value={`$${(smallBizGdp / 1000).toFixed(2)}T`} sub={smallBizGdp > 12000 ? "Growing" : "Stable"} />
          <Meter label="Est. Jobs" value={`${(jobs / 1000000).toFixed(2)}M`} color="text-green-400" />
          <Meter label="Quality of Life" value={`${qol}/100`} color="text-blue-400" />
        </div>
      </div>

      <hr className="border-gray-800" />

      {/* Health & Nature KPI */}
      <div className="grid grid-cols-2 gap-3">
        <Meter label="AQI" value={Math.floor(aqi).toString()} />
        <Meter label="Health Costs" value={`$${(healthcareCosts / 1000).toFixed(2)}T`} color="text-red-300" />
        <Meter label="Biodiversity" value={`${Math.floor(biodiversityIndex)}/100`} color="text-green-300" />
      </div>

      <hr className="border-gray-800" />
      
      {/* Symptoms Hover Area */}
      <SymptomsPanel />

    </div>
  );
};

// Hit-box component for Symptoms
const SymptomsPanel = () => {
  const { geoMix } = useGameState();
  const [activeTab, setActiveTab] = useState<'Birds' | 'Humans' | 'Plants'>('Humans');

  const getSymptom = () => {
    if (activeTab === 'Birds') return "Sluggish orientation, thin eggshells.";
    if (activeTab === 'Humans') {
      if (geoMix.alumina > 50) return "Neurotoxicity risks observed.";
      if (geoMix.so2 > 50) return "Bronchoconstriction, asthma spikes.";
      return "General air quality impact.";
    }
    if (activeTab === 'Plants') return "Acid rain effects, reduced photosynthesis yield.";
    return "";
  };

  const getSource = () => {
    if (activeTab === 'Birds') return "Trisos 2018; IPCC Extinction Report.";
    if (activeTab === 'Humans') return "Eastham 2018 (Health Impacts).";
    if (activeTab === 'Plants') return "Proctor et al. 2018.";
    return "IPCC General";
  };

  return (
    <div className="bg-[#1E293B] border border-gray-700 rounded-lg p-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-300">Biosphere Impact</h3>
        <InfoIcon source={getSource()} />
      </div>
      <div className="flex gap-2 mb-2">
        {['Humans', 'Birds', 'Plants'].map((tab) => (
          <button 
            key={tab}
            onMouseEnter={() => setActiveTab(tab as 'Humans' | 'Birds' | 'Plants')}
            className={`px-3 py-1 text-xs rounded transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 min-h-[40px] italic">
        {getSymptom()}
      </p>
    </div>
  );
};

const Meter = ({ label, value, sub, icon, color = "text-white" }: { label: string, value: string, sub?: string, icon?: React.ReactNode, color?: string }) => (
  <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 flex flex-col justify-center">
    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
      {icon} {label}
    </div>
    <div className={`text-xl font-bold ${color}`}>
      {value}
    </div>
    {sub && <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>}
  </div>
);

const InfoIcon = ({ source }: { source: string }) => {
  return (
    <div className="relative group cursor-pointer inline-block">
      <Info size={14} className="text-indigo-400 hover:text-indigo-300" />
      <div className="absolute right-0 top-full mt-1 w-64 p-2 bg-gray-900 border border-gray-700 text-[10px] text-gray-300 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-pre-wrap">
        {source}
      </div>
    </div>
  );
}

export default Dashboard;
