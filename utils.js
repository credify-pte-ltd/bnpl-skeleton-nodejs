const formKey = (data) => {
  return `-----BEGIN PRIVATE KEY-----
${data}
-----END PRIVATE KEY-----`;
};

module.exports = {
  formKey
};
