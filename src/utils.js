export default (object) => {
  if (typeof object === 'object') {
    return Object.keys(object).length;
  }
  return 0;
};
