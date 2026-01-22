import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, User, Pencil, Briefcase, GraduationCap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';

const EmployeeDialog = ({ employee, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(employee || {
    name: '',
    status: 'Teilzeit',
    has_tech_skills: false,
    active: true,
    notes: ''
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const maxCustomers = data.status === 'Minijob' ? 1 : 
                          data.status === 'Teilzeit' ? 3 : 5;
      const dataWithMax = { ...data, max_customers: maxCustomers };
      
      return employee 
        ? base44.entities.Employee.update(employee.id, dataWithMax)
        : base44.entities.Employee.create(dataWithMax);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="clay-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger className="clay-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Minijob">Minijob (1 Kunde)</SelectItem>
            <SelectItem value="Teilzeit">Teilzeit (3 Kunden)</SelectItem>
            <SelectItem value="Springer">Springer (5 Kunden)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50">
        <Label htmlFor="tech" className="cursor-pointer">Technische Fähigkeiten</Label>
        <Switch
          id="tech"
          checked={formData.has_tech_skills}
          onCheckedChange={(checked) => setFormData({ ...formData, has_tech_skills: checked })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notizen</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="clay-input"
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50">
        <Label htmlFor="active" className="cursor-pointer">Aktiv</Label>
        <Switch
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full clay-button bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Speichern...' : employee ? 'Aktualisieren' : 'Erstellen'}
      </Button>
    </form>
  );
};

export default function Employees() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const navigate = useNavigate();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.list('-created_date'),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => base44.entities.CustomerAssignment.filter({ active: true }),
  });

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingEmployee(null);
  };

  const getEmployeeCustomerCount = (employeeId) => {
    return assignments.filter(a => a.employee_id === employeeId).length;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mitarbeiter</h1>
          <p className="text-gray-600 mt-1">Verwalte dein Team</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingEmployee(null)}
              className="clay-button bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              Neuer Mitarbeiter
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md border-0 shadow-2xl bg-white rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingEmployee ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}
              </DialogTitle>
            </DialogHeader>
            <EmployeeDialog employee={editingEmployee} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="clay-card p-6 h-56 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map(employee => {
            const customerCount = getEmployeeCustomerCount(employee.id);
            const statusColor = employee.status === 'Minijob' ? 'var(--clay-pink)' : 
                              employee.status === 'Springer' ? 'var(--clay-peach)' : 'var(--clay-blue)';
            
            return (
              <div key={employee.id} className="clay-card p-6 relative group">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: statusColor }}
                  >
                    <User className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate('/Courses')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity clay-button"
                      title="Schulungen"
                    >
                      <GraduationCap className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(employee)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity clay-button"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-gray-900 mb-2">{employee.name}</h3>
                
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="rounded-xl">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {employee.status}
                  </Badge>
                  {employee.has_tech_skills && (
                    <Badge className="rounded-xl bg-purple-100 text-purple-700">
                      Tech
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aktuelle Kunden:</span>
                    <span className="font-bold text-indigo-600">
                      {customerCount} / {employee.max_customers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={employee.active ? "default" : "secondary"} className="rounded-xl">
                      {employee.active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                </div>

                {employee.notes && (
                  <p className="text-xs text-gray-500 mt-3 p-3 rounded-xl bg-gray-50">{employee.notes}</p>
                )}

                {customerCount >= employee.max_customers && employee.status !== 'Springer' && (
                  <div className="mt-3 p-2 rounded-xl bg-orange-50 border border-orange-200">
                    <p className="text-xs text-orange-700 font-medium">⚠️ Maximale Kundenzahl erreicht</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}