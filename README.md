# @formily/template

> Formily 桥接组件库生态脚手架

## 安装

```bash
npm install --g @formily/template
```

## 初始化

先 cd 到你需要初始化的项目目录，执行以下命令

```bash
formily-tpl init
```

## 构建

```bash
formily-tpl build
```

## 构建配置

在包根路径上创建，builder.config.ts 文件

```ts
import { IBuilderConfig } from '@formily/template'

export const BuilderConfig: IBuilderConfig = {
  externals: {},
  //当前仓库核心依赖的三方组件库名称
  targetLibName: 'antd',
  //核心三方库cjs目录名
  targetLibCjsDir: 'lib',
  //核心三方库es目录名
  targetLibEsDir: 'es',
  //是否打包全量类型文件
  bundleDts: false,
}
```
