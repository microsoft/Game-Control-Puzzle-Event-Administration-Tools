import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    // depending on your application, base can also be "/"
    base: '/',
    plugins: [react(), tsconfigPaths()],
    server: {
        // this ensures that the browser opens upon server start
        open: true,
        // this sets a default port to 3000
        port: 3000,
    },
    build: {
        outDir: 'build',
    },
    resolve: {
        alias: {
            modules: '/src/modules',
            components: '/src/components',
            utils: '/src/utils',
        },
    },
});
