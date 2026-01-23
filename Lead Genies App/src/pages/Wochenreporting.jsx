
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadFile } from "@/api/supabase-integrations";
import { parse, format, min, max } from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from 'lucide-react';

import ReportUpload from '../components/reporting/ReportUpload';
import ReportDisplay from '../components/reporting/ReportDisplay';

// IMPORTANT NOTE: CSV data extraction is currently disabled after migration to Supabase.
// This feature requires AI integration (OpenAI, Claude, etc.) to extract structured data from CSV files.
// For now, manual CSV parsing could be implemented, or this feature can be re-enabled by integrating
// with an AI service. See SUPABASE_MIGRATION_PLAN.md for details.

export default function Wochenreporting() {
  const [reportData, setReportData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState(null);

  const handleGenerateReport = async (files) => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setReportData(null);

    try {
      const dailyReports = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProcessingStatus(`Verarbeite Datei ${i + 1}/${files.length}: ${file.name}`);

        // 1. Datum extrahieren
        const reportDate = extractDateFromFileName(file.name);
        if (!reportDate) {
          throw new Error(`Konnte das Datum aus dem Dateinamen "${file.name}" nicht extrahieren. Format muss sein: "Reporting_YYYY-MM-DD" (z.B. "Reporting_2025-11-05")`);
        }

        // 2. Datei hochladen
        const { file_url } = await UploadFile({ file });

        // TODO: AI-based CSV extraction is not yet implemented after Supabase migration
        // This requires integration with OpenAI/Claude API
        // For now, throw an error to indicate this feature needs to be implemented
        throw new Error(
          'CSV-Datenextraktion ist nach der Supabase-Migration noch nicht verfügbar. ' +
          'Diese Funktion benötigt eine AI-Integration (OpenAI, Claude, etc.). ' +
          'Bitte kontaktieren Sie den Entwickler, um diese Funktion zu aktivieren.'
        );

        // ORIGINAL CODE (commented out for reference):
        // const extractionResult = await ExtractDataFromUploadedFile({
        //   file_url,
        //   json_schema: {
        //     type: "array",
        //     items: {
        //       type: "object",
        //       properties: {
        //         "Ergebnis": { "type": "string" }
        //       }
        //     }
        //   }
        // });
        //
        // if (extractionResult.status !== 'success' || !extractionResult.output) {
        //     throw new Error(`Fehler beim Analysieren der CSV-Datei "${file.name}". Stellen Sie sicher, dass sie die Spalte "Ergebnis" enthält.`);
        // }
        //
        // // 3. Tägliche Metriken analysieren
        // dailyReports.push(analyzeDailyData(extractionResult.output, reportDate));
      }

      // 4. Alle Tagesberichte zu einem Wochenbericht zusammenfassen
      const aggregatedReport = aggregateReports(dailyReports);
      setReportData(aggregatedReport);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const extractDateFromFileName = (fileName) => {
    // Neues Format: Reporting_YYYY-MM-DD (z.B. Reporting_2025-11-05)
    const regex = /Reporting_(\d{4}-\d{2}-\d{2})/i;
    const match = fileName.match(regex);
    if (!match) return null;

    const dateString = match[1];
    return parse(dateString, 'yyyy-MM-dd', new Date());
  };

  const analyzeDailyData = (results, date) => {
    // Breakdown zählt alle möglichen Ergebnisse
    const breakdown = {
      email_gesendet: 0,
      wichtige_email_gesendet: 0,
      termin_vereinbart: 0,
      moechte_nicht_mehr_kontaktiert_werden: 0,
      rueckruf: 0,
      wiedervorlage: 0,
      ungueltige_nummer: 0,
      sonstiges: 0,
    };
    
    // Genaue Definition, was als "erreicht" gilt.
    const reachedMapping = {
      'e-mail gesendet': 'email_gesendet',
      'wichtige e-mail gesendet': 'wichtige_email_gesendet',
      'termin vereinbart': 'termin_vereinbart',
      'möchte nicht mehr kontaktiert werden': 'moechte_nicht_mehr_kontaktiert_werden',
      'rückruf': 'rueckruf'
    };

    // Nur Zeilen zählen, die einen Wert in der Spalte "Ergebnis" haben
    const validCalls = results.filter(row => row.Ergebnis && row.Ergebnis.trim() !== '');
    
    // Analysiere nur die gefilterten, validen Anrufe.
    validCalls.forEach(row => {
      const result = row.Ergebnis.toLowerCase().trim();
      const key = reachedMapping[result];
      if (key) {
        breakdown[key]++;
      } else if (result.includes('wiedervorlage')) {
        breakdown.wiedervorlage++;
      } else if (result.includes('ungültige nummer')) {
        breakdown.ungueltige_nummer++;
      } else if (result) { // Jedes andere nicht-leere Ergebnis wird als 'sonstiges' gezählt
        breakdown.sonstiges++;
      }
    });

    const total_calls = validCalls.length;
    
    // Erreichte Kontakte sind die Summe der Werte aus dem genauen Mapping.
    const reached_contacts = Object.values(reachedMapping).reduce((sum, key) => sum + breakdown[key], 0);

    return {
      date,
      total_calls,
      reached_contacts,
      breakdown
    };
  };

  const aggregateReports = (dailyReports) => {
    const allDates = dailyReports.map(r => r.date);
    const startDate = min(allDates);
    const endDate = max(allDates);

    const aggregated = dailyReports.reduce((acc, report) => {
      acc.total_calls += report.total_calls;
      acc.reached_contacts += report.reached_contacts;
      for (const key in report.breakdown) {
        acc.breakdown[key] = (acc.breakdown[key] || 0) + report.breakdown[key];
      }
      return acc;
    }, {
      total_calls: 0, reached_contacts: 0,
      breakdown: {}
    });

    aggregated.connection_rate = aggregated.total_calls > 0 ? Math.round((aggregated.reached_contacts / aggregated.total_calls) * 100) : 0;
    
    // Zwei Terminsetzungsraten berechnen
    const appointments = aggregated.breakdown.termin_vereinbart || 0;
    aggregated.appointment_rate_vs_total = aggregated.total_calls > 0 ? Math.round((appointments / aggregated.total_calls) * 100) : 0;
    aggregated.appointment_rate_vs_reached = aggregated.reached_contacts > 0 ? Math.round((appointments / aggregated.reached_contacts) * 100) : 0;

    aggregated.startDate = startDate;
    aggregated.endDate = endDate;
    aggregated.period = `${format(startDate, 'dd. MMM', { locale: de })} - ${format(endDate, 'dd. MMM yyyy', { locale: de })}`;

    return aggregated;
  };
  
  const resetState = () => {
    setReportData(null);
    setError(null);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d686979fcb5eebed4ce832/1d708729d_leadgenies_logo_purple_claim.png" alt="Leadgenies Logo" className="h-10 mb-4" />
            <h1 className="text-4xl font-bold text-gray-800">Wochenreporting Generator</h1>
            <p className="text-gray-600 mt-1">Laden Sie Ihre täglichen CSV-Berichte hoch, um einen Wochen-Report zu erstellen.</p>
        </div>
        {reportData && (
          <Button onClick={resetState} variant="outline">Neuen Report erstellen</Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center bg-white/50 rounded-2xl p-12">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-gray-700 mb-4" />
            <p className="text-xl font-semibold text-gray-800">Berichte werden analysiert...</p>
            <p className="text-gray-600 mt-2">{processingStatus}</p>
          </motion.div>
        ) : error ? (
           <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <Alert variant="destructive" className="bg-red-100 border-red-200 p-6">
                <AlertTriangle className="h-5 w-5" />
                <AlertDescription className="ml-4">
                  <p className="font-bold text-lg">Ein Fehler ist aufgetreten</p>
                  <p>{error}</p>
                </AlertDescription>
              </Alert>
           </motion.div>
        ) : reportData ? (
          <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ReportDisplay report={reportData} />
          </motion.div>
        ) : (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ReportUpload onGenerate={handleGenerateReport} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
