// Credit ledger service (stubs). Implement DB operations where indicated.
// Expected DB tables (pseudo):
// - processed_events(id text primary key, created_at timestamptz)
// - credit_ledger(id pk, user_id fk, delta int, source text, price_id text,
//                 expires_at timestamptz null, created_at timestamptz)
// - credit_balance(user_id pk, balance int, updated_at timestamptz)
//   For subscribers, enforce rollover caps after each deposit.

export type CreditDepositInput = {
  userIdOrEmail: string
  credits: number
  source: 'starter' | 'monthly' | 'quarterly' | 'topup' | string
  priceId: string
  expiresInDays?: number
  rolloverCap?: number
}

export async function creditDeposit(input: CreditDepositInput): Promise<void> {
  // TODO:
  // 1) Resolve user id by email or direct id.
  // 2) Insert a +credits ledger row; set expires_at = now + expiresInDays (if provided).
  // 3) Recompute balance = sum(active ledger deltas) for the user.
  // 4) If rolloverCap is provided (recurring subscribers):
  //    cap balance to rolloverCap (e.g., keep most recent credits, expire older ones),
  //    or store a derived balance applying the cap.
  // NOTE: Ensure this runs in a transaction.
  return
}

export async function isProcessed(key: string): Promise<boolean> {
  // TODO: query processed_events by primary key = key
  return false
}

export async function markProcessed(key: string): Promise<void> {
  // TODO: insert into processed_events(id) values(key)
  return
}
