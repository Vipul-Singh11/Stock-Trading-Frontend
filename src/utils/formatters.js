export function formatCurrency(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(number);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value || 0));
}

export function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function getApiErrorMessage(error, fallback = 'Request failed') {
  const data = error?.response?.data;

  if (data?.message) {
    if (data.errors) {
      return `${data.message}: ${Object.values(data.errors).join(', ')}`;
    }

    return data.message;
  }

  if (data?.error) {
    return data.error;
  }

  return error?.message || fallback;
}
