const { CATEGORY, CATEGORY_TYPE } = require("./constants");

const formKey = (data) => {
  return `-----BEGIN PRIVATE KEY-----
${data}
-----END PRIVATE KEY-----`;
};

const getCategoryItem = (categoryType) => {
  if (CATEGORY.COMPUTER.includes(categoryType)) {
    return CATEGORY_TYPE.COMPUTER;
  }

  if (CATEGORY.MOBILE_DEVICE.includes(categoryType)) {
    return CATEGORY_TYPE.MOBILE_DEVICE;
  }

  if (CATEGORY.ELECTRONIC_DEVICE.includes(categoryType)) {
    return CATEGORY_TYPE.ELECTRONIC_DEVICE;
  }
  return "";
};

const mapCategoryFromOrderLine = (orderLines) => {
  if(!orderLines) return [];

  const result = JSON.parse(JSON.stringify(orderLines));

  return result.map((orderLine) => {
    orderLine.category = getCategoryItem(orderLine.category);
    return orderLine;
  });
};

module.exports = {
  formKey,
  getCategoryItem,
  mapCategoryFromOrderLine
};
