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

module.exports = {
  formKey,
  getCategoryItem
};
