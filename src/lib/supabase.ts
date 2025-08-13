import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          email: string;
          phone: string;
          company_name: string;
          website: string | null;
          address: string;
          bank_account: string;
          authorized_signer: string;
          id_number: string | null;
          bio: string | null;
          income_categories: any;
          expense_categories: any;
          project_types: any;
          event_types: any;
          asset_categories: any;
          sop_categories: any;
          project_status_config: any;
          notification_settings: any;
          security_settings: any;
          briefing_template: string;
          terms_and_conditions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          full_name?: string;
          email?: string;
          phone?: string;
          company_name?: string;
          website?: string | null;
          address?: string;
          bank_account?: string;
          authorized_signer?: string;
          id_number?: string | null;
          bio?: string | null;
          income_categories?: any;
          expense_categories?: any;
          project_types?: any;
          event_types?: any;
          asset_categories?: any;
          sop_categories?: any;
          project_status_config?: any;
          notification_settings?: any;
          security_settings?: any;
          briefing_template?: string;
          terms_and_conditions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          full_name?: string;
          email?: string;
          phone?: string;
          company_name?: string;
          website?: string | null;
          address?: string;
          bank_account?: string;
          authorized_signer?: string;
          id_number?: string | null;
          bio?: string | null;
          income_categories?: any;
          expense_categories?: any;
          project_types?: any;
          event_types?: any;
          asset_categories?: any;
          sop_categories?: any;
          project_status_config?: any;
          notification_settings?: any;
          security_settings?: any;
          briefing_template?: string;
          terms_and_conditions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add other table types as needed
    };
  };
}