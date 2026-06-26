'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, Plus, FileText, X } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import { colors, radius, spacing } from '@/lib/tokens';

interface Farm {
  id: string;
  farm_name: string;
  farmer_name: string;
  village: string;
}

interface Shed {
  id: string;
  shed_name: string;
  capacity: number;
}

interface Supervisor {
  id: string;
  name: string;
  phone: string;
}

interface ShedReadinessRecord {
  id: string;
  farm_id: string;
  shed_id: string;
  readiness_date: string;
  expected_chick_date: string;
  litter_laid: boolean;
  brooder_tested: boolean;
  feeders_placed: boolean;
  drinkers_placed: boolean;
  disinfection_done: boolean;
  supervisor_id: string;
  remarks: string;
  status: 'pending' | 'approved' | 'chicks_placed';
  farm_name: string;
  shed_name: string;
  supervisor_name: string;
}

interface ShedReadyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ShedReadyForm({ onSuccess, onCancel }: ShedReadyFormProps) {
  const supabase = createClient() as any;
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [sheds, setSheds] = useState<Shed[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [existingRecords, setExistingRecords] = useState<ShedReadinessRecord[]>([]);
  
  const [formData, setFormData] = useState({
    farm_id: '',
    shed_id: '',
    readiness_date: format(new Date(), 'yyyy-MM-dd'),
    expected_chick_date: '',
    litter_laid: false,
    brooder_tested: false,
    feeders_placed: false,
    drinkers_placed: false,
    disinfection_done: false,
    supervisor_id: '',
    remarks: ''
  });

  useEffect(() => {
    fetchFarms();
    fetchSupervisors();
    fetchExistingRecords();
  }, []);

  useEffect(() => {
    if (formData.farm_id) {
      fetchSheds(formData.farm_id);
    }
  }, [formData.farm_id]);

  const fetchFarms = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('farms')
        .select('id, farm_name, farmer_name, village')
        .eq('integrator_id', user.id)
        .eq('status', 'active')
        .order('farm_name');

      if (error) throw error;
      setFarms(data || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
    }
  };

