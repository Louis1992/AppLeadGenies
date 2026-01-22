
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Phone, Users, Percent, Target, Mail, ArrowRight, Star, PhoneOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const generatePDFContent = (report, chartData) => {
    const logoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d686979fcb5eebed4ce832/1d708729d_leadgenies_logo_purple_claim.png";
    const styles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; color: #1f2937; line-height: 1.5; padding: 40px; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .page { max-width: 800px; margin: auto; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; }
        .header .title h1 { font-size: 28px; font-weight: 800; margin: 0; color: #111827; }
        .header .title p { font-size: 18px; color: #4b5563; margin-top: 4px; font-weight: 500; }
        .header img { height: 40px; }
        .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 20px; margin-bottom: 40px; }
        .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; text-align: center; }
        .card h3 { margin: 8px 0 0; font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; }
        .card p { margin: 0; font-size: 28px; font-weight: 700; color: #111827; }
        .highlight-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 24px; margin-bottom: 40px; }
        .highlight-main { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 24px; text-align: center; }
        .highlight-main h3 { font-size: 20px; font-weight: 700; color: #15803d; }
        .highlight-main p { font-size: 60px; font-weight: 800; color: #166534; line-height: 1.1; margin-top: 8px; }
        .highlight-side { display: flex; flex-direction: column; gap: 16px; }
        .highlight-side .card { background: #faf5ff; border: 1px solid #e9d5ff; padding: 16px; }
        .highlight-side .card p { color: #5b21b6; }
        .highlight-side .card-amber { background: #fffbeb; border-color: #fde68a; }
        .highlight-side .card-amber p { color: #b45309; }
        .chart-container { margin-top: 40px; }
        .chart-title { font-size: 20px; font-weight: 700; margin-bottom: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; }
        .bar-row { display: flex; align-items: center; margin-bottom: 16px; }
        .bar-label { width: 140px; font-size: 14px; font-weight: 500; color: #374151; padding-right: 12px; text-align: right; }
        .bar-wrapper { flex-grow: 1; }
        .bar { height: 35px; border-radius: 0 8px 8px 0; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; min-width: 30px;} /* Added min-width for small values */
        .bar span { font-size: 14px; font-weight: 600; color: #1f2937; }
      </style>
    `;

    const metricsHTML = `
      <div class="grid-4">
        <div class="card"><p>${report.total_calls}</p><h3>Anrufe gesamt</h3></div>
        <div class="card"><p>${report.reached_contacts}</p><h3>Kontakte erreicht</h3></div>
        <div class="card"><p>${report.connection_rate}%</p><h3>Connection Rate</h3></div>
        <div class="card" style="background-color: #f0fdf4; border-color: #bbf7d0;"><p>${report.appointment_rate_vs_total}% / ${report.appointment_rate_vs_reached}%</p><h3 style="color: #15803d;">Terminsetzungsrate</h3></div>
      </div>
    `;

    const highlightHTML = `
      <div class="highlight-grid">
        <div class="highlight-main">
          <h3>Termine vereinbart</h3><p>${report.breakdown.termin_vereinbart || 0}</p>
        </div>
        <div class="highlight-side">
          <div class="card"><p>${report.breakdown.wichtige_email_gesendet || 0}</p><h3>Wichtige E-Mails</h3></div>
          <div class="card card-amber"><p>${report.breakdown.email_gesendet || 0}</p><h3>Info E-Mails</h3></div>
        </div>
      </div>
    `;

    const maxChartValue = Math.max(...chartData.map(d => d.Anzahl));
    const chartHTML = chartData.map(item => `
      <div class="bar-row">
        <div class="bar-label">${item.name}</div>
        <div class="bar-wrapper">
          <div class="bar" style="background-color: ${item.color}; width: ${maxChartValue > 0 ? (item.Anzahl / maxChartValue) * 100 : 0}%;">
            <span>${item.Anzahl}</span>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <html><head><title>Wochenreporting ${report.period}</title>${styles}</head><body><div class="page">
          <div class="header">
            <div class="title"><h1>Wochenreporting</h1><p>${report.period}</p></div>
            <img src="${logoUrl}" alt="Logo" />
          </div>
          ${metricsHTML}
          ${highlightHTML}
          <div class="chart-container">
            <h2 class="chart-title">Aufschlüsselung der erreichten Kontakte</h2>
            ${chartHTML}
          </div>
      </div></body></html>
    `;
};


export default function ReportDisplay({ report }) {
  // Neue Farbpalette und Definition der Ergebnisse für das Chart
  const resultTypes = [
    { key: 'termin_vereinbart', title: 'Termin', icon: Target, color: '#16a34a' }, // Grün
    { key: 'wichtige_email_gesendet', title: 'Wichtige E-Mail', icon: Star, color: '#8b5cf6' }, // Lila (Violet-500)
    { key: 'rueckruf', title: 'Rückruf', icon: Phone, color: '#3b82f6' }, // Hellblau (Blue-500)
    { key: 'email_gesendet', title: 'E-Mail', icon: Mail, color: '#f59e0b' }, // Gelb (Amber-500)
    { key: 'moechte_nicht_mehr_kontaktiert_werden', title: 'abgelehnt', icon: PhoneOff, color: '#ef4444' }, // Rot (Red-500)
    // Wiedervorlage wird nicht mehr angezeigt
  ];

  const chartData = resultTypes
    .map(type => ({ name: type.title, Anzahl: report.breakdown[type.key] || 0, color: type.color }))
    .filter(item => item.Anzahl > 0)
    .sort((a, b) => b.Anzahl - a.Anzahl);

  const handleExport = () => {
    const content = generatePDFContent(report, chartData);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };
    
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 border border-gray-200/80">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Wochenreporting</h2>
          <p className="text-xl text-gray-500 font-semibold">{report.period}</p>
        </div>
        <Button onClick={handleExport} className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm">
          <FileText className="w-5 h-5 mr-2" />
          Als PDF exportieren
        </Button>
      </div>

      {/* Neue Metriken 2x2 Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
        <MetricCard title="Anrufe gesamt" value={report.total_calls} icon={Phone} />
        <MetricCard title="Kontakte erreicht" value={report.reached_contacts} icon={Users} />
        <MetricCard title="Connection Rate" value={`${report.connection_rate}%`} icon={Percent} />
        <MetricCard title="Terminsetzungsrate" value={`${report.appointment_rate_vs_total}% / ${report.appointment_rate_vs_reached}%`} icon={Target} color="text-green-600" />
      </div>

      {/* Neue Highlight Sektion */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
        <div className="lg:col-span-3 bg-green-100/70 border border-green-200/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-center items-center text-center text-green-800">
           <h3 className="text-xl sm:text-2xl font-bold mb-2">Termine vereinbart</h3>
           <p className="text-6xl sm:text-7xl font-bold tracking-tighter">{report.breakdown.termin_vereinbart || 0}</p>
        </div>
        <div className="lg:col-span-2 space-y-4">
            <HighlightCard title="Wichtige E-Mails" value={report.breakdown.wichtige_email_gesendet || 0} icon={Star} color="text-violet-500" />
            <HighlightCard title="Info E-Mails" value={report.breakdown.email_gesendet || 0} icon={Mail} color="text-amber-500" />
        </div>
      </div>


      {/* Chart */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Aufschlüsselung der erreichten Kontakte</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 50, left: 20, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#374151', fontSize: 14 }} axisLine={false} tickLine={false} />
            <Tooltip
                cursor={{ fill: 'rgba(243, 244, 246, 0.7)' }}
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold' }}
            />
            <Bar dataKey="Anzahl" barSize={35} radius={[0, 8, 8, 0]}>
              <LabelList dataKey="Anzahl" position="right" offset={10} style={{ fill: '#374151', fontSize: 14, fontWeight: '600' }} />
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const MetricCard = ({ title, value, icon: Icon, color = 'text-blue-600' }) => (
    <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-4 text-center hover:shadow-md hover:border-gray-300 transition-all">
        <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
    </div>
)

const HighlightCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-4 flex items-center space-x-4">
        <div className={`bg-blue-100/50 p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <h3 className="text-base font-semibold text-gray-500">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
)
