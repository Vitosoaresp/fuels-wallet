import type { Operation } from 'fuels';
import { NetworkService } from '~/systems/Network';
import type { OperationWithDomain } from '~/systems/Transaction';
import NameSystemService from '../services/nameSystem';

export const getOperationsWithDomain = async (
  operations: Operation[]
): Promise<OperationWithDomain[]> => {
  const currentNetwork = await NetworkService.getSelectedNetwork();
  const chainId = currentNetwork?.chainId;

  if (chainId === undefined) {
    return operations;
  }

  const addresses = operations.reduce<Set<string>>((set, operation) => {
    if (operation.to?.address) set.add(operation.to.address);
    if (operation.from?.address) set.add(operation.from.address);
    return set;
  }, new Set());

  const uniqueAddresses = Array.from(addresses);

  const { domains } = await NameSystemService.resolverAddresses({
    addresses: uniqueAddresses,
    chainId,
  });

  if (!domains || !domains.length) {
    return operations;
  }

  const avatarsByDomains = await Promise.allSettled(
    domains.map(async (domain) => ({
      name: domain.name,
      resolver: domain.resolver,
      avatar: await NameSystemService.getBakoIdAvatar({
        domain: domain.name,
        chainId,
      }).then((response) => response.avatar),
    }))
  ).then((results) =>
    results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value)
  );

  const addressToDomainMap = avatarsByDomains.reduce(
    (map, entry) => {
      map[entry.resolver] = { name: `@${entry.name}`, avatar: entry.avatar };
      return map;
    },
    {} as Record<string, { name: string; avatar: string | null }>
  );

  return operations.map((operation) => ({
    ...operation,
    from: operation.from
      ? {
          ...operation.from,
          domain: addressToDomainMap[operation.from.address]?.name || null,
          avatar: addressToDomainMap[operation.from.address]?.avatar || null,
        }
      : undefined,
    to: operation.to
      ? {
          ...operation.to,
          domain: addressToDomainMap[operation.to.address]?.name || null,
          avatar: addressToDomainMap[operation.to.address]?.avatar || null,
        }
      : undefined,
  }));
};
