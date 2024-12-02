import js from '@eslint/js';
import ts from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import next from '@next/eslint-plugin-next';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  stylistic.configs.customize({
    arrowParens: true,
    semi: true,
    jsx: true,
    flat: true,
  }),
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      '@next/next': next,
    },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
    }
  }
);