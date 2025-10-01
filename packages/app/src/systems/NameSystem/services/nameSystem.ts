import { BakoIDClient } from '@bako-id/sdk';

export type NameSystemInput = {
  resolverDomain: {
    domain: string;
    chainId: number;
  };
  resolverAddreses: {
    addresses: string[];
    chainId: number;
  };
  resolverAddress: {
    address: string;
    chainId: number;
  };
  getBakoIdAvatar: {
    domain: string;
    chainId: number;
  };
  getBakoIdProfile: { address: string; chainId: number };
};

const client = new BakoIDClient();

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export default class NameSystemService {
  static async resolverDomain(params: NameSystemInput['resolverDomain']) {
    try {
      const address = await client.resolver(params.domain, params.chainId);
      return { address, error: null };
    } catch {
      return {
        address: null,
        error: 'Domain resolver is currently unavailable',
      };
    }
  }

  static async resolverAddresses(params: NameSystemInput['resolverAddreses']) {
    try {
      const domains = await client.names(params.addresses, params.chainId);

      return { domains, error: null };
    } catch {
      return { domains: null, error: 'Error on resolver address' };
    }
  }

  static async resolverAddress(params: NameSystemInput['resolverAddress']) {
    try {
      const name = await client.name(params.address, params.chainId);
      return { name, error: null };
    } catch {
      return { name: null, error: 'Error on resolver address' };
    }
  }

  static async getBakoIdAvatar(params: NameSystemInput['getBakoIdAvatar']) {
    try {
      const avatar = await client.avatar(params.domain, params.chainId);

      return { avatar };
    } catch {
      return { avatar: null, error: 'Error on getting Bako ID avatar' };
    }
  }

  static async getBakoIdProfile(params: NameSystemInput['getBakoIdProfile']) {
    try {
      const [name, avatar] = await Promise.all([
        client.name(params.address, params.chainId),
        client.avatar(params.address, params.chainId),
      ]);

      return { profile: { name, avatar, address: params.address } };
    } catch {
      return { profile: null, error: 'Error on getting Bako ID profile' };
    }
  }
}
