<br />

<p align="center">
    <img src="images/logo.png" alt="Logo" width="156" height="156">
  <h2 align="center" style="font-weight: 600">EstherMusic</h2>

</p>

![Library][library-screenshot]

## ✨ 特性

- ✅ 使用 Vite + Vue 3 全家桶开发
- 🔴 网易云账号登录（手机/邮箱登录）
- 📺 支持 MV 播放
- 📃 支持歌词显示
- 📻 支持私人 FM / 每日推荐歌曲
- 🚫🤝 无任何社交功能
- 🌎️ 海外用户可直接播放（需要登录网易云账号）
- 🔐 支持 [UnblockNeteaseMusic](https://github.com/nondanee/UnblockNeteaseMusic)（[使用 revincx 修复的 npm 包](https://github.com/revincx/UnblockNeteaseMusic)），自动使用 QQ/酷狗/酷我音源替换变灰歌曲链接 （网页版不支持）
- ✔️ 每日自动签到（手机端和电脑端同时签到）
- 🌚 Light/Dark Mode 自动切换
- 👆 支持 Touch Bar
- ⌨️ 自定义快捷键和全局快捷键
- 🛠 更多特性开发中

## 👷‍♂️ 打包客户端

1. 打包 Electron 需要用到 Node.js 和 Yarn。可前往 [Node.js 官网](https://nodejs.org/zh-cn/) 下载安装包。安装 Node.js
   后可在终端里执行 `npm install -g yarn` 来安装 Yarn。
2. 使用 `git clone https://github.com/soratanmer/EstherMusic.git` 克隆本仓库到本地。
3. 使用 `yarn install` 安装项目依赖。
4. 复制 `/.env.example` 文件为 `/.env` 。
5. 使用 `yarn build` 打包项目 ，打包出来的文件在 `/release` 目录下。

## :computer: 配置开发环境

本项目使用 [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) ，以 NPM 包的形式集成在主进程内。

运行本项目

```shell
# 安装依赖
yarn

# 创建本地环境变量
cp .env.example .env

# 运行
yarn dev
```

只运行网页版则需要将 [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) 克隆至本地。

```shell
# 运行
yarn dev:vite
```

## 📜 开源许可

本项目仅供个人学习研究使用，禁止用于商业及非法用途。

基于 [MIT license](https://opensource.org/licenses/MIT) 许可进行开源。

## 原项目

[qier222/YesPlayMusic](https://github.com/qier222/YesPlayMusic)

## Vite + Electron

[ArcherGu/fast-vite-electron](https://github.com/ArcherGu/fast-vite-electron)

## 🖼️ 截图

![lyrics][lyrics-screenshot]
![library-dark][library-dark-screenshot]
![album][album-screenshot]
![home-2][home-2-screenshot]
![artist][artist-screenshot]
![search][search-screenshot]
![home][home-screenshot]
![explore][explore-screenshot]

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[album-screenshot]: images/album.png
[artist-screenshot]: images/artist.png
[explore-screenshot]: images/explore.png
[home-screenshot]: images/home.png
[home-2-screenshot]: images/home-2.png
[lyrics-screenshot]: images/lyrics.png
[library-screenshot]: images/library.png
[library-dark-screenshot]: images/library-dark.png
[search-screenshot]: images/search.png
