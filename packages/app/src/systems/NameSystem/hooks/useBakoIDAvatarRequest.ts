import { useSelector } from '@xstate/react';
import { useCallback, useEffect, useMemo } from 'react';
import { Services, store } from '~/store';
import { useNetworks } from '~/systems/Network';
import type { NameSystemRequestMachine } from '../machines/nameSystemRequetMachine';
import { isNumber } from '../utils/isNumber';

const selectors = {
  avatar(state: NameSystemRequestMachine) {
    return state.context.avatar;
  },
  isFetching(state: NameSystemRequestMachine) {
    return state.context.isFetchingProfile;
  },
  name(state: NameSystemRequestMachine) {
    return state.context.name;
  },
};

export type UseBakoIDAvatarRequestReturn = ReturnType<
  typeof useBakoIDAvatarRequest
>;

type getProfilePayload = {
  address: string;
  chainId: number;
};

export function useBakoIDAvatarRequest(address: string) {
  const { network } = useNetworks();
  const service = store.useService(Services.nameSystemRequest);
  const avatarUrl = useSelector(service, selectors.avatar);
  const isFetching = useSelector(service, selectors.isFetching);
  const name = useSelector(service, selectors.name);
  const chainId = useMemo(() => network?.chainId, [network?.chainId]);

  const getProfile = useCallback(
    (input: getProfilePayload) => {
      service.send('GET_PROFILE', input);
    },
    [service]
  );

  const reset = useCallback(() => {
    service.send('RESET');
  }, [service]);

  useEffect(() => {
    if (isNumber(chainId)) {
      getProfile({ address, chainId });
    }

    return () => {
      reset();
    };
  }, [getProfile, address, reset, chainId]);

  return {
    reset,
    avatarUrl,
    isFetching,
    name,
  };
}
