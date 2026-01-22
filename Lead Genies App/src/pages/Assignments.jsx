import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Building2, User, X, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Assignments() {
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.Employee.filter({ active: true }),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.filter({ active: true }),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => base44.entities.CustomerAssignment.filter({ active: true }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomerAssignment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomerAssignment.update(id, { active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    }
  });

  const getEmployeeMaxSlots = (employee) => {
    if (employee.status === 'Minijob') return 1;
    if (employee.status === 'Teilzeit') return 3;
    return 5;
  };

  const getEmployeeAssignments = (employeeId) => {
    return assignments.filter(a => a.employee_id === employeeId);
  };

  const getAssignedCustomerIds = () => {
    return assignments.map(a => a.customer_id);
  };

  const unassignedCustomers = customers.filter(
    c => !getAssignedCustomerIds().includes(c.id)
  );

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = (result) => {
    setIsDragging(false);
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId === 'unassigned' && destination.droppableId.startsWith('employee-')) {
      const employeeId = destination.droppableId.replace('employee-', '');
      const employee = employees.find(e => e.id === employeeId);
      const customerId = result.draggableId.replace('customer-', '');
      
      const currentAssignments = getEmployeeAssignments(employeeId);
      const maxSlots = getEmployeeMaxSlots(employee);

      if (currentAssignments.length >= maxSlots) {
        alert(`${employee.name} hat bereits die maximale Anzahl von ${maxSlots} Kunden erreicht`);
        return;
      }

      const customer = customers.find(c => c.id === customerId);
      if (customer.requires_tech_expertise && !employee.has_tech_skills) {
        const confirmed = confirm(
          `⚠️ ${customer.name} benötigt technische Expertise, aber ${employee.name} hat keine Tech-Skills. Trotzdem zuordnen?`
        );
        if (!confirmed) return;
      }

      createMutation.mutate({
        employee_id: employeeId,
        customer_id: customerId,
        start_date: new Date().toISOString().split('T')[0],
        active: true
      });
    }
  };

  const handleRemoveAssignment = (assignmentId) => {
    deleteMutation.mutate(assignmentId);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Zuordnungen</h1>
        <p className="text-gray-600 mt-1">Ziehe Kunden per Drag & Drop zu Mitarbeitern</p>
      </div>

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Unassigned Customers */}
          <div className="lg:col-span-1">
            <div className="clay-card p-6" style={{ transform: 'none' }}>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Nicht zugeordnete Kunden ({unassignedCustomers.length})
              </h3>
              <Droppable droppableId="unassigned">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[400px] p-4 rounded-2xl transition-all duration-200 ${
                      snapshot.isDraggingOver ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-50'
                    }`}
                  >
                    {unassignedCustomers.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Alle Kunden zugeordnet! 🎉</p>
                      </div>
                    ) : (
                      unassignedCustomers.map((customer, index) => (
                        <Draggable
                          key={customer.id}
                          draggableId={`customer-${customer.id}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                transform: snapshot.isDragging 
                                  ? provided.draggableProps.style?.transform 
                                  : 'none !important',
                              }}
                              className={`p-4 rounded-2xl cursor-grab active:cursor-grabbing transition-all duration-200 border-2 ${
                                snapshot.isDragging 
                                  ? 'bg-white shadow-2xl scale-105 border-indigo-400 rotate-3 z-50' 
                                  : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div 
                                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                  style={{ background: customer.requires_tech_expertise ? 'var(--clay-lavender)' : 'var(--clay-mint)' }}
                                >
                                  <Building2 className="w-5 h-5 text-gray-700" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                                  {customer.requires_tech_expertise && (
                                    <Badge variant="secondary" className="mt-1 text-xs">
                                      Tech erforderlich
                                    </Badge>
                                  )}
                                </div>
                                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${snapshot.isDragging ? 'animate-pulse' : ''}`} />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>

          {/* Employees with Slots */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {employees.map(employee => {
                const maxSlots = getEmployeeMaxSlots(employee);
                const employeeAssignments = getEmployeeAssignments(employee.id);
                const filledSlots = employeeAssignments.length;
                const emptySlots = maxSlots - filledSlots;
                const isFull = filledSlots >= maxSlots;

                return (
                  <div key={employee.id} className="clay-card p-6" style={{ transform: 'none' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ 
                            background: employee.status === 'Minijob' ? 'var(--clay-pink)' : 
                                       employee.status === 'Springer' ? 'var(--clay-peach)' : 'var(--clay-blue)'
                          }}
                        >
                          <User className="w-7 h-7 text-gray-700" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{employee.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="rounded-xl">
                              {employee.status}
                            </Badge>
                            {employee.has_tech_skills && (
                              <Badge className="rounded-xl bg-purple-100 text-purple-700">
                                Tech
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${isFull ? 'text-orange-600' : 'text-green-600'}`}>
                          {filledSlots}/{maxSlots}
                        </div>
                        <p className="text-xs text-gray-500">Kunden</p>
                      </div>
                    </div>

                    <Droppable droppableId={`employee-${employee.id}`} isDropDisabled={isFull}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`grid gap-3 p-4 rounded-2xl transition-all duration-300 ${
                            maxSlots === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
                          } ${
                            snapshot.isDraggingOver && !isFull
                              ? 'bg-green-100 border-4 border-green-400 scale-[1.02]' 
                              : isDragging && !isFull
                              ? 'bg-blue-50 border-2 border-dashed border-blue-300'
                              : isFull
                              ? 'bg-gray-100 border-2 border-gray-300'
                              : 'bg-gray-50 border-2 border-transparent'
                          }`}
                        >
                          {employeeAssignments.map((assignment) => {
                            const customer = customers.find(c => c.id === assignment.customer_id);
                            if (!customer) return null;

                            const techMismatch = customer.requires_tech_expertise && !employee.has_tech_skills;

                            return (
                              <div
                                key={assignment.id}
                                className={`p-4 rounded-2xl relative group transition-all duration-200 ${
                                  techMismatch ? 'bg-orange-50 border-2 border-orange-300' : 'bg-white border-2 border-gray-300'
                                }`}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveAssignment(assignment.id)}
                                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white shadow-lg"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                                <div className="flex items-start gap-2">
                                  <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'var(--clay-mint)' }}
                                  >
                                    <Building2 className="w-4 h-4 text-gray-700" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-gray-900">{customer.name}</h4>
                                    {techMismatch && (
                                      <p className="text-xs text-orange-700 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Tech-Warnung
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Empty Slots */}
                          {[...Array(emptySlots)].map((_, index) => (
                            <div
                              key={`empty-${index}`}
                              className={`p-4 rounded-2xl flex flex-col items-center justify-center min-h-[100px] transition-all duration-300 ${
                                isDragging && !isFull
                                  ? 'border-3 border-dashed border-indigo-400 bg-indigo-50 scale-105 animate-pulse'
                                  : 'border-2 border-dashed border-gray-300 bg-white'
                              }`}
                            >
                              {isDragging && !isFull ? (
                                <>
                                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                                    <Building2 className="w-5 h-5 text-indigo-600" />
                                  </div>
                                  <p className="text-sm font-medium text-indigo-600">Hier ablegen</p>
                                </>
                              ) : (
                                <p className="text-xs text-gray-400">Leerer Slot</p>
                              )}
                            </div>
                          ))}

                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DragDropContext>

      {unassignedCustomers.length === 0 && assignments.length > 0 && (
        <div className="clay-card p-8 text-center" style={{ transform: 'none' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Perfekt organisiert!</h3>
          <p className="text-gray-600">Alle Kunden sind Mitarbeitern zugeordnet</p>
        </div>
      )}
    </div>
  );
}