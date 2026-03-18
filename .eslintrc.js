module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // Allow unused variables in production
    'no-unused-vars': 'warn',
    // Allow missing dependencies in useCallback
    'react-hooks/exhaustive-deps': 'warn',
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
};
