import { useEffect, useMemo, useState } from 'react';
import { useNetworks } from '~/systems/Network';
import NameSystemService from '../services/nameSystem';
import type { Profile } from '../types';
import { isNumber } from '../utils/isNumber';
import NameSystemStorage from '../utils/storage';

export type UseBakoIDRequestReturn = ReturnType<typeof useBakoIDRequest>;

type getProfilePayload = {
  address: string;
  chainId: number;
};

export function useBakoIDRequest(address: string) {
  const { network } = useNetworks();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  const chainId = useMemo(() => network?.chainId ?? null, [network?.chainId]);
  const canFetch = useMemo(
    () => Boolean(address) && isNumber(chainId),
    [address, chainId]
  );

  useEffect(() => {
    if (!canFetch) {
      setProfile(null);
      setIsFetching(false);
      return;
    }

    const cachedProfile = NameSystemStorage.getProfile(address, chainId!);
    if (cachedProfile) {
      setProfile(cachedProfile);
      setIsFetching(false);
      return;
    }

    const loadProfile = async ({ address, chainId }: getProfilePayload) => {
      try {
        setIsFetching(true);
        const [name, avatar] = await Promise.all([
          NameSystemService.resolverAddress({ address, chainId }).then(
            (resp) => resp.name
          ),
          NameSystemService.getBakoIdAvatar({
            domain: address,
            chainId,
          }).then((res) => res.avatar),
        ]);

        const nextProfile: Profile = { name, avatar, address };
        setProfile(nextProfile);
        NameSystemStorage.setProfile(nextProfile, chainId);
      } finally {
        setIsFetching(false);
      }
    };

    loadProfile({ address, chainId: chainId! });
  }, [address, canFetch, chainId]);

  return {
    avatarUrl: profile?.avatar ?? null,
    isFetching,
    name: profile?.name ?? null,
    address,
  };
}
