import { useSelector } from '@xstate/react';
import { Services, store } from '~/store';
import { useNetworks } from '~/systems/Network';
import type { NameSystemRequestState } from '../machines/nameSystemRequetMachine';

const selectors = {
  name(state: NameSystemRequestState) {
    return state.context.name;
  },
  address(state: NameSystemRequestState) {
    return state.context.address;
  },
  isOpenDropdown(state: NameSystemRequestState) {
    return state.context.isDropdownOpen;
  },
  avatar(state: NameSystemRequestState) {
    return state.context.avatar;
  },
  isFetchingAvatar(state: NameSystemRequestState) {
    return state.context.isFetchingAvatar;
  },
};

export type UseNameSystemRequestReturn = ReturnType<
  typeof useNameSystemRequest
>;

type SetDomain = {
  domain: string;
  address: string;
};

export function useNameSystemRequest() {
  const { network } = useNetworks();
  const service = store.useService(Services.nameSystemRequest);
  const domain = useSelector(service, selectors.name);
  const address = useSelector(service, selectors.address);
  const avatarUrl = useSelector(service, selectors.avatar);
  const isFetchingAvatar = useSelector(service, selectors.isFetchingAvatar);
  const isOpenDropdown = useSelector(service, selectors.isOpenDropdown);

  function toggleDropdown(open: boolean) {
    service.send('TOGGLE_DROPDOWN', { open });
  }

  function setDomain(input: Omit<SetDomain, 'chainId'>) {
    service.send('SET_DOMAIN', { ...input, chainId: network?.chainId });
  }

  function reset() {
    service.send('RESET');
  }

  return {
    reset,
    setDomain,
    domain,
    address,
    toggleDropdown,
    isOpenDropdown,
    avatarUrl,
    isFetchingAvatar,
  };
}
