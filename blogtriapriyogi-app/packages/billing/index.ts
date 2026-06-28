export function charge(userId: string, amount: number) {
  return {
    success: true,
    userId,
    amount,
    status: "paid"
  }
}
