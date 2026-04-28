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
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg font-semibold transition-all shadow-lg ${
        isExporting ? 'bg-indigo-800 text-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-[1.02]'
      }`}
    >
      {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
      {isExporting ? 'Generating PDF...' : 'Export Policy Brief'}
    </button>
  );
};

export default ExportButton;
