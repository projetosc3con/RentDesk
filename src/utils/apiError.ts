export function getApiErrorMessage(err: unknown, fallback = 'Ocorreu um erro. Tente novamente.'): string {
  const data = (err as any)?.response?.data;
  return data?.asaas?.errors?.[0]?.description || data?.error || (err as any)?.message || fallback;
}
