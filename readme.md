# web-skeleton简介

一套用于webapp项目开发的骨架方案．

## 背景

现阶段的项目通常是一个项目包含了多个子项目，这些子项目往往对应于某个业务块，随着业务块的增多，代码规模也会越来越大．

如果使用常规的开发打包部署方式来管理项目可能在耗时和配置维护上都会变得越来越复杂．

为了适应现阶段的项目特点，我们的解决方案需要兼顾到以下这些需求：
* 能够支持构建打包的管理使用通用逻辑来进行,减少针对不同子项目的维护成本；
* 尽量做到在减少项目构建时间的同时，增加代码增添修改的灵活性；
* 需要考虑支持各子项目间的代码重用共享，需要做好第三方依赖的管理；
* 项目结构需清晰，以便快速定位不同职责的代码；

## Dependencies

The dependencies are:
* [Node.js](http://nodejs.org)
* [Ruby](https://www.ruby-lang.org/)
* [gulp.js](http://gulpjs.com)
* [Sass](http://sass-lang.com/install)

### Node

Bring up a terminal and type `node --version`.
If Node responds with a version at or above v0.10.x then check for a [Ruby](#ruby) installation.
If you require Node, go to [nodejs.org](http://nodejs.org/) and click on the big green Install button.

### Ruby

Bring up a terminal and type `ruby --version`.
If Ruby responds with a version number at or above 1.8.7 then type `gem --version`.
If you don't see any errors then you may proceed looking for [Sass](#sass).
If you require Ruby, it can be installed from the [Ruby downloads](https://www.ruby-lang.org/en/downloads/) page.

### Sass

Make sure you have [Ruby](#ruby) installed before proceeding.
Bring up a terminal and type `sass --version`.
If Sass is installed it should return a version number at or above 3.3.x.
If you don't see any errors, proceed to check for [gulp](#gulp).
If you need to install Sass, see the command-line instructions on the [Sass installation](http://sass-lang.com/install) page.

### Gulp

Bring up a terminal and type `gulp --version`.
If Gulp is installed it should return a version number at or above 3.5.x.
If you need to install Gulp, open up a terminal and type in the following:

```sh
$ npm install --global gulp
```

This will install Gulp globally. Depending on your user account, you may need to gain elevated permissions using `sudo` (i.e `sudo npm install --global gulp`). Next, install the local dependencies Web Starter Kit requires:

```sh
$ sudo npm install
```

That's it! You should now have everything needed to use this skeleton.

## 目录结构
```
├── [gulp]                         \\gulp task scripts
│   ├── [tasks]
│   └── config.json
├── gulpfile.js
├── readme.md
├── package.json
├── [ansible]                       \\ [submodule] used with gitlab runner
├── [app]
│   ├── [routes]
│   │   ├── [api]                   \\ handle xhr request
│   │   └── [feature1]              \\ handle page rendering request
│   ├── [common]                    \\ [submodule] shared toolkit for server and frontend
|   ├── [config]                    \\ configurations
│   ├── [lib]                       \\ shared dependencies(submodules)
│   │   └── [submodule1]
│   │   ├── [feature1]
│   │   └── [utils]
│   ├── [views]
│   │   ├── layout.html
│   │   └── [feature1]
│   ├── [boot]                      \\app booting scripts
│   │   ├── parse.js
│   │   ├── route.js
│   │   ├── session.js
│   │   └── init.js
│   ├── app.js
│   ├── package.json
│   ├── boot.yml                    \\app booting configuration
│   ├── [models]                    \\retrieve data, provide data
│   │   └── [feature1]
│   ├── [common]                    \\code shared by server and client
│   ├── [public]                    \\static assets
│   │   ├── [fonts]
│   │   ├── [images]
│   │   ├── [scripts]               \\client javascripts
│   │   │   ├── [feature1]
│   │   │   └── [components]
│   │   └── [scss]                  \\common style code
│   │       ├── [hl-ui]
│   │       └── [feature1]
│   └── [bin]
│       └── www                     \\start command
└── [dist]                          \\artifacts for deployment
```

## Submodule Dependencies

### [HappyLucky-UI](https://github.com/fatsheepcn/HappyLucky-UI)
  共用的ui组建库
### [h5/universal](http://gitlab.huolih5.com/h5/universal)
  前后端共用的代码，包括基础的js工具类代码（类型判断，数据操作，方法操作等），不允许有依赖node或者是浏览器环境的代码
### [h5/ansible-deploy](http://gitlab.huolih5.com/h5/ansible-deploy)
  Ansible playbook used with gitlab runner.

## Homebrew的支撑性模块列表

### [express-app-boot](https://www.npmjs.com/package/express-app-boot)

### [express-routes-loader](https://www.npmjs.com/package/express-routes-loader)

### [express-module-serv](https://www.npmjs.com/package/express-module-serv)

### [express-bunyan-logger2](https://www.npmjs.com/package/express-bunyan-logger2)

### [gulp-embed2](https://www.npmjs.com/package/gulp-embed2)

### [gulp-load-dir](https://www.npmjs.com/package/gulp-load-dir)

### [gulp-css-class-prefix](https://www.npmjs.com/package/gulp-css-class-prefix)

### [m-react](https://github.com/ybybzj/m-react)

## Getting Started

*    克隆项目代码

    * clone skeleton框架项目

    ```
    git clone ssh://git@gitlab.huolih5.com:6022/hangban/web-jipiao.git {{APP_NAME}}
    ```

    * 初始化子模块

    ```
    cd {{APP_NAME}}
    git submodule init
    git submodule update
    ```

    tips: Change the URI (URL) for a remote Git repository

    ```
    git remote set-url origin git://new.url.here
    ```

    tips: 如何添加子模块

    运行下面的命令，添加git submodule

    ```
    git submodule add ssh://git@gitlab.huolih5.com:6022/h5/universal.git app/common
    git submodule add https://github.com/fatsheepcn/HappyLucky-UI.git app/public/styles/hl-ui
    git submodule add ssh://git@gitlab.huolih5.com:6022/h5/ansible-deploy.git ansible
    ```

*    安装npm依赖

    推荐使用yarn进行npm包管理

    [如何安装yarn](https://yarnpkg.com/en/docs/install)

    ```
    yarn install
    ```

*    启动项目

    运行下面的命令，启动项目

    ```
    gulp serve
    ```

    tips: gulp任务序列中的`install`任务比较耗时，同样可以使用`yarn install`来安装

    ```
    cd app
    yarn install
    ```
