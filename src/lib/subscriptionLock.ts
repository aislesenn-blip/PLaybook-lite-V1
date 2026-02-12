import { supabase } from './supabaseClient';

export const checkSubscriptionStatus = (): boolean => {
  const FIRST_OPEN_KEY = 'firstOpenDate';
  const IS_PREMIUM_KEY = 'isPremium';

  // 1. Check/Set First Open Date
  const firstOpenDate = localStorage.getItem(FIRST_OPEN_KEY);
  if (!firstOpenDate) {
    localStorage.setItem(FIRST_OPEN_KEY, Date.now().toString());
  }

  // 2. Check Premium Status
  const isPremium = localStorage.getItem(IS_PREMIUM_KEY) === 'true';
  if (isPremium) {
    return false; // Not locked
  }

  // 3. Check Time Elapsed (48 hours)
  const startTime = firstOpenDate ? parseInt(firstOpenDate, 10) : Date.now();
  const currentTime = Date.now();
  const hoursElapsed = (currentTime - startTime) / (1000 * 60 * 60);

  // If more than 48 hours and not premium, return true (LOCKED)
  return hoursElapsed > 48;
};

export const verifyLicenseKey = async (licenseKey: string): Promise<{ success: boolean; message: string }> => {
  if (!navigator.onLine) {
    return { success: false, message: 'Connect to internet to unlock.' };
  }

  try {
    // 1. Check if key exists and is unused
    const { data, error } = await supabase
      .from('license_keys')
      .select('*')
      .eq('key_code', licenseKey)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, message: 'Verification failed. Please try again.' };
    }

    if (!data) {
      return { success: false, message: 'Invalid License Key.' };
    }

    if (data.is_used) {
      return { success: false, message: 'This key has already been used.' };
    }

    // 2. Mark key as used
    const { error: updateError } = await supabase
      .from('license_keys')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', data.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return { success: false, message: 'Could not activate key. Please contact support.' };
    }

    // 3. Unlock locally
    localStorage.setItem('isPremium', 'true');
    return { success: true, message: 'Success! Welcome to Playbook.' };

  } catch (err) {
    console.error('Exception during unlock:', err);
    return { success: false, message: 'An unexpected error occurred.' };
  }
};
