
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Building2, Pencil, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';

const CustomerDialog = ({ customer, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(customer || {
    name: '',
    requires_tech_expertise: false,
    min_appointments_per_week: 2,
    active: true,
    notes: ''
  });

  const mutation = useMutation({
    mutationFn: (data) => customer 
      ? base44.entities.Customer.update(customer.id, data)
      : base44.entities.Customer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
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
        <Label htmlFor="name">Kundenname</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="clay-input"
        />
      </div>

      <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50">
        <Label htmlFor="tech" className="cursor-pointer">Technische Expertise erforderlich</Label>
        <Switch
          id="tech"
          checked={formData.requires_tech_expertise}
          onCheckedChange={(checked) => setFormData({ ...formData, requires_tech_expertise: checked })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="min">Minimum Termine pro Woche</Label>
        <Input
          id="min"
          type="number"
          min="1"
          value={formData.min_appointments_per_week}
          onChange={(e) => setFormData({ ...formData, min_appointments_per_week: parseInt(e.target.value) })}
          className="clay-input"
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
        className="w-full clay-button bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Speichern...' : customer ? 'Aktualisieren' : 'Erstellen'}
      </Button>
    </form>
  );
};

export default function Customers() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const navigate = useNavigate();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date'),
  });

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kunden</h1>
          <p className="text-gray-600 mt-1">Verwalte deinen Kundenstamm</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setEditingCustomer(null)}
              className="clay-button bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              Neuer Kunde
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md border-0 shadow-2xl bg-white rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingCustomer ? 'Kunde bearbeiten' : 'Neuer Kunde'}
              </DialogTitle>
            </DialogHeader>
            <CustomerDialog customer={editingCustomer} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="clay-card p-6 h-48 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map(customer => (
            <div key={customer.id} className="clay-card p-6 relative group">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: customer.requires_tech_expertise ? 'var(--clay-lavender)' : 'var(--clay-mint)' }}
                >
                  <Building2 className="w-6 h-6 text-gray-700" />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/Wochenreporting')}
                    className="clay-button"
                    title="Reports"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(customer)}
                    className="clay-button"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 mb-4">{customer.name}</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tech erforderlich:</span>
                  <span className="font-medium">{customer.requires_tech_expertise ? '✓ Ja' : '✗ Nein'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Min. Termine/Woche:</span>
                  <span className="font-medium">{customer.min_appointments_per_week}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={customer.active ? "default" : "secondary"} className="rounded-xl">
                    {customer.active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
              </div>

              {customer.notes && (
                <p className="text-xs text-gray-500 mt-3 p-3 rounded-xl bg-gray-50">{customer.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
