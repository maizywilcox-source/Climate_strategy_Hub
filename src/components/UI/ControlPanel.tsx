import React, { useMemo, useState } from 'react';
import { ChevronDown, Info, Plane, Settings } from 'lucide-react';
import { useGameState, type GeoMix, type SustainMix } from '../../store/gameState';

type PolicyKey = keyof SustainMix;

interface SourceLink {
  label: string;
  url: string;
}

interface PolicyDetail {
  title: string;
  accent: string;
  summary: string;
  explanation: string;
  modeledEffect: string;
  sources: SourceLink[];
}

const policyDetails: Record<PolicyKey, PolicyDetail> = {
  reforestation: {
    title: 'Reforestation',
    accent: '#22c55e',
    summary: 'Restore degraded forest land and let the national carbon sink deepen as tree cover matures.',
    explanation:
      'EPA inventories show U.S. forests and harvested wood products already remove a meaningful share of gross emissions each year. Expanding tree cover helps pull carbon out of the air, cools surfaces, and filters particulate pollution.',
    modeledEffect:
      'In the simulator, the carbon-removal effect ramps up each year to reflect forest maturation, while biodiversity, jobs, and health improve gradually instead of all at once.',
    sources: [
      {
        label: 'EPA LULUCF Inventory',
        url: 'https://www.epa.gov/ghgemissions/inventory-us-greenhouse-gas-emissions-and-sinks',
      },
      {
        label: 'IPCC AR6 WG3',
        url: 'https://www.ipcc.ch/report/ar6/wg3/',
      },
    ],
  },
  circularEconomy: {
    title: 'Circular Economy',
    accent: '#14b8a6',
    summary: 'Shift from take-make-dispose toward reuse, remanufacturing, recycling, and lower landfill dependence.',
    explanation:
      'EPA sustainable-materials guidance treats source reduction, reuse, and materials recovery as key ways to cut waste-system emissions and reduce the upstream extraction burden tied to manufacturing.',
    modeledEffect:
      'The model compounds circular savings over time by shrinking waste-related pollution, easing health costs, and gradually improving small-business resilience as closed-loop supply chains scale.',
    sources: [
      {
        label: 'EPA Circular Economy',
        url: 'https://www.epa.gov/circulareconomy',
      },
      {
        label: 'EPA Sustainable Materials Management',
        url: 'https://www.epa.gov/smm',
      },
    ],
  },
  highSpeedRail: {
    title: 'High-Speed Rail',
    accent: '#38bdf8',
    summary: 'Move dense travel demand from car and short-haul air corridors onto electrified rail.',
    explanation:
      'Transportation remains the largest U.S. greenhouse-gas sector in EPA inventories, and passenger rail can carry travelers with materially lower emissions intensity than comparable highway and short-hop aviation trips. The western rail overlay now follows a more realistic coast-spine plus intermountain concept based on current FRA corridor planning in California, Cascadia, Arizona, and Colorado.',
    modeledEffect:
      'The simulator reduces traffic-linked pollutant exposure and modestly lowers temperature and CO2 growth as rail corridors mature year by year, while adding construction and operations jobs.',
    sources: [
      {
        label: 'EPA Sources of Greenhouse Gas Emissions',
        url: 'https://www.epa.gov/ghgemissions/sources-greenhouse-gas-emissions',
      },
      {
        label: 'Amtrak Sustainability',
        url: 'https://www.amtrak.com/sustainability',
      },
      {
        label: 'FRA HSR Timeline',
        url: 'https://railroads.fra.dot.gov/rail-network-development/passenger-rail/high-speed-rail/HSR-timeline',
      },
      {
        label: 'FRA Corridor Pipeline Report',
        url: 'https://railroads.fra.dot.gov/sites/fra.dot.gov/files/2024-04/FY2024%20Corridor%20Identification%20%26%20Development%20Project%20Pipeline%20Report.pdf',
      },
    ],
  },
  biodiversityCorridors: {
    title: 'Biodiversity Corridors',
    accent: '#84cc16',
    summary: 'Reconnect isolated habitats so species can move, adapt, and recover across fragmented landscapes.',
    explanation:
      'Wildlife agencies and climate-adaptation studies repeatedly point to habitat connectivity as one of the strongest tools for helping species survive fragmentation, fire, drought, and range shifts.',
    modeledEffect:
      'Here, corridor benefits ramp as habitat patches connect, lifting biodiversity directly and slightly improving heat and air outcomes through added vegetative cover.',
    sources: [
      {
        label: 'USFWS Wildlife Corridors',
        url: 'https://www.fws.gov/story/keeping-connections-wild',
      },
      {
        label: 'USGS Habitat Connectivity',
        url: 'https://www.usgs.gov/programs/climate-adaptation-science-centers/science/habitat-connectivity',
      },
    ],
  },
};

