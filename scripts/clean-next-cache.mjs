import { rm } from "node:fs/promises";

// 注意：不要在这里删除 .open-next —— OpenNext 构建过程中会先把编译产物
// 写入 .open-next/.build，再触发 next build（进而触发 prebuild -> clean），
// 此时删除 .open-next 会导致打包失败。OpenNext 自身会清理重建该目录。
const paths = [".next"];

await Promise.all(
  paths.map((path) =>
    rm(path, {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 100,
    }),
  ),
);
