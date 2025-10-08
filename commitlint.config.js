module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [0, 'always', 100],
  },
  ignores: [
    // Commits starting with "Release X.Y.Z" are ignored
    (commit) => /^Release \d+\.\d+\.\d+/u.test(commit),
  ],
};
