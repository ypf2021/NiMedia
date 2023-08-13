import { defineConfig, configDefaults } from "vitest/config";

// configDefaults是默认扩展项

export default defineConfig({
    test: {
        exclude: [...configDefaults.exclude, "packages/template/*"],
        include: [...configDefaults.include, "./test/*/**"],  // 匹配包含测试文件的 glob 规则。
        coverage: {
            reporter: ["text", "json", "html"],  // 配置要使用的测试覆盖率报告器
        },
    },
});