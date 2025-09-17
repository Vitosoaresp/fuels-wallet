import {
  type DoneInvokeEvent,
  type InterpreterFrom,
  type StateFrom,
  assign,
  createMachine,
} from 'xstate';
import type { FetchResponse } from '~/systems/Core';
import NameSystemService from '../services/nameSystem';
import NameSystemStorage from '../utils/storage';

type MachineContext = {
  address: null | string;
  chainId: null | number;
  name: null | string;
  error: null | string;
  isDropdownOpen: boolean;
  avatar: string | null;
  isFetchingAvatar: boolean;
  isFetchingProfile: boolean;
};

type MachineService = {
  addressResolver: { data: FetchResponse<string> };
  domainResolver: { data: FetchResponse<string> };
  getAvatar: { data: string | null };
  getProfile: {
    data: {
      avatar: string | null;
      name: string | null;
      address: string | null;
    };
  };
};

type MachineEvents =
  | { type: 'SET_DOMAIN'; domain: string; chainId: number; address: string }
  | { type: 'TOGGLE_DROPDOWN'; open: boolean }
  | { type: 'GET_PROFILE'; address: string; chainId: number }
  | { type: 'RESET' };

export const nameSystemRequestMachine = createMachine(
  {
    id: '(machine)',
    initial: 'idle',
    tsTypes: {} as import('./nameSystemRequetMachine.typegen').Typegen0,
    schema: {
      context: {} as MachineContext,
      services: {} as MachineService,
      events: {} as MachineEvents,
    },
    states: {
      idle: {
        on: {
          RESET: {
            actions: 'reset',
          },
          TOGGLE_DROPDOWN: {
            actions: 'toggleDropdown',
          },
          SET_DOMAIN: {
            target: 'loadingAvatar',
            actions: 'setDomain',
          },
          GET_PROFILE: {
            target: 'loadingProfile',
          },
        },
      },
      loadingAvatar: {
        entry: 'startFetchingAvatar',
        exit: 'stopFetchingAvatar',
        invoke: {
          src: 'getAvatar',
          onDone: {
            target: 'idle',
            actions: 'setFetchedAvatar',
          },
          onError: {
            target: 'idle',
          },
        },
      },
      loadingProfile: {
        entry: 'startFetchingProfile',
        exit: 'stopFetchingProfile',
        invoke: {
          src: 'getProfile',
          onDone: {
            target: 'idle',
            actions: 'setFetchedProfile',
          },
          onError: {
            target: 'idle',
          },
        },
      },
    },
    context: {
      address: null,
      error: null,
      name: null,
      chainId: null,
      isDropdownOpen: false,
      avatar: null,
      isFetchingAvatar: false,
      isFetchingProfile: false,
    },
  },
  {
    actions: {
      reset: assign({
        name: null,
        address: null,
        isDropdownOpen: false,
        avatar: null,
        isFetchingAvatar: false,
        isFetchingProfile: false,
      }),
      toggleDropdown: assign({
        isDropdownOpen: (_, e) => e.open,
      }),
      setDomain: assign({
        name: (_, e) => e.domain,
        chainId: (_, e) => e.chainId,
        isDropdownOpen: true,
        address: (_, e) => e.address,
      }),
      setFetchedAvatar: assign({
        avatar: (_ctx, e: DoneInvokeEvent<string | null>) => e.data ?? null,
      }),
      startFetchingAvatar: assign({
        isFetchingAvatar: () => true,
      }),
      stopFetchingAvatar: assign({
        isFetchingAvatar: () => false,
      }),
      setFetchedProfile: assign({
        avatar: (
          _ctx,
          e: DoneInvokeEvent<MachineService['getProfile']['data']>
        ) => e.data?.avatar ?? null,
        name: (
          _ctx,
          e: DoneInvokeEvent<MachineService['getProfile']['data']>
        ) => e.data?.name ?? null,
      }),
      startFetchingProfile: assign({
        isFetchingProfile: () => true,
      }),
      stopFetchingProfile: assign({
        isFetchingProfile: () => false,
      }),
    },
    services: {
      getAvatar: async (ctx) => {
        const { chainId, name } = ctx;
        if (!name || chainId === null) {
          return null;
        }

        const { avatar } = await NameSystemService.getBakoIdAvatar({
          domain: name.replace('@', ''),
          chainId,
        });
        return avatar;
      },
      getProfile: async (_ctx, data) => {
        const { chainId, address } = data;
        if (!address || chainId === null) {
          return { name: null, avatar: null, address: null };
        }

        const profileByStorage = NameSystemStorage.getProfile(address, chainId);

        if (profileByStorage) {
          return profileByStorage;
        }

        const [name, avatar] = await Promise.all([
          NameSystemService.resolverAddress({ address, chainId }).then(
            (resp) => resp.name
          ),
          NameSystemService.getBakoIdAvatar({
            domain: address,
            chainId,
          }).then((res) => res.avatar),
        ]);

        NameSystemStorage.setProfile({ name, avatar, address }, chainId);

        return { name, avatar, address };
      },
    },
  }
);

export type NameSystemRequestMachine = typeof nameSystemRequestMachine;
export type NameSystemRequestService =
  InterpreterFrom<NameSystemRequestMachine>;
export type NameSystemRequestState = StateFrom<NameSystemRequestMachine>;
