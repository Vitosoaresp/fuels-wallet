type Profile = { name: string | null; avatar: string | null; address: string };

const STORAGE_KEY = 'fuel_nameSystemProfiles';

// use session storage because the profiles should not persist across sessions
const Storage = sessionStorage;

type StorageByChainId = Record<string, Record<string, Profile>>;

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export default class NameSystemStorage {
  static setProfile(profile: Profile, chainId: number) {
    const currentProfiles = Storage.getItem(STORAGE_KEY) || '{}';
    const parsed = JSON.parse(currentProfiles) as StorageByChainId;
    parsed[chainId] = parsed[chainId] || {};
    parsed[chainId][profile.address] = profile;
    Storage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  }

  static getProfile(address: string, chainId: number): Profile | null {
    const currentProfiles = Storage.getItem(STORAGE_KEY);

    if (!currentProfiles) {
      return null;
    }

    const parsed = JSON.parse(currentProfiles) as StorageByChainId;

    return parsed[chainId]?.[address] || null;
  }
}
