import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "/Play100/games/002-harbor-lost-found/",
  resolve: {
    alias: {
      "@play100/game-sdk": fileURLToPath(
        new URL("../../packages/game-sdk/src/index.ts", import.meta.url)
      )
    }
  },
  build: {
    outDir: "../../dist/games/002-harbor-lost-found",
    emptyOutDir: false
  }
});
