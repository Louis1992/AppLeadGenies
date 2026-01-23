import React, { useState } from 'react';
import { base44 } from '@/api/entities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Save, Plus, Trash2, Minus, PlusIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { startOfWeek, format, addWeeks, subWeeks } from 'date-fns';
import { de } from 'date-fns/locale';
import { Textarea } from '@/components/ui/textarea';

export default function WeeklyEntry() {
  const queryClient = useQueryClient();
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const weekStart = format(currentWeek, 'yyyy-MM-dd');

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.filter({ active: true }),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.filter({ active: true }),
  });

  const { data: existingReports = [] } = useQuery({
    queryKey: ['weeklyReports', weekStart],
    queryFn: () => base44.entities.WeeklyReport.filter({ week_start: weekStart }),
  });

  const [entries, setEntries] = useState([{
    employee_id: '',
    customer_id: '',
    appointments_count: 0,
    calls_count: 50,
    notes: ''
  }]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WeeklyReport.bulkCreate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyReports'] });
      setEntries([{
        employee_id: '',
        customer_id: '',
        appointments_count: 0,
        calls_count: 50,
        notes: ''
      }]);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WeeklyReport.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyReports'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WeeklyReport.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyReports'] });
    }
  });

  const handleAddEntry = () => {
    setEntries([...entries, {
      employee_id: '',
      customer_id: '',
      appointments_count: 0,
      calls_count: 50,
      notes: ''
    }]);
  };

  const handleRemoveEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validEntries = entries.filter(e => e.employee_id && e.customer_id);
    if (validEntries.length === 0) return;

    const reportsToCreate = validEntries.map(entry => ({
      ...entry,
      week_start: weekStart,
      appointments_count: parseInt(entry.appointments_count) || 0,
      calls_count: parseInt(entry.calls_count) || 0
    }));

    createMutation.mutate(reportsToCreate);
  };

  const handleQuickUpdate = (reportId, field, delta) => {
    const report = existingReports.find(r => r.id === reportId);
    if (!report) return;

    const newValue = Math.max(0, (report[field] || 0) + delta);
    updateMutation.mutate({
      id: reportId,
      data: { ...report, [field]: newValue }
    });
  };

  const handleDeleteReport = (reportId) => {
    if (confirm('Möchtest du diesen Eintrag wirklich löschen?')) {
      deleteMutation.mutate(reportId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wocheneingabe</h1>
        <p className="text-gray-600 mt-1">Erfasse die Termine für die Woche</p>
      </div>

      <div className="clay-card p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className="clay-button"
          >
            ← Vorherige
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-lg">
              {format(currentWeek, 'dd. MMMM yyyy', { locale: de })}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className="clay-button"
          >
            Nächste →
          </Button>
        </div>

        {existingReports.length > 0 && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              📊 Bereits erfasst ({existingReports.length})
            </h3>
            <div className="space-y-3">
              {existingReports.map(report => {
                const emp = employees.find(e => e.id === report.employee_id);
                const cust = customers.find(c => c.id === report.customer_id);
                return (
                  <div key={report.id} className="bg-white p-4 rounded-2xl border-2 border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {emp?.name || 'Unbekannt'} → {cust?.name || 'Unbekannt'}
                        </p>
                        {report.notes && (
                          <p className="text-xs text-gray-500 mt-1">{report.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReport(report.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Termine</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuickUpdate(report.id, 'appointments_count', -1)}
                            className="h-9 w-9 rounded-xl clay-button"
                            disabled={updateMutation.isPending}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <div className="flex-1 text-center">
                            <span className="text-2xl font-bold text-indigo-600">
                              {report.appointments_count || 0}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuickUpdate(report.id, 'appointments_count', 1)}
                            className="h-9 w-9 rounded-xl clay-button"
                            disabled={updateMutation.isPending}
                          >
                            <PlusIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Anrufe</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuickUpdate(report.id, 'calls_count', -10)}
                            className="h-9 w-9 rounded-xl clay-button"
                            disabled={updateMutation.isPending}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <div className="flex-1 text-center">
                            <span className="text-2xl font-bold text-green-600">
                              {report.calls_count || 0}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuickUpdate(report.id, 'calls_count', 10)}
                            className="h-9 w-9 rounded-xl clay-button"
                            disabled={updateMutation.isPending}
                          >
                            <PlusIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg mb-4">Neue Einträge hinzufügen</h3>
          
          {entries.map((entry, index) => (
            <div key={index} className="clay-card p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Eintrag #{index + 1}</h3>
                {entries.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveEntry(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mitarbeiter</Label>
                  <Select
                    value={entry.employee_id}
                    onValueChange={(value) => handleEntryChange(index, 'employee_id', value)}
                  >
                    <SelectTrigger className="clay-input">
                      <SelectValue placeholder="Mitarbeiter wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} ({emp.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kunde</Label>
                  <Select
                    value={entry.customer_id}
                    onValueChange={(value) => handleEntryChange(index, 'customer_id', value)}
                  >
                    <SelectTrigger className="clay-input">
                      <SelectValue placeholder="Kunde wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(cust => (
                        <SelectItem key={cust.id} value={cust.id}>
                          {cust.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Anzahl Termine</Label>
                  <Input
                    type="number"
                    min="0"
                    value={entry.appointments_count}
                    onChange={(e) => handleEntryChange(index, 'appointments_count', e.target.value)}
                    className="clay-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Anzahl Anrufe</Label>
                  <Input
                    type="number"
                    min="0"
                    value={entry.calls_count}
                    onChange={(e) => handleEntryChange(index, 'calls_count', e.target.value)}
                    className="clay-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notizen (optional)</Label>
                <Textarea
                  value={entry.notes}
                  onChange={(e) => handleEntryChange(index, 'notes', e.target.value)}
                  className="clay-input"
                  rows={2}
                />
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddEntry}
              className="flex-1 clay-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Weiterer Eintrag
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 clay-button bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
            >
              <Save className="w-4 h-4 mr-2" />
              {createMutation.isPending ? 'Speichere...' : 'Alle Einträge speichern'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}