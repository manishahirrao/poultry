// PoultryPulse AI — Database Types
// File: packages/types/src/database.ts
// Version: v1.0 | May 2026

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          phone: string;
          plan: 'PULSE_FARM' | 'PULSE_PRO' | 'PULSE_INTEL' | null;
          plan_locked_at: string | null;
          segment: 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';
          district: string | null;
          flock_range: string | null;
          batches_per_year: number | null;
          farm_type: 'independent' | 'integrator' | null;
          trial_ends_at: string | null;
          trial_duration_days: 14 | 30;
          whatsapp_verified: boolean;
          referral_code: string | null;
          created_at: string;
          updated_at: string;
          poultry_type?: 'broiler' | 'layer' | null;
          mandi?: string | null;
          role?: string | null;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      leads: {
        Row: {
          id: string;
          phone: string;
          source: string;
          district: string | null;
          plan: string | null;
          consent_given: boolean;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          ip_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['leads']['Insert']>;
      };
      predictions: {
        Row: {
          id: string;
          mandi: string;
          predicted_at: string;
          prediction_date: string;
          p10: number;
          p50: number;
          p90: number;
          sell_signal: 'SELL_NOW' | 'HOLD' | 'CAUTION';
          confidence: number;
          model_version: string;
          is_demo: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['predictions']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['predictions']['Insert']>;
      };
      alerts: {
        Row: {
          id: string;
          type: string;
          severity: 'HIGH' | 'MEDIUM' | 'LOW';
          districts: string[];
          district?: string | null;
          title_hi: string;
          title_en: string;
          body_hi: string;
          body_en: string;
          source_url: string | null;
          expires_at: string | null;
          created_at: string;
          is_active?: boolean;
          issued_at?: string;
        };
        Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>;
      };
      referral_codes: {
        Row: {
          id: string;
          customer_id: string;
          code: string;
          uses_count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['referral_codes']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['referral_codes']['Insert']>;
      };
      referral_credits: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          amount: number;
          status: 'PENDING' | 'CREDITED' | 'EXPIRED';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['referral_credits']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['referral_credits']['Insert']>;
      };
      customer_onboarding_state: {
        Row: {
          customer_id: string;
          current_step: string;
          completed_steps: string[];
          district: string | null;
          flock_range: string | null;
          batches_per_year: number | null;
          farm_type: string | null;
          plan_confirmed: string | null;
          plan_locked_at: string | null;
          whatsapp_verified: boolean;
          app_downloaded: boolean;
          referral_source: string | null;
          referral_code: string | null;
          trial_duration_days: number;
          started_at: string;
          completed_at: string | null;
        };
        Insert: Database['public']['Tables']['customer_onboarding_state']['Row'];
        Update: Partial<Database['public']['Tables']['customer_onboarding_state']['Insert']>;
      };
      farms: {
        Row: {
          id: string;
          integrator_id: string;
          name: string;
          farm_type: 'broiler' | 'layer' | 'breeder';
          district: string;
          state: string;
          block: string | null;
          village: string | null;
          lat: number | null;
          lng: number | null;
          manager_name: string | null;
          manager_phone: string | null;
          total_capacity: number | null;
          status: 'active' | 'between_batches' | 'paused' | 'archived' | 'onboarding';
          created_at: string;
          updated_at: string;
          whatsapp_number?: string | null;
          whatsapp_reminders_enabled?: boolean;
          whatsapp_reminders_paused?: boolean;
          whatsapp_reminder_hour?: number;
          whatsapp_language?: string;
          whatsapp_connected_at?: string | null;
        };
        Insert: Omit<Database['public']['Tables']['farms']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          whatsapp_number?: string | null;
          whatsapp_reminders_enabled?: boolean;
          whatsapp_reminders_paused?: boolean;
          whatsapp_reminder_hour?: number;
          whatsapp_language?: string;
          whatsapp_connected_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['farms']['Row']>;
      };
      sheds: {
        Row: {
          id: string;
          farm_id: string;
          name: string;
          capacity: number;
          shed_type: 'open_sided' | 'env_controlled' | 'semi_controlled' | null;
          floor_type: 'litter' | 'slat' | 'cage' | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sheds']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sheds']['Insert']>;
      };
      batches: {
        Row: {
          id: string;
          farm_id: string;
          customer_id?: string;
          integrator_id?: string | null;
          batch_number: number;
          batch_id?: string;
          batch_type?: 'broiler' | 'layer' | 'breeder' | 'hatchery';
          breed: string | null;
          doc_supplier: string | null;
          doc_supplier_rating?: number | null;
          placement_date: string;
          doc_placement_date?: string;
          birds_placed: number;
          doc_count?: number;
          price_per_doc: number | null;
          target_harvest_age: number | null;
          target_harvest_age_days?: number | null;
          target_market_weight: number | null;
          target_harvest_weight_kg?: number | null;
          feed_supplier: string | null;
          status: string;
          closed_at: string | null;
          birds_harvested: number | null;
          birds_sold?: number | null;
          sale_price_per_kg?: number | null;
          buyer_name?: string | null;
          actual_harvest_date?: string | null;
          actual_harvest_weight_kg?: number | null;
          notes: string | null;
          created_at: string;
          updated_at?: string;
          current_bird_count?: number | null;
          current_avg_weight_kg?: number | null;
          current_fcr?: number | null;
          cumulative_mortality_pct?: number | null;
          synced?: boolean;
        };
        Insert: Omit<Database['public']['Tables']['batches']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['batches']['Row']>;
      };
      daily_logs: {
        Row: {
          id: string;
          batch_id: string;
          farm_id: string;
          log_date: string;
          batch_day: number;
          deaths_today: number;
          death_cause: 'unknown' | 'heat' | 'disease' | 'injury' | 'cull' | 'other' | null;
          cumulative_deaths: number | null;
          cumulative_mortality_pct: number | null;
          feed_consumed_kg: number;
          feed_type: 'starter' | 'grower' | 'finisher' | null;
          feed_per_bird_g: number | null;
          cumulative_feed_kg: number | null;
          sample_birds: number | null;
          sample_weight_kg: number | null;
          avg_weight_g: number | null;
          fcr: number | null;
          water_litres: number | null;
          temp_min_c: number | null;
          temp_max_c: number | null;
          humidity_pct: number | null;
          health_issue: boolean;
          health_symptoms: string[] | null;
          health_severity: 'mild' | 'moderate' | 'severe' | null;
          health_notes: string | null;
          notes: string | null;
          submitted_by: string | null;
          submitted_at?: string;
          is_amended?: boolean;
          amended_at?: string | null;
          amended_by?: string | null;
          created_at: string;
          temp_morning?: number | null;
          temp_afternoon?: number | null;
          temp_evening?: number | null;
          humidity_morning?: number | null;
          humidity_afternoon?: number | null;
          ammonia_ppm?: number | null;
          ammonia_method?: 'measured' | 'estimated_litter' | null;
          litter_condition?: 'dry' | 'damp' | 'wet' | 'very_wet' | null;
          light_hours?: number | null;
          light_schedule?: 'continuous' | 'intermittent' | 'other' | null;
          fan_speed?: 'tunnel' | 'low' | 'medium' | 'high' | null;
          curtain_position?: 'fully_open' | 'half_open' | 'closed' | null;
          inlet_pct?: number | null;
          ventilation_notes?: string | null;
          water_temp_c?: number | null;
        };
        Insert: Omit<Database['public']['Tables']['daily_logs']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['daily_logs']['Row']>;
      };
      vaccinations: {
        Row: {
          id: string;
          batch_id: string;
          vaccine_name: string;
          vaccine_type: string | null;
          scheduled_day: number;
          due_date: string;
          administered_date: string | null;
          admin_route: string | null;
          status: 'pending' | 'done' | 'overdue' | 'skipped';
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vaccinations']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['vaccinations']['Row']>;
      };
      feed_purchases: {
        Row: {
          id: string;
          farm_id: string;
          batch_id: string | null;
          purchase_date: string;
          supplier: string | null;
          feed_type: 'starter' | 'grower' | 'finisher' | 'other' | null;
          qty_kg: number;
          rate_per_kg: number | null;
          total_cost: number | null;
          invoice_number: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['feed_purchases']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['feed_purchases']['Insert']>;
      };
      health_checklist_state: {
        Row: {
          id: string;
          farm_id: string;
          alert_id: string;
          items: Record<string, boolean>;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['health_checklist_state']['Row'], 'id' | 'updated_at'> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['health_checklist_state']['Insert']>;
      };
      batch_report_jobs: {
        Row: {
          id: string;
          batch_id: string;
          status: 'pending' | 'processing' | 'complete' | 'failed';
          pdf_path: string | null;
          error: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['batch_report_jobs']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['batch_report_jobs']['Insert']>;
      };
      inventory_items: {
        Row: {
          id: string;
          customer_id: string;
          name: string;
          category: 'feed' | 'medicine' | 'vaccine' | 'consumable';
          sku: string | null;
          description: string | null;
          unit: string;
          min_stock_alert_level: number;
          current_stock: number;
          avg_cost_per_unit: number | null;
          qr_code: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inventory_items']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['inventory_items']['Row']>;
      };
      inventory_movements: {
        Row: {
          id: string;
          inventory_item_id: string;
          batch_id: string | null;
          movement_type: 'purchase' | 'consumption' | 'adjustment' | 'wastage' | 'theft';
          quantity: number;
          unit_cost: number | null;
          total_cost: number | null;
          reference_id: string | null;
          reason: string | null;
          performed_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['inventory_movements']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['inventory_movements']['Insert']>;
      };
      vendors: {
        Row: {
          id: string;
          customer_id: string;
          name: string;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          payment_terms: string | null;
          delivery_lead_days: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vendors']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['vendors']['Row']>;
      };
      purchase_orders: {
        Row: {
          id: string;
          customer_id: string;
          vendor_id: string;
          po_number: string;
          status: 'created' | 'sent' | 'delivered' | 'invoiced' | 'paid';
          expected_delivery_date: string | null;
          actual_delivery_date: string | null;
          subtotal: number;
          tax: number;
          total: number;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['purchase_orders']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['purchase_orders']['Row']>;
      };
      purchase_order_items: {
        Row: {
          id: string;
          purchase_order_id: string;
          inventory_item_id: string;
          quantity: number;
          negotiated_price: number;
          line_total: number;
          received_quantity: number | null;
          notes: string | null;
        };
        Insert: Omit<Database['public']['Tables']['purchase_order_items']['Row'], 'id' | 'line_total'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['purchase_order_items']['Row']>;
      };
      supervisors: {
        Row: {
          id: string;
          customer_id: string;
          supervisor_user_id: string;
          name: string;
          phone: string;
          assigned_sheds: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['supervisors']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['supervisors']['Row']>;
      };
      supervisor_daily_tasks: {
        Row: {
          id: string;
          supervisor_id: string;
          task_date: string;
          task_type: 'health_checklist' | 'mortality_log' | 'feed_log' | 'water_reading';
          batch_id: string | null;
          shed_id: string | null;
          status: 'pending' | 'completed' | 'missed';
          completed_at: string | null;
          synced: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['supervisor_daily_tasks']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['supervisor_daily_tasks']['Row']>;
      };
      documents: {
        Row: {
          doc_id: string;
          farm_id: string;
          batch_id: string | null;
          integrator_id: string;
          doc_name: string;
          doc_type: 'chick_invoice' | 'feed_invoice' | 'vaccination_cert' | 'medicine_bill' | 'movement_permit' | 'sale_invoice' | 'lab_report' | 'insurance' | 'batch_closure_report' | 'other';
          file_path: string;
          file_size_bytes: number | null;
          file_ext: 'pdf' | 'jpg' | 'jpeg' | 'png' | 'heif' | 'heic' | null;
          document_date: string | null;
          tags: string[] | null;
          notes: string | null;
          uploaded_by: string | null;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'doc_id' | 'created_at'> & {
          doc_id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['documents']['Row']>;
      };
      document_audit_log: {
        Row: {
          log_id: string;
          doc_id: string;
          farm_id: string;
          action: 'upload' | 'download' | 'preview' | 'rename' | 'delete';
          performed_by: string | null;
          performed_at: string;
        };
        Insert: Omit<Database['public']['Tables']['document_audit_log']['Row'], 'log_id' | 'performed_at'> & {
          log_id?: string;
          performed_at?: string;
        };
        Update: Partial<Database['public']['Tables']['document_audit_log']['Insert']>;
      };
      message_events: {
        Row: {
          id: string;
          customer_id: string;
          message_type: string;
          message_sid: string;
          sent_at: string;
          delivered_at: string | null;
          read_at: string | null;
          deep_link_clicked: boolean | null;
          deep_link_clicked_at: string | null;
          delivery_status: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered';
          error_message: string | null;
          created_at: string;
          replied_at?: string | null;
        };
        Insert: Omit<Database['public']['Tables']['message_events']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['message_events']['Row']>;
      };
      batch_costs: {
        Row: {
          cost_id: string;
          batch_id: string;
          farm_id: string;
          integrator_id: string;
          category: 'chick' | 'labour_daily' | 'labour_period' | 'overhead' | 'other';
          doc_supplier: string | null;
          price_per_doc: number | null;
          transport_cost: number | null;
          workers_count: number | null;
          rate_per_day: number | null;
          period_start_date: string | null;
          period_end_date: string | null;
          days_count: number | null;
          overhead_category: string | null;
          frequency: string | null;
          batch_share_pct: number | null;
          description: string | null;
          amount: number;
          notes: string | null;
          entry_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['batch_costs']['Row'], 'cost_id' | 'created_at' | 'updated_at'> & {
          cost_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['batch_costs']['Row']>;
      };
      batch_medicine_costs: {
        Row: {
          med_cost_id: string;
          batch_id: string;
          farm_id: string;
          integrator_id: string;
          treatment_id: string | null;
          entry_date: string;
          medicine_name: string;
          brand_name: string | null;
          lot_number: string | null;
          purpose: 'preventive' | 'therapeutic' | 'vaccination' | 'vitamin' | 'other' | null;
          quantity: number;
          unit: 'ml' | 'g' | 'kg' | 'tablets' | 'vials';
          rate_per_unit: number | null;
          total_cost: number | null;
          treatment_day_start: number | null;
          treatment_day_end: number | null;
          withdrawal_days: number | null;
          last_dose_date: string | null;
          clearance_date: string | null;
          is_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['batch_medicine_costs']['Row'], 'med_cost_id' | 'created_at' | 'updated_at'> & {
          med_cost_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['batch_medicine_costs']['Row']>;
      };
      vets: {
        Row: {
          vet_id: string;
          integrator_id: string;
          name: string;
          specialisation: string | null;
          phone: string | null;
          location: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vets']['Row'], 'vet_id' | 'created_at'> & {
          vet_id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['vets']['Row']>;
      };
      batch_treatments: {
        Row: {
          treatment_id: string;
          batch_id: string;
          farm_id: string;
          integrator_id: string;
          treatment_date: string;
          medicine_name: string;
          brand_name: string | null;
          lot_number: string | null;
          purpose: string[] | null;
          dosage_amount: number | null;
          dosage_unit: string | null;
          dosage_per: 'per_litre_water' | 'per_bird' | 'per_kg_bw' | 'per_kg_feed' | null;
          route: 'water' | 'feed' | 'injectable' | 'topical' | 'spray' | null;
          treatment_day_start: number | null;
          treatment_day_end: number | null;
          last_dose_date: string | null;
          withdrawal_days: number;
          clearance_date: string | null;
          is_complete: boolean;
          vet_id: string | null;
          vet_name_snapshot: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['batch_treatments']['Row'], 'treatment_id' | 'created_at' | 'updated_at'> & {
          treatment_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['batch_treatments']['Row']>;
      };
      buyers: {
        Row: {
          buyer_id: string;
          integrator_id: string;
          name: string;
          phone: string | null;
          location: string | null;
          buyer_type: 'trader' | 'processor' | 'cooperative' | 'direct' | 'other' | null;
          notes: string | null;
          rating: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['buyers']['Row'], 'buyer_id' | 'created_at'> & {
          buyer_id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['buyers']['Row']>;
      };
      batch_sales: {
        Row: {
          sale_id: string;
          batch_id: string;
          farm_id: string;
          integrator_id: string;
          sale_date: string;
          sale_type: 'full' | 'partial';
          birds_sold: number;
          total_weight_kg: number;
          actual_avg_weight_g: number | null;
          rate_per_kg: number;
          gross_revenue: number;
          commission_amount: number | null;
          commission_pct: number | null;
          weighment_deduction_kg: number | null;
          net_revenue: number | null;
          buyer_id: string | null;
          buyer_name_snapshot: string | null;
          vehicle_number: string | null;
          driver_name: string | null;
          departure_time: string | null;
          destination: string | null;
          crates_used: number | null;
          dead_in_transit: number | null;
          payment_status: 'pending' | 'confirmed' | 'paid';
          challan_number: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          clearance_date?: string | null;
        };
        Insert: Omit<Database['public']['Tables']['batch_sales']['Row'], 'sale_id' | 'gross_revenue' | 'created_at' | 'updated_at'> & {
          sale_id?: string;
          gross_revenue?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['batch_sales']['Row']>;
      };
      egg_production_logs: {
        Row: {
          id: string;
          batch_id: string;
          log_date: string;
          flock_age_weeks: number | null;
          total_eggs: number;
          broken_eggs: number | null;
          floor_eggs: number | null;
          saleable_eggs: number;
          hdp_percentage: number | null;
          feed_consumed_kg: number | null;
          water_consumed_litres: number | null;
          logged_by: string | null;
          notes: string | null;
          synced: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['egg_production_logs']['Row'], 'id' | 'saleable_eggs' | 'created_at'> & {
          id?: string;
          saleable_eggs?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['egg_production_logs']['Row']>;
      };
      egg_grading_logs: {
        Row: {
          id: string;
          batch_id: string;
          log_date: string;
          large_count: number | null;
          medium_count: number | null;
          small_count: number | null;
          cracked_count: number | null;
          total_graded: number;
          logged_by: string | null;
          notes: string | null;
          synced: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['egg_grading_logs']['Row'], 'id' | 'total_graded' | 'created_at'> & {
          id?: string;
          total_graded?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['egg_grading_logs']['Row']>;
      };
      egg_packing_logs: {
        Row: {
          id: string;
          batch_id: string;
          packing_date: string;
          trays_packed: number | null;
          eggs_per_tray: number | null;
          total_eggs_packed: number;
          crate_count: number | null;
          packing_location: string | null;
          logged_by: string | null;
          notes: string | null;
          synced: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['egg_packing_logs']['Row'], 'id' | 'total_eggs_packed' | 'created_at'> & {
          id?: string;
          total_eggs_packed?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['egg_packing_logs']['Row']>;
      };
      egg_dispatch_logs: {
        Row: {
          id: string;
          batch_id: string;
          dispatch_date: string;
          buyer_name: string;
          quantity_trays: number;
          quantity_eggs: number;
          price_per_dozen: number | null;
          total_amount: number;
          invoice_number: string | null;
          payment_status: 'pending' | 'partial' | 'paid' | null;
          logged_by: string | null;
          notes: string | null;
          synced: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['egg_dispatch_logs']['Row'], 'id' | 'quantity_eggs' | 'total_amount' | 'created_at'> & {
          id?: string;
          quantity_eggs?: number;
          total_amount?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['egg_dispatch_logs']['Row']>;
      };
      feed_logs: {
        Row: {
          id: string;
          batch_id: string;
          log_date: string;
          morning_feed_kg: number;
          evening_feed_kg: number;
          total_feed_kg: number;
          water_litres: number | null;
          feed_brand: string | null;
          feed_type: string | null;
          feed_refusal_kg: number | null;
          logged_by: string | null;
          notes: string | null;
          synced: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['feed_logs']['Row'], 'id' | 'total_feed_kg' | 'created_at'> & {
          id?: string;
          total_feed_kg?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['feed_logs']['Row']>;
      };
      mortality_logs: {
        Row: {
          id: string;
          batch_id: string;
          log_date: string;
          count: number;
          cause: 'unknown' | 'respiratory' | 'digestive' | 'heat_stress' | 'cold_stress' | 'injury' | 'predator' | 'other';
          age_at_death_days: number | null;
          photo_url: string | null;
          logged_by: string | null;
          notes: string | null;
          synced: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['mortality_logs']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['mortality_logs']['Row']>;
      };
      vaccination_schedules: {
        Row: {
          id: string;
          batch_id: string;
          vaccine_name: string;
          vaccine_type: string | null;
          scheduled_day: number;
          due_date: string;
          administered_date: string | null;
          brand: string | null;
          batch_number: string | null;
          dose_per_bird: string | null;
          route: 'drinking_water' | 'spray' | 'injection' | 'eye_drop' | 'nasal' | null;
          administered_by: string | null;
          status: 'pending' | 'done' | 'overdue' | 'skipped';
          notes: string | null;
          synced: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vaccination_schedules']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['vaccination_schedules']['Row']>;
      };
      medication_logs: {
        Row: {
          id: string;
          batch_id: string;
          log_date: string;
          symptom: string | null;
          diagnosis: string | null;
          drug_name: string;
          dose: string | null;
          route: 'oral' | 'injection' | 'topical' | 'intramuscular' | 'subcutaneous' | null;
          duration_days: number | null;
          withdrawal_days: number;
          withdrawal_end_date: string;
          administered_by: string | null;
          is_antibiotic: boolean;
          notes: string | null;
          synced: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['medication_logs']['Row'], 'id' | 'withdrawal_end_date' | 'created_at'> & {
          id?: string;
          withdrawal_end_date?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['medication_logs']['Row']>;
      };
      weight_logs: {
        Row: {
          id: string;
          batch_id: string;
          log_date: string;
          sample_size: number;
          avg_weight_kg: number;
          std_deviation_kg: number | null;
          logged_by: string | null;
          notes: string | null;
          synced: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['weight_logs']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['weight_logs']['Row']>;
      };
      health_checklists: {
        Row: {
          id: string;
          batch_id: string;
          log_date: string;
          bird_behaviour: 'normal' | 'lethargic' | 'aggressive' | null;
          appetite: 'normal' | 'reduced' | 'refused' | null;
          droppings: 'normal' | 'loose' | 'yellow' | 'bloody' | null;
          respiratory: 'normal' | 'coughing' | 'sneezing' | 'gasping' | null;
          water_consumption: 'normal' | 'reduced' | 'excessive' | null;
          notes: string | null;
          logged_by: string | null;
          synced: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['health_checklists']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['health_checklists']['Row']>;
      };
      biosecurity_audits: {
        Row: {
          id: string;
          batch_id: string;
          audit_date: string;
          visitor_log: boolean | null;
          vehicle_entry_log: boolean | null;
          footbath_maintenance: boolean | null;
          feed_store_hygiene: boolean | null;
          dead_bird_disposal: boolean | null;
          equipment_sanitation: boolean | null;
          rodent_control: boolean | null;
          flock_isolation: boolean | null;
          worker_ppe: boolean | null;
          vaccination_records_up_to_date: boolean | null;
          sick_bird_isolation_protocol: boolean | null;
          biosecurity_training_up_to_date: boolean | null;
          score: number;
          audited_by: string | null;
          notes: string | null;
          synced: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['biosecurity_audits']['Row'], 'id' | 'score' | 'created_at'> & {
          id?: string;
          score?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['biosecurity_audits']['Row']>;
      };
      doc_suppliers: {
        Row: {
          id: string;
          customer_id: string;
          name: string;
          location: string | null;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          avg_survival_rate: number | null;
          total_batches_supplied: number | null;
          avg_rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['doc_suppliers']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['doc_suppliers']['Row']>;
      };
      medicines_db: {
        Row: {
          medicine_id: string;
          generic_name: string;
          category: 'antibiotic' | 'antifungal' | 'antiparasitic' | 'vaccine' | 'vitamin' | 'probiotic' | 'other';
          standard_withdrawal_days_india: number;
          dosage_guidance: string | null;
          brand_names: string[] | null;
          notes: string | null;
        };
        Insert: Omit<Database['public']['Tables']['medicines_db']['Row'], 'medicine_id'> & {
          medicine_id?: string;
        };
        Update: Partial<Database['public']['Tables']['medicines_db']['Row']>;
      };
    };
    Views: {
      mv_accuracy_dashboard: {
        Row: {
          directional_accuracy: number;
          directional_accuracy_30d: number;
          mape: number;
          conformal_coverage: number;
          model_version: string;
          gate_status: 'PASS' | 'FAIL' | 'PENDING';
          last_computed: string;
        };
      };
    };
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
}
