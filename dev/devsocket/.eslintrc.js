module.exports = {
    root: true,
    extends: ['@metamask/eslint-config'],
    overrides: [
        {
            files: ['**/*.js'],
            extends: ['@metamask/eslint-config-nodejs'],
        },
    ],
    ignorePatterns: [
        '!.prettierrc.js',
        '!.eslintrc.js',
    ],
};
