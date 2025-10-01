import { Storage } from '~/systems/Core';
import type { Profile } from '../types';

const STORAGE_KEY = 'name-system-profiles';
const DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 hours
const TEN_MINUTES_IN_MS = 10 * 60 * 1000; // 10 minutes

type StoredProfileEntry = {
  value: Profile;
  expiresAt: number;
};

type ChainProfiles = Record<string, StoredProfileEntry | Profile>;
type StorageByChainId = Record<string, ChainProfiles>;

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export default class NameSystemStorage {
  static setProfile(profile: Profile, chainId: number) {
    const currentProfiles =
      Storage.getItem<StorageByChainId>(STORAGE_KEY) || {};
    const chainKey = chainId.toString();
    const chainProfiles = { ...(currentProfiles[chainKey] || {}) };

    chainProfiles[profile.address] = {
      value: profile,
      expiresAt: Date.now() + NameSystemStorage.resolveTTL(profile),
    };

    currentProfiles[chainKey] = chainProfiles;
    Storage.setItem(STORAGE_KEY, currentProfiles);
  }

  static getProfile(address: string, chainId: number): Profile | null {
    const currentProfiles = Storage.getItem<StorageByChainId>(STORAGE_KEY);

    if (!currentProfiles) {
      return null;
    }

    const chainKey = chainId.toString();
    const chainProfiles = currentProfiles[chainKey];

    if (!chainProfiles) {
      return null;
    }

    const stored = chainProfiles[address];

    if (!stored) {
      return null;
    }

    if (NameSystemStorage.isStoredProfileEntry(stored)) {
      if (stored.expiresAt <= Date.now()) {
        NameSystemStorage.removeProfile(currentProfiles, chainKey, address);
        return null;
      }

      return stored.value;
    }

    // Legacy entry without TTL; normalize and persist with a fresh TTL.
    const legacyProfile = stored;
    chainProfiles[address] = {
      value: legacyProfile,
      expiresAt: Date.now() + NameSystemStorage.resolveTTL(legacyProfile),
    };
    Storage.setItem(STORAGE_KEY, currentProfiles);

    return legacyProfile;
  }

  private static resolveTTL(profile: Profile) {
    return profile.name ? DAY_IN_MS : TEN_MINUTES_IN_MS;
  }

  private static isStoredProfileEntry(
    value: StoredProfileEntry | Profile
  ): value is StoredProfileEntry {
    return (value as StoredProfileEntry)?.value !== undefined;
  }

  private static removeProfile(
    profiles: StorageByChainId,
    chainKey: string,
    address: string
  ) {
    const chainProfiles = profiles[chainKey];

    if (!chainProfiles) return;

    delete chainProfiles[address];

    if (Object.keys(chainProfiles).length === 0) {
      delete profiles[chainKey];
    }

    Storage.setItem(STORAGE_KEY, profiles);
  }
}
