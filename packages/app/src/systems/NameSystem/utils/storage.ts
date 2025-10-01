import type { Profile } from '../types';

type ChainProfiles = Record<string, Profile>;
type StorageByChainId = Record<string, ChainProfiles>;

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export default class NameSystemStorage {
  private static profiles: StorageByChainId = {};

  static setProfile(profile: Profile, chainId: number) {
    const chainKey = chainId.toString();
    const chainProfiles = NameSystemStorage.profiles[chainKey] || {};

    chainProfiles[profile.address] = profile;
    NameSystemStorage.profiles[chainKey] = chainProfiles;
  }

  static getProfile(address: string, chainId: number): Profile | null {
    const chainKey = chainId.toString();
    const chainProfiles = NameSystemStorage.profiles[chainKey];

    if (!chainProfiles) {
      return null;
    }

    return chainProfiles[address] || null;
  }

  static clear(chainId?: number) {
    if (typeof chainId === 'number') {
      delete NameSystemStorage.profiles[chainId.toString()];
      return;
    }

    NameSystemStorage.profiles = {};
  }
}
