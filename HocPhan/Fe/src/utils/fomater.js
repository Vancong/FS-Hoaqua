export const Fomater = (number) => {
    return new Intl.NumberFormat("vi-VN",
        {
            style: "currency",
            currency: "VND"
        }
    ).format(number);

}

export const formatWeight = (volume) => {
  if (!volume) return '';
  const num = parseFloat(volume);
  if (isNaN(num)) return volume;
  if (num >= 1000) {
    return `${num / 1000}kg`;
  }
  if (num < 10) {
    return `${num}kg`;
  }
  return `${num}g`;
};