const geoSources: SourceLink[] = [
  {
    label: 'National Academies: Reflecting Sunlight',
    url: 'https://nap.nationalacademies.org/catalog/25762/reflecting-sunlight-recommendations-for-solar-geoengineering-research-and-research',
  },
  {
    label: 'EPA Sulfur Dioxide Health Effects',
    url: 'https://www.epa.gov/so2-pollution/sulfur-dioxide-basics',
  },
  {
    label: 'EPA Acid Rain Effects',
    url: 'https://www.epa.gov/acidrain/effects-acid-rain',
  },
  {
    label: 'NOAA Cloud Radiative Effect',
    url: 'https://www.gfdl.noaa.gov/cloud-radiative-effect/',
  },
  {
    label: 'IPCC Water Cycle Changes',
    url: 'https://www.ipcc.ch/report/ar6/wg1/chapter/chapter-8/',
  },
  {
    label: 'IPCC AR6 WG1',
    url: 'https://www.ipcc.ch/report/ar6/wg1/',
  },
];

const controlShell: React.CSSProperties = {
  width: 320,
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  padding: 24,
  color: '#f8fafc',
  background:
    'linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(2,6,23,0.98) 100%)',
  border: '1px solid rgba(71,85,105,0.45)',
  borderRadius: 20,
  boxShadow: '0 24px 60px rgba(2,6,23,0.35)',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const ControlPanel: React.FC = () => {
  const {
    geoMix,
    setGeoMix,
    sustainMix,
    setSustainMix,
    timelineYear,
    airPollutantConcentration,
    co2Baseline,
    temperatureAnomaly,
  } = useGameState();

  const [openPanels, setOpenPanels] = useState<PolicyKey[]>([
    'reforestation',
    'highSpeedRail',
  ]);

  const activePolicies = useMemo(
    () => Object.values(sustainMix).filter(Boolean).length,
    [sustainMix],
  );

  const handleGeoChange = (gas: keyof GeoMix, value: number) => {
    setGeoMix({ ...geoMix, [gas]: value });
  };

  const handlePolicyToggle = (policy: PolicyKey) => {
    setSustainMix({ ...sustainMix, [policy]: !sustainMix[policy] });
  };

  const handleAccordionToggle = (policy: PolicyKey) => {
    setOpenPanels((prev) =>
      prev.includes(policy)
        ? prev.filter((entry) => entry !== policy)
        : [...prev, policy],
    );
  };

  return (
    <div style={controlShell}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            color: '#cbd5e1',
            fontSize: 12,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          <Info size={14} />
          Live Scenario Controls
        </div>
        <h2 style={{ fontSize: 26, lineHeight: 1.15, fontWeight: 800 }}>
          Climate levers update the 20-year forecast in real time
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>
          The map timeline beneath the U.S. view steps from Year 0 to Year +20. Each
          policy compounds as the scenario matures instead of flipping to a full effect
          immediately.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 12,
        }}
      >
        <SnapshotCard label="Year" value={`+${timelineYear}`} tone="#a5b4fc" />
        <SnapshotCard
          label="Air Pollutants"
          value={`${airPollutantConcentration.toFixed(1)} ug/m3`}
          tone="#fca5a5"
        />
        <SnapshotCard label="CO2" value={`${co2Baseline.toFixed(1)} ppm`} tone="#cbd5e1" />
        <SnapshotCard
          label="Temp"
          value={`+${temperatureAnomaly.toFixed(2)} C`}
          tone="#fdba74"
        />
      </div>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 21,
              fontWeight: 800,
              color: '#93c5fd',
            }}
          >
            <Plane size={20} />
            Geoengineering Mix
          </div>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>
            These sliders behave like a deployment-intensity index. SRM can cool quickly,
            but the health and termination-shock literature says it cannot replace deep
            emissions cuts, and EPA notes that high sulfur-oxide concentrations can damage
            foliage, reduce plant growth, and contribute to brown or dead leaves and
            needles through acid deposition. The map now also tracks nighttime heat
            retention, precipitation stress, and ozone / UV damage as hoverable impacts.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Slider
            label="SO2 aerosol sorties"
            value={geoMix.so2}
            color="linear-gradient(90deg, #fef3c7 0%, #fde68a 100%)"
            onChange={(value) => handleGeoChange('so2', value)}
          />
          <Slider
            label="Alumina sorties"
            value={geoMix.alumina}
            color="linear-gradient(90deg, #e2e8f0 0%, #ffffff 100%)"
            onChange={(value) => handleGeoChange('alumina', value)}
          />
          <Slider
            label="Silver iodide sorties"
            value={geoMix.silverIodide}
            color="linear-gradient(90deg, #a5f3fc 0%, #67e8f9 100%)"
            onChange={(value) => handleGeoChange('silverIodide', value)}
          />
        </div>

        <SourceBlock
          title="Geoengineering sources"
          subtitle="Cooling and health-risk context"
          links={geoSources}
        />
      </section>

      <div style={{ height: 1, background: 'rgba(51,65,85,0.75)' }} />

      <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 21,
              fontWeight: 800,
              color: '#86efac',
            }}
          >
            <Settings size={20} />
            Sustainability Mix
          </div>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>
            {activePolicies} of 4 policies active. Each card explains what the policy does,
            why it helps, and how its benefit is scaled in the simulator.
          </p>
        </div>

        {(
          Object.keys(policyDetails) as PolicyKey[]
        ).map((policy) => {
          const detail = policyDetails[policy];
          const isOpen = openPanels.includes(policy);
          const isActive = sustainMix[policy];

          return (
            <div
              key={policy}
              style={{
                borderRadius: 18,
                border: `1px solid ${isActive ? `${detail.accent}88` : 'rgba(71,85,105,0.6)'}`,
                background: isActive
                  ? `linear-gradient(180deg, ${detail.accent}14 0%, rgba(15,23,42,0.9) 100%)`
                  : 'rgba(15,23,42,0.72)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  borderBottom: isOpen ? '1px solid rgba(71,85,105,0.45)' : 'none',
                }}
              >
                <button
                  onClick={() => handleAccordionToggle(policy)}
                  style={{
                    flex: 1,
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{detail.title}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                      {detail.summary}
                    </span>
                  </div>
                  <ChevronDown
                    size={18}
                    style={{
                      flexShrink: 0,
                      color: '#cbd5e1',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 180ms ease',
                    }}
                  />
                </button>

                <button
                  onClick={() => handlePolicyToggle(policy)}
                  style={{
                    minWidth: 96,
                    padding: '0 16px',
                    borderLeft: '1px solid rgba(71,85,105,0.45)',
                    background: isActive ? detail.accent : 'rgba(30,41,59,0.9)',
                    color: isActive ? '#06210f' : '#e2e8f0',
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {isActive ? 'Active' : 'Enable'}
                </button>
              </div>

              {isOpen && (
                <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.65 }}>
                    {detail.explanation}
                  </div>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: 'rgba(15,23,42,0.82)',
                      border: '1px solid rgba(71,85,105,0.45)',
                      color: '#cbd5e1',
                      fontSize: 12,
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ color: '#f8fafc' }}>Modeled in the sim:</strong>{' '}
                    {detail.modeledEffect}
                  </div>
                  <SourceBlock
                    title="Sources"
                    subtitle="Web-vetted references"
                    links={detail.sources}
                    compact
                  />
                </div>
              )}
            </div>
          );
        })}
      </section>

      <div
        style={{
          padding: 14,
          borderRadius: 16,
          border: '1px solid rgba(71,85,105,0.5)',
          background: 'rgba(2,6,23,0.65)',
          color: '#94a3b8',
          fontSize: 12,
          lineHeight: 1.6,
        }}
      >
        Forecast math anchors to NOAA atmospheric CO2 trends, NOAA warming-rate guidance,
        CMS health-spending projections, EPA emissions and materials-management guidance,
        and U.S. habitat-connectivity / rail references linked above.
      </div>
    </div>
  );
};

