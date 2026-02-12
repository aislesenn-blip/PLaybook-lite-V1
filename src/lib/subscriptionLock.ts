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

export const unlockPremium = (licenseKey: string): boolean => {
  if (licenseKey === 'PLAYBOOK-LITE-VIP') {
    localStorage.setItem('isPremium', 'true');
    return true;
  }
  return false;
};
