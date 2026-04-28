import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useGameState } from '../../store/gameState';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ExportButton: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const gameState = useGameState();

  const handleExport = async () => {
    setIsExporting(true);
    
    // Slight delay to allow UI to show loader
    setTimeout(async () => {
      try {
        const doc = new jsPDF();
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(22);
        doc.text('Climate Strategy Policy Brief', 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Year: 2026 | CO2 Baseline: ${gameState.co2Baseline} ppm`, 20, 30);
        
        doc.setFontSize(16);
        doc.text('Current Simulation Status', 20, 45);
        
        doc.setFontSize(12);
        doc.text(`Temperature Anomaly: +${gameState.temperatureAnomaly.toFixed(2)}C`, 20, 55);
        doc.text(`Termination Risk Status: ${gameState.terminationStatus.replace('_', ' ')}`, 20, 65);
        doc.text(`Air Quality Index (AQI): ${Math.floor(gameState.aqi)}`, 20, 75);
        
        doc.setFontSize(16);
        doc.text('Socio-Economic Impacts', 20, 95);
        
        doc.setFontSize(12);
        doc.text(`Manufacturing GDP: $${gameState.manufacturingGdp}B`, 20, 105);
        doc.text(`Small Business GDP: $${gameState.smallBizGdp}B`, 20, 115);
        doc.text(`Estimated Green Jobs: ${(gameState.jobs / 1000000).toFixed(2)} Million`, 20, 125);
        doc.text(`Healthcare Costs: $${gameState.healthcareCosts}B`, 20, 135);
        doc.text(`Biodiversity Index: ${Math.floor(gameState.biodiversityIndex)}/100`, 20, 145);
        doc.text(`Quality of Life: ${gameState.qol}/100`, 20, 155);

        // Try to capture the map visually
        const mapElement = document.getElementById('map-container');
        if (mapElement) {
          const canvas = await html2canvas(mapElement, { scale: 1 });
          const imgData = canvas.toDataURL('image/png');
          doc.addImage(imgData, 'PNG', 20, 170, 170, 100);
        }

        doc.save('Climate_Strategy_Brief_2026.pdf');
      } catch (err) {
        console.error("Export failed", err);
      } finally {
        setIsExporting(false);
      }
    }, 100);
  };

  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          style={{
            color: '#67e8f9',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Presentation Output
        </span>
        <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
          Capture the current scenario as a quick policy-style takeaway for class review
          or portfolio presentation.
        </p>
      </div>

      <button
        onClick={handleExport}
        disabled={isExporting}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          width: '100%',
          padding: '14px 18px',
          borderRadius: 18,
          fontWeight: 800,
          letterSpacing: '0.04em',
          color: isExporting ? '#a5b4fc' : '#ecfeff',
          background: isExporting
            ? 'linear-gradient(135deg, rgba(49,46,129,0.9) 0%, rgba(30,41,59,0.95) 100%)'
            : 'linear-gradient(135deg, rgba(6,182,212,0.92) 0%, rgba(59,130,246,0.92) 52%, rgba(16,185,129,0.88) 100%)',
          boxShadow: isExporting
            ? '0 16px 32px rgba(30,41,59,0.28)'
            : '0 18px 36px rgba(14, 116, 144, 0.3)',
          transition: 'transform 180ms ease, box-shadow 180ms ease, filter 180ms ease',
          cursor: isExporting ? 'not-allowed' : 'pointer',
          filter: isExporting ? 'saturate(0.8)' : 'saturate(1)',
        }}
      >
        {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
        {isExporting ? 'Generating PDF...' : 'Export Policy Brief'}
      </button>
    </div>
  );
};

export default ExportButton;
