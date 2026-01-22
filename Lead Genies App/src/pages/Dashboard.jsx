import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users, Building2, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { startOfWeek, format } from 'date-fns';
import { de } from 'date-fns/locale';

import StatsCard from '../components/dashboard/StatsCard';
import AIRecommendations from '../components/dashboard/AIRecommendations';

export default function Dashboard() {
  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.filter({ active: true }),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.filter({ active: true }),
  });

  const { data: weeklyReports = [] } = useQuery({
    queryKey: ['weeklyReports', currentWeekStart],
    queryFn: () => base44.entities.WeeklyReport.filter({ week_start: currentWeekStart }),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => base44.entities.CustomerAssignment.filter({ active: true }),
  });

  const totalAppointments = weeklyReports.reduce((sum, r) => sum + (r.appointments_count || 0), 0);
  
  const underperformingCustomers = customers.filter(customer => {
    const customerReports = weeklyReports.filter(r => r.customer_id === customer.id);
    const totalAppointments = customerReports.reduce((sum, r) => sum + (r.appointments_count || 0), 0);
    return totalAppointments < (customer.min_appointments_per_week || 2);
  });

  const topEmployee = employees.length > 0 ? employees.reduce((top, emp) => {
    const empReports = weeklyReports.filter(r => r.employee_id === emp.id);
    const empTotal = empReports.reduce((sum, r) => sum + (r.appointments_count || 0), 0);
    const topReports = weeklyReports.filter(r => r.employee_id === top.id);
    const topTotal = topReports.reduce((sum, r) => sum + (r.appointments_count || 0), 0);
    return empTotal > topTotal ? emp : top;
  }, employees[0]) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Woche vom {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'dd. MMMM yyyy', { locale: de })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Aktive Mitarbeiter"
          value={employees.length}
          subtitle={`${employees.filter(e => e.status === 'Teilzeit').length} Teilzeit, ${employees.filter(e => e.status === 'Minijob').length} Minijob`}
          color="mint"
          icon={Users}
        />
        <StatsCard
          title="Aktive Kunden"
          value={customers.length}
          subtitle={`${customers.filter(c => c.requires_tech_expertise).length} mit Tech-Anforderung`}
          color="blue"
          icon={Building2}
        />
        <StatsCard
          title="Termine diese Woche"
          value={totalAppointments}
          subtitle={`Ø ${(totalAppointments / (customers.length || 1)).toFixed(1)} pro Kunde`}
          color="lavender"
          icon={Calendar}
        />
        <StatsCard
          title="Top Performer"
          value={topEmployee ? topEmployee.name.split(' ')[0] : '-'}
          subtitle={topEmployee ? `${topEmployee.status}` : 'Keine Daten'}
          color="peach"
          icon={TrendingUp}
        />
      </div>

      {underperformingCustomers.length > 0 && (
        <div className="clay-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--clay-peach)' }}
            >
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Kunden unter Minimum</h3>
              <p className="text-sm text-gray-600">Diese Kunden haben weniger als das Minimum an Terminen</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {underperformingCustomers.map(customer => {
              const customerReports = weeklyReports.filter(r => r.customer_id === customer.id);
              const totalAppointments = customerReports.reduce((sum, r) => sum + (r.appointments_count || 0), 0);
              return (
                <div key={customer.id} className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                  <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl font-bold text-orange-600">{totalAppointments}</span>
                    <span className="text-sm text-gray-600">von {customer.min_appointments_per_week} Terminen</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIRecommendations 
            weeklyReports={weeklyReports}
            employees={employees}
            customers={customers}
            assignments={assignments}
          />
        </div>

        <div className="space-y-6">
          <div className="clay-card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Top Mitarbeiter</h3>
            <div className="space-y-3">
              {employees
                .map(emp => ({
                  ...emp,
                  total: weeklyReports
                    .filter(r => r.employee_id === emp.id)
                    .reduce((sum, r) => sum + (r.appointments_count || 0), 0)
                }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 5)
                .map((emp, idx) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                        style={{ 
                          background: idx === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 
                                     idx === 1 ? 'linear-gradient(135deg, #C0C0C0, #A8A8A8)' :
                                     idx === 2 ? 'linear-gradient(135deg, #CD7F32, #B87333)' :
                                     'linear-gradient(135deg, var(--clay-mint), var(--clay-blue))'
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{emp.total}</p>
                      <p className="text-xs text-gray-500">Termine</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="clay-card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Zuordnungen</h3>
            <div className="space-y-2">
              {assignments.slice(0, 8).map(assignment => {
                const employee = employees.find(e => e.id === assignment.employee_id);
                const customer = customers.find(c => c.id === assignment.customer_id);
                return (
                  <div key={assignment.id} className="flex items-center justify-between p-2 rounded-xl bg-indigo-50">
                    <span className="text-sm font-medium text-gray-900">{employee?.name || 'Unbekannt'}</span>
                    <span className="text-xs text-gray-600">→ {customer?.name || 'Unbekannt'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}