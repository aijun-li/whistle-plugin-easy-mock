import { defineConfig } from 'windicss/helpers';

export default defineConfig({
  theme: {
    colors: {
      attraction: '#4300b0',
      subtitle: '#1b1b1b',
      danger: '#b80000',
      disabled: '#888888',
    },
    extend: {
      width: {
        fit: 'fit-content',
      },
    },
  },
});
