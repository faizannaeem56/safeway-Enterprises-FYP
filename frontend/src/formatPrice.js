
const formatPrice = (amount) => {
  const price = Number(amount);

  if (!Number.isFinite(price)) {
    return 'Rs. 0';
  }

  return `Rs. ${new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 2
  }).format(price)}`;
};

export default formatPrice;