const Slider = ({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        fontSize: 14,
      }}
    >
      <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{label}</span>
      <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{value}</span>
    </div>
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      style={{
        width: '100%',
        height: 8,
        borderRadius: 999,
        cursor: 'pointer',
        appearance: 'none',
        background: color,
        outline: 'none',
      }}
    />
  </div>
);

const SnapshotCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) => (
  <div
    style={{
      padding: 14,
      borderRadius: 16,
      border: `1px solid ${tone}33`,
      background: 'rgba(15,23,42,0.78)',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}
  >
    <span style={{ color: '#94a3b8', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
      {label}
    </span>
    <span style={{ color: tone, fontSize: 18, fontWeight: 800 }}>{value}</span>
  </div>
);

const SourceBlock = ({
  title,
  subtitle,
  links,
  compact = false,
}: {
  title: string;
  subtitle: string;
  links: SourceLink[];
  compact?: boolean;
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: compact ? 8 : 10,
      padding: compact ? 0 : 14,
      borderRadius: compact ? 0 : 14,
      border: compact ? 'none' : '1px solid rgba(71,85,105,0.45)',
      background: compact ? 'transparent' : 'rgba(2,6,23,0.4)',
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ color: '#f8fafc', fontSize: 12, fontWeight: 700 }}>{title}</span>
      <span style={{ color: '#64748b', fontSize: 11 }}>{subtitle}</span>
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          style={{
            color: '#93c5fd',
            textDecoration: 'none',
            fontSize: 11,
            padding: '6px 10px',
            borderRadius: 999,
            border: '1px solid rgba(147,197,253,0.35)',
            background: 'rgba(30,41,59,0.55)',
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  </div>
);

export default ControlPanel;
