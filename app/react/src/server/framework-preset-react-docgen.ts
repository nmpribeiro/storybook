import fs from 'fs';
import type { TransformOptions } from '@babel/core';
import type { Configuration } from 'webpack';
import type { StorybookOptions } from '@storybook/core/types';
import ReactDocgenTypescriptPlugin from 'react-docgen-typescript-plugin';

export function babel(config: TransformOptions, { typescriptOptions }: StorybookOptions) {
  const { reactDocgen } = typescriptOptions;

  if (!reactDocgen || reactDocgen === 'react-docgen-typescript') {
    return config;
  }

  return {
    ...config,
    overrides: [
      {
        test: reactDocgen === 'react-docgen' ? /\.(mjs|tsx?|jsx?)$/ : /\.(mjs|jsx?)$/,
        plugins: [
          [
            require.resolve('babel-plugin-react-docgen'),
            {
              DOC_GEN_COLLECTION_NAME: 'STORYBOOK_REACT_CLASSES',
            },
          ],
        ],
      },
    ],
  };
}

const tsconfigPath = './tsconfig.json';

export function webpackFinal(config: Configuration, { typescriptOptions }: StorybookOptions) {
  const { reactDocgen, reactDocgenTypescriptOptions = {} } = typescriptOptions;

  if (reactDocgen !== 'react-docgen-typescript') {
    return config;
  }

  if (
    !reactDocgenTypescriptOptions.tsconfigPath &&
    !reactDocgenTypescriptOptions.compilerOptions &&
    fs.existsSync(tsconfigPath)
  ) {
    reactDocgenTypescriptOptions.tsconfigPath = tsconfigPath;
  }

  return {
    ...config,
    plugins: [...config.plugins, new ReactDocgenTypescriptPlugin(reactDocgenTypescriptOptions)],
  };
}