  const fetchSheds = async (farmId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('sheds')
        .select('id, shed_name, capacity')
        .eq('farm_id', farmId)
        .eq('is_active', true)
        .order('shed_name');

      if (error) throw error;
      setSheds(data || []);
    } catch (error) {
      console.error('Error fetching sheds:', error);
    }
  };

  const fetchSupervisors = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('employees')
        .select('id, name, phone')
        .eq('integrator_id', user.id)
        .eq('role', 'supervisor')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setSupervisors(data || []);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    }
  };

  const fetchExistingRecords = async () => {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shed_readiness')
        .select(`
          id,
          farm_id,
          shed_id,
          readiness_date,
          expected_chick_date,
          litter_laid,
          brooder_tested,
          feeders_placed,
          drinkers_placed,
          disinfection_done,
          supervisor_id,
          remarks,
          status,
          farms!inner(farm_name, farmer_name),
          sheds!inner(shed_name),
          employees!inner(name)
        `)
        .eq('integrator_id', user.id)
        .order('readiness_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const formattedData = (data || []).map((record: any) => ({
        id: record.id,
        farm_id: record.farm_id,
        shed_id: record.shed_id,
        readiness_date: record.readiness_date,
        expected_chick_date: record.expected_chick_date,
        litter_laid: record.litter_laid,
        brooder_tested: record.brooder_tested,
        feeders_placed: record.feeders_placed,
        drinkers_placed: record.drinkers_placed,
        disinfection_done: record.disinfection_done,
        supervisor_id: record.supervisor_id,
        remarks: record.remarks,
        status: record.status,
        farm_name: record.farms?.farm_name || '',
        shed_name: record.sheds?.shed_name || '',
        supervisor_name: record.employees?.name || ''
      }));
      
      setExistingRecords(formattedData);
    } catch (error) {
      console.error('Error fetching existing records:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Validate checklist
      const checklistComplete = formData.litter_laid && 
                              formData.brooder_tested && 
                              formData.feeders_placed && 
                              formData.drinkers_placed && 
                              formData.disinfection_done;

      if (!checklistComplete) {
        alert('Please complete all checklist items before submitting');
        setLoading(false);
        return;
      }

      // Create shed readiness record
      const { error } = await supabase
        .from('shed_readiness')
        .insert({
          integrator_id: user.id,
          farm_id: formData.farm_id,
          shed_id: formData.shed_id,
          readiness_date: formData.readiness_date,
          expected_chick_date: formData.expected_chick_date || null,
          litter_laid: formData.litter_laid,
          brooder_tested: formData.brooder_tested,
          feeders_placed: formData.feeders_placed,
          drinkers_placed: formData.drinkers_placed,
          disinfection_done: formData.disinfection_done,
          supervisor_id: formData.supervisor_id,
          remarks: formData.remarks,
          status: 'pending',
          created_by: user.id
        });

      if (error) throw error;

      // Reset form
      setFormData({
        farm_id: '',
        shed_id: '',
        readiness_date: format(new Date(), 'yyyy-MM-dd'),
        expected_chick_date: '',
        litter_laid: false,
        brooder_tested: false,
        feeders_placed: false,
        drinkers_placed: false,
        disinfection_done: false,
        supervisor_id: '',
        remarks: ''
      });

      // Refresh existing records
      await fetchExistingRecords();
      
      onSuccess?.();
    } catch (error) {
      console.error('Error creating shed readiness record:', error);
      alert('Failed to create shed readiness record');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/broiler/shed-ready/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve');
      }

      await fetchExistingRecords();
      onSuccess?.();
    } catch (error) {
      console.error('Error approving shed readiness:', error);
      alert(error instanceof Error ? error.message : 'Failed to approve shed readiness / शेड रेडिनेस अनुमोदित करने में विफल');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: { bg: colors.amberLight, text: colors.amber500, border: colors.amber500 },
      approved: { bg: colors.brandGreen50, text: colors.brandGreen700, border: colors.brandGreen500 },
      chicks_placed: { bg: '#DCFCE7', text: '#16A34A', border: '#16A34A' }
    };
    
    const color = statusColors[status as keyof typeof statusColors] || statusColors.pending;
    
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-all duration-150" style={{ backgroundColor: color.bg, color: color.text, borderColor: color.border, fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '0.05em' }}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const checklistItems = [
    { key: 'litter_laid', label: 'Litter Laid', description: 'Fresh litter material spread in shed' },
    { key: 'brooder_tested', label: 'Brooder Tested', description: 'Brooder heaters tested and working' },
    { key: 'feeders_placed', label: 'Feeders Placed', description: 'Feeders cleaned and positioned' },
    { key: 'drinkers_placed', label: 'Drinkers Placed', description: 'Drinkers cleaned and positioned' },
    { key: 'disinfection_done', label: 'Disinfection Done', description: 'Shed disinfected and sanitized' }
  ];

  return (
    <div className="space-y-12">
      {/* New Shed Readiness Form */}
      <Card className="shadow-sm" style={{ borderColor: colors.neutral200, borderRadius: radius.lg }}>
        <CardHeader className="border-b" style={{ borderColor: colors.neutral200, backgroundColor: colors.brandGreen50, padding: '1.5rem 2rem' }}>
          <CardTitle className="text-2xl" style={{ color: colors.neutral900, fontFamily: "'Plus Jakarta Sans', system-ui", fontWeight: 700, letterSpacing: '-0.015em' }}>
            New Shed Readiness Check
          </CardTitle>
        </CardHeader>
        <CardContent style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Farm and Shed Selection */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.neutral500, fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '0.18em' }}>Farm & Shed Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="farm" className="text-sm font-semibold" style={{ color: colors.neutral900, fontFamily: "'Plus Jakarta Sans', system-ui", fontWeight: 600 }}>Farm</Label>
                  <Select
                    value={formData.farm_id}
                    onValueChange={(value) => setFormData({ ...formData, farm_id: value, shed_id: '' })}
                    required
                  >
                    <SelectTrigger style={{ borderColor: colors.neutral200, color: colors.neutral900, height: '52px', fontSize: '1rem', fontFamily: "'Plus Jakarta Sans', system-ui" }}>
                      <SelectValue placeholder="Select farm" />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.map((farm) => (
                        <SelectItem key={farm.id} value={farm.id} style={{ color: colors.neutral900 }}>
                          {farm.farm_name} ({farm.farmer_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="shed" className="text-sm font-semibold" style={{ color: colors.neutral900, fontFamily: "'Plus Jakarta Sans', system-ui", fontWeight: 600 }}>Shed</Label>
                  <Select
                    value={formData.shed_id}
                    onValueChange={(value) => setFormData({ ...formData, shed_id: value })}
                    required
                    disabled={!formData.farm_id}
                  >
                    <SelectTrigger style={{ borderColor: colors.neutral200, color: colors.neutral900, height: '52px', fontSize: '1rem', fontFamily: "'Plus Jakarta Sans', system-ui" }}>
                      <SelectValue placeholder={formData.farm_id ? "Select shed" : "Select farm first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {sheds.map((shed) => (
                        <SelectItem key={shed.id} value={shed.id} style={{ color: colors.neutral900 }}>
                          {shed.shed_name} (Capacity: {shed.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.neutral500, fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '0.18em' }}>Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="readinessDate" className="text-sm font-semibold" style={{ color: colors.neutral900, fontFamily: "'Plus Jakarta Sans', system-ui", fontWeight: 600 }}>Readiness Date</Label>
                  <Input
                    id="readinessDate"
                    type="date"
                    value={formData.readiness_date}
                    onChange={(e) => setFormData({ ...formData, readiness_date: e.target.value })}
                    required
                    style={{ borderColor: colors.neutral200, color: colors.neutral900, height: '52px', fontSize: '1rem', fontFamily: "'Plus Jakarta Sans', system-ui" }}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="expectedChickDate" className="text-sm font-semibold" style={{ color: colors.neutral900, fontFamily: "'Plus Jakarta Sans', system-ui", fontWeight: 600 }}>Expected Chick Date</Label>
                  <Input
                    id="expectedChickDate"
                    type="date"
                    value={formData.expected_chick_date}
                    onChange={(e) => setFormData({ ...formData, expected_chick_date: e.target.value })}
                    min={formData.readiness_date}
                    style={{ borderColor: colors.neutral200, color: colors.neutral900, height: '52px', fontSize: '1rem', fontFamily: "'Plus Jakarta Sans', system-ui" }}
                  />
                </div>
              </div>
            </div>

            {/* Readiness Checklist */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.neutral500, fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '0.18em' }}>Readiness Checklist</h3>
              <div className="rounded-xl p-6 border" style={{ backgroundColor: colors.brandGreen50, borderColor: colors.neutral200 }}>
                <div className="space-y-5">
                  {checklistItems.map((item) => (
                    <div key={item.key} className="flex items-start gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, [item.key]: !formData[item.key as keyof typeof formData] as boolean })}
                        className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                          formData[item.key as keyof typeof formData] 
                            ? 'bg-[#3DAE72] border-[#3DAE72] shadow-sm' 
                            : 'border-[#3DAE72]/30 hover:border-[#3DAE72] hover:bg-[#EDF7F1]'
                        }`}
                      >
                        {formData[item.key as keyof typeof formData] && (
                          <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                        )}
                      </button>
                      <div className="flex-1 pt-1">
                        <Label className="text-base font-semibold cursor-pointer block mb-1" style={{ color: colors.neutral900, fontFamily: "'Plus Jakarta Sans', system-ui", fontWeight: 600 }} htmlFor={`check-${item.key}`}>
                          {item.label}
                        </Label>
                        <p className="text-sm leading-relaxed" style={{ color: colors.neutral500, fontFamily: "'Plus Jakarta Sans', system-ui" }}>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Supervisor */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.neutral500, fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '0.18em' }}>Supervisor Assignment</h3>
              <div className="space-y-3">
                <Label htmlFor="supervisor" className="text-sm font-semibold" style={{ color: colors.neutral900, fontFamily: "'Plus Jakarta Sans', system-ui", fontWeight: 600 }}>Supervisor</Label>
                <Select
                  value={formData.supervisor_id}
                  onValueChange={(value) => setFormData({ ...formData, supervisor_id: value })}
                  required
                >
                  <SelectTrigger style={{ borderColor: colors.neutral200, color: colors.neutral900, height: '52px', fontSize: '1rem', fontFamily: "'Plus Jakarta Sans', system-ui" }}>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((supervisor) => (
                      <SelectItem key={supervisor.id} value={supervisor.id} style={{ color: colors.neutral900 }}>
                        {supervisor.name} ({supervisor.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-3">
              <Label htmlFor="remarks" className="text-sm font-semibold" style={{ color: colors.neutral900, fontFamily: "'Plus Jakarta Sans', system-ui", fontWeight: 600 }}>Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Any additional notes or observations..."
                rows={4}
                style={{ borderColor: colors.neutral200, color: colors.neutral900, fontSize: '1rem', fontFamily: "'Plus Jakarta Sans', system-ui", lineHeight: 1.6, resize: 'vertical' }}
                className="placeholder:text-[#9CA3AF]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-8 border-t" style={{ borderColor: colors.neutral200 }}>
              <Button
                type="submit"
                disabled={loading || !formData.farm_id || !formData.shed_id}
                style={{ backgroundColor: colors.brandGreen700, color: colors.white, height: '52px', fontSize: '1rem', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', system-ui", padding: '0 2rem' }}
                className="hover:bg-[#1F7040] border-0 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-5 w-5 mr-2" strokeWidth={2} />
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  style={{ color: colors.neutral500, height: '52px', fontSize: '1rem', fontWeight: 500, fontFamily: "'Plus Jakarta Sans', system-ui", padding: '0 1.5rem' }}
                  className="hover:text-[#1C2B22] hover:bg-[#EDF7F1]/50 transition-all duration-200"
                >
                  <X className="h-5 w-5 mr-2" strokeWidth={2} />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Records */}
      <Card className="shadow-sm" style={{ borderColor: colors.neutral200, borderRadius: radius.lg }}>
        <CardHeader className="border-b" style={{ borderColor: colors.neutral200, backgroundColor: colors.brandGreen50, padding: '1.5rem 2rem' }}>
          <CardTitle className="text-2xl" style={{ color: colors.neutral900, fontFamily: "'Plus Jakarta Sans', system-ui", fontWeight: 700, letterSpacing: '-0.015em' }}>
            Recent Shed Readiness Records
          </CardTitle>
        </CardHeader>
        <CardContent style={{ padding: '2.5rem' }}>
          {existingRecords.length === 0 ? (
            <div className="text-center py-16" style={{ color: colors.neutral500 }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: colors.brandGreen50 }}>
                <FileText className="h-8 w-8" style={{ color: colors.brandGreen500, opacity: 0.6 }} strokeWidth={1.5} />
              </div>
              <p className="text-base font-medium mb-1" style={{ color: colors.neutral700, fontFamily: "'Plus Jakarta Sans', system-ui" }}>No shed readiness records yet</p>
              <p className="text-sm" style={{ color: colors.neutral500, fontFamily: "'Plus Jakarta Sans', system-ui" }}>Submit a new readiness check above</p>
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden" style={{ borderColor: colors.neutral200 }}>
              <Table>
                <TableHeader style={{ backgroundColor: colors.brandGreen50 }}>
                  <TableRow>
                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4 px-5" style={{ color: colors.neutral500, fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '0.18em' }}>Date</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4 px-5" style={{ color: colors.neutral500, fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '0.18em' }}>Farm</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4 px-5" style={{ color: colors.neutral500, fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '0.18em' }}>Shed</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4 px-5" style={{ color: colors.neutral500, fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '0.18em' }}>Supervisor</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4 px-5" style={{ color: colors.neutral500, fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '0.18em' }}>Checklist</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4 px-5" style={{ color: colors.neutral500, fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '0.18em' }}>Status</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest py-4 px-5" style={{ color: colors.neutral500, fontFamily: "'Plus Jakarta Sans', system-ui", letterSpacing: '0.18em' }}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {existingRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-[#EDF7F1]/30 transition-colors duration-150">
                      <TableCell className="py-4 px-5 text-sm font-medium" style={{ color: colors.neutral900, fontFamily: "'Plus Jakarta Sans', system-ui" }}>
                        {format(new Date(record.readiness_date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="py-4 px-5 text-sm font-semibold" style={{ color: colors.neutral900, fontFamily: "'Plus Jakarta Sans', system-ui", fontWeight: 600 }}>
                        {record.farm_name}
                      </TableCell>
                      <TableCell className="py-4 px-5 text-sm" style={{ color: colors.neutral900, fontFamily: "'Plus Jakarta Sans', system-ui" }}>
                        {record.shed_name}
                      </TableCell>
                      <TableCell className="py-4 px-5 text-sm" style={{ color: colors.neutral900, fontFamily: "'Plus Jakarta Sans', system-ui" }}>
                        {record.supervisor_name}
                      </TableCell>
                      <TableCell className="py-4 px-5">
                        <div className="flex gap-1.5">
                          {record.litter_laid && <Check className="w-4 h-4" style={{ color: colors.brandGreen500 }} strokeWidth={2.5} />}
                          {record.brooder_tested && <Check className="w-4 h-4" style={{ color: colors.brandGreen500 }} strokeWidth={2.5} />}
                          {record.feeders_placed && <Check className="w-4 h-4" style={{ color: colors.brandGreen500 }} strokeWidth={2.5} />}
                          {record.drinkers_placed && <Check className="w-4 h-4" style={{ color: colors.brandGreen500 }} strokeWidth={2.5} />}
                          {record.disinfection_done && <Check className="w-4 h-4" style={{ color: colors.brandGreen500 }} strokeWidth={2.5} />}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-5">
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell className="py-4 px-5">
                        {record.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(record.id)}
                            disabled={loading}
                            className="bg-[#3DAE72] hover:bg-[#1A5C34] text-white border-0 transition-colors duration-200"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
