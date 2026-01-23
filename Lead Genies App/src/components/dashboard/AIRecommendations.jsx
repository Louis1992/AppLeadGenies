import React, { useState } from 'react';
import { Sparkles, ChevronRight, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/entities';

export default function AIRecommendations({ weeklyReports, employees, customers, assignments }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const context = `
Analysiere die Callcenter-Daten und gib Empfehlungen zur Ressourcenverteilung.

Mitarbeiter:
${employees.map(e => `- ${e.name} (${e.status}, Tech-Skills: ${e.has_tech_skills ? 'Ja' : 'Nein'})`).join('\n')}

Kunden:
${customers.map(c => `- ${c.name} (Tech erforderlich: ${c.requires_tech_expertise ? 'Ja' : 'Nein'}, Min. Termine/Woche: ${c.min_appointments_per_week})`).join('\n')}

Aktuelle Wochendaten:
${weeklyReports.map(r => {
  const emp = employees.find(e => e.id === r.employee_id);
  const cust = customers.find(c => c.id === r.customer_id);
  return `- ${emp?.name} → ${cust?.name}: ${r.appointments_count} Termine`;
}).join('\n')}

Beachte:
- Teilzeit-Mitarbeiter sollten 2 Kunden betreuen
- Minijob-Mitarbeiter sollten 1 Kunde betreuen
- Technische Kunden brauchen Mitarbeiter mit Tech-Skills
- Mindestens 2 Termine pro Kunde pro Woche
- Springer können flexibel eingesetzt werden

Gib konkrete Empfehlungen in folgendem Format zurück.
      `;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: context,
        response_json_schema: {
          type: "object",
          properties: {
            critical_issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["customer", "employee"] },
                  name: { type: "string" },
                  issue: { type: "string" }
                }
              }
            },
            reassignments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  employee_name: { type: "string" },
                  from_customer: { type: "string" },
                  to_customer: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            priority_customers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  customer_name: { type: "string" },
                  reason: { type: "string" },
                  suggested_calls_increase: { type: "number" }
                }
              }
            }
          }
        }
      });

      setRecommendations(result);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
    setLoading(false);
  };

  return (
    <div className="clay-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--clay-lavender)' }}
          >
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">KI-Empfehlungen</h3>
            <p className="text-sm text-gray-600">Optimale Ressourcenverteilung</p>
          </div>
        </div>
        <Button 
          onClick={generateRecommendations}
          disabled={loading}
          className="clay-button bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0"
        >
          {loading ? 'Analysiere...' : 'Analysieren'}
        </Button>
      </div>

      {recommendations && (
        <div className="space-y-6">
          {recommendations.critical_issues?.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                🚨 Kritische Punkte
              </h4>
              <div className="space-y-2">
                {recommendations.critical_issues.map((issue, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-red-50 border border-red-100">
                    <div className="flex items-start gap-2">
                      {issue.type === 'customer' ? (
                        <Building2 className="w-4 h-4 text-red-600 mt-0.5" />
                      ) : (
                        <User className="w-4 h-4 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{issue.name}</p>
                        <p className="text-sm text-gray-600">{issue.issue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendations.reassignments?.length > 0 && (
            <div>
              <h4 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                🔄 Empfohlene Umverteilungen
              </h4>
              <div className="space-y-2">
                {recommendations.reassignments.map((rec, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{rec.employee_name}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{rec.from_customer}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-sm text-gray-600">{rec.to_customer}</span>
                    </div>
                    <p className="text-xs text-gray-600 pl-0">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendations.priority_customers?.length > 0 && (
            <div>
              <h4 className="font-semibold text-orange-600 mb-3 flex items-center gap-2">
                ⚡ Prioritäts-Kunden
              </h4>
              <div className="space-y-2">
                {recommendations.priority_customers.map((cust, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-orange-50 border border-orange-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{cust.customer_name}</p>
                        <p className="text-sm text-gray-600">{cust.reason}</p>
                      </div>
                      {cust.suggested_calls_increase && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Empfohlen</p>
                          <p className="text-lg font-bold text-orange-600">
                            +{cust.suggested_calls_increase} Anrufe
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!recommendations && !loading && (
        <div className="text-center py-8 text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Klicke auf "Analysieren" für KI-gestützte Empfehlungen</p>
        </div>
      )}
    </div>
  );
}