import { defineConfig } from 'windicss/helpers';

export default defineConfig({
  theme: {
    extend: {
      width: {
        fit: 'fit-content',
      },
      height: {
        fit: 'fit-content',
      },
      colors: {
        attraction: '#4300b0',
        subtitle: '#1b1b1b',
        danger: '#b80000',
        disabled: '#888888',
      },
    },
  },
});
