module.exports = {
  '*.{ts,tsx,js,jsx}': ['prettier --write', 'eslint --fix', 'git add'],
  '*.{json,md}': ['prettier --write', 'git add'],
};
