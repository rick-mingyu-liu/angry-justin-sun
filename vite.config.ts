import { readFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";

const LICENCE_FILE = "licenses.txt";

/** Notices for the code and fonts that ship, in the order they appear in the credits dialog. */
const LICENCE_SOURCES: readonly [title: string, path: string][] = [
  ["angry-aliens-phaser (game prototype)", "LICENSE"],
  ["phaser", "third_party/licenses/phaser-LICENSE.md"],
  ["matter-js", "third_party/licenses/matter-js-LICENSE"],
  ["eventemitter3", "third_party/licenses/eventemitter3-LICENSE"],
  ["Noto Serif SC (certificate font subset)", "third_party/licenses/NotoSerifSC-OFL.txt"],
];

const KENNEY_FONTS_NOTICE = `Kenney Fonts (Kenney Bold, Kenney Future Narrow) by Kenney, https://kenney.nl
The font files declare Creative Commons Attribution-ShareAlike 3.0:
https://creativecommons.org/licenses/by-sa/3.0/`;

function licenceText(): string {
  const sections = LICENCE_SOURCES.map(
    ([title, path]) =>
      `${title}\n${"=".repeat(title.length)}\n\n${readFileSync(path, "utf8").trim()}`
  );
  sections.push(`Kenney Fonts\n============\n\n${KENNEY_FONTS_NOTICE}`);
  return `${sections.join("\n\n\n")}\n`;
}

/** Serves (dev) and emits (build) one plain-text file with the third-party licence notices. */
function licences(): Plugin {
  return {
    name: "licences",
    configureServer(server) {
      server.middlewares.use(`/${LICENCE_FILE}`, (_req, res) => {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end(licenceText());
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: LICENCE_FILE, source: licenceText() });
    },
  };
}

export default defineConfig({
  base: "./",

  publicDir: "game-assets",

  plugins: [licences()],

  // Vercel sets VERCEL=1 while building; analytics is only wired up there.
  define: {
    __VERCEL_BUILD__: JSON.stringify(process.env.VERCEL === "1"),
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2020",
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"],
          "matter-js": ["matter-js"],
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
  },

  server: {
    host: true,
    port: 3000,
    open: true,
    strictPort: false,
    hmr: {},
  },

  preview: {
    port: 4173,
    strictPort: true,
  },
});
