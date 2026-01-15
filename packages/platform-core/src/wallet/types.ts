export type Money = number & { readonly __brand: "Money" };

export interface Wallet {
  readonly userId: string;
  readonly realBalance: Money;
  readonly bonusBalance: Money;
  readonly lockedBalance: Money;
}
