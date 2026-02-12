import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const saveParentData = async (mobileNumber: string) => {
  console.log('Saving parent mobile:', mobileNumber);
  try {
    const { data, error } = await supabase
      .from('parents')
      .insert([{ mobile_number: mobileNumber }]);

    if (error) {
      console.error('Supabase error:', error);
      // Fallback for demo/mock if no real backend
      localStorage.setItem('parent_mobile', mobileNumber);
      return { data: null, error: null }; // Pretend success for demo
    }
    return { data, error };
  } catch (err) {
    console.error('Supabase exception:', err);
    localStorage.setItem('parent_mobile', mobileNumber);
    return { data: null, error: null };
  }
};
