const path = require('path');
const webpack = require('webpack');  // 引入的webpack,使用lodash
const HtmlWebpackPlugin = require('html-webpack-plugin');  // 将html打包
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin'); // 打包的css拆分,将一部分抽离出来
const extractCSS = new ExtractTextPlugin({
  disable: process.env.NODE_ENV == 'development' ? true : false,   // 开发环境直接内联,不抽离
  // filename: 'style/extractFromCss.css', // 单个entry时，可写死
  filename: 'style/[name].css', // 多entry时
  allChunks: true  //设置为true 异步文件抽离样式
})
const extractLESS = new ExtractTextPlugin({
  disable: process.env.NODE_ENV == 'development' ? true : false,   // 开发环境直接内联,不抽离
  filename: 'style/extractFromLess.css', // 单个entry时，可写死
  allChunks: true //设置为true
})
const HtmlWebpackPluginConfig = {
  title: "Hello World",
  filename: "index.html",
  template: "../src/index.html",
  minify: {
    collapseWhitespace: true, // 是否压缩空格
    removeAttributeQuotes: true, // 移除属性的引号
    removeComments: true // 删除注释
  },
  hash: true, // 加hash
  inject: true   // true | body | head | false  四种值,默认为true,true和body相同,是将js注入到body结束标签前,head将打包的js文件放在head结束前,false是不注入,这时得要手工在html中加js
}
module.exports = {
  mode: 'development',
  context: path.resolve(__dirname,'../src'),
  // 入口文件
  entry: '../src/main',
  // webpack如何输出
  output: {
    // 定位，输出文件的目标路径
    path: path.resolve(__dirname,'../dist/'),
    filename: './[hash]app.js',
    hashDigestLength: 8 // 默认长度是20
  },
  // 模块的相关配置
  module : {
    // 根据文件的后缀提供一个loader,解析规则
    rules: [
      {
        test: /\.html$/,
        use: ['html-withimg-loader']
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        include: [path.resolve(__dirname, '../src/')],
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024,
              fallback: 'file-loader',  // 8k以上，用file-loader抽离（非必须，默认就是file-loader）
              name: '[name].[ext]',  // 最后生成的文件名时 outputPath + name,[name],[ext],[path]表示原来的文件名字,扩展名,路径
              // userRelativePath: true   是否使用相对路径
              outputPath:'img/', // 8k以下的base64内联，不产生图片文件
              //publicPath: '../src/img/'  // 可访问到图片的引用路径(相对/绝对)
            }
          },
          // {
          //   // 压缩图片
          //   loader:'img-loader',
          //   options:{
          //     pngquant:{ // png图片适用
          //       quality: 80
          //     }
          //   }
          // }
        ]
      },
      {
        test: /\.css$/,
        use: extractCSS.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.less$/,
        use: extractLESS.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'less-loader']
        })
      }
    ],
  },
  // 解析模块的可选项
  resolve: {
    // modules: []  // 模块的查找目录,配置其他的css等文件
    // 用到文件的扩展名
    extensions: [".js",".json",".jsx",".less",".css"],
    // 模块别名列表
    alias: {
      "@": path.resolve(__dirname,'../src')
    }
  },
  // 插件的引进,压缩,分离,美化
  plugins: [
    new HtmlWebpackPlugin(HtmlWebpackPluginConfig),
    new UglifyJsPlugin(),
    // new CopyWebpackPlugin([{
    //   from: './img',
    //   to: '../bundle/images'
    // }]),
    extractCSS,
    extractLESS,
    // 引用框架 jquery,lodash 工具库是很多组件会复用的,省去了import
    new webpack.ProvidePlugin({
      // '_': 'lodash'   // 引用webpack
    }),
    new CleanWebpackPlugin()
  ],
  // 服务于webpack-dev-server 内部封装了一个express
  devServer: {
    contentBase: path.join(__dirname,"../dist"),
    port: 9000,   // 端口号
    host:'192.168.0.23',  // 如果指定post,这样同局域网的电脑或手机可以访问网站,host的值在dos下使用ipconfig获取
    open: true,   // 自动打开浏览器
    index: "index.html",
    inline: true,   // 默认为true,意思是在打包会注入一段代码到最后的js文件中,用来监视页面的改动而自动刷新页面,当为false时,网页自动刷新的模式时iframe,也就是将模板也放在一个frame中
    hot: false,
    publicPath: '/',  // 它与output.publicPath的值应该是一样的,值为上面contentBase目录的子目录,是放js,css,图片的资源的文件夹,记得打包时,将图片等拷贝或打包到该文件下
    compress: true, // 压缩
    overlay: true,
    stats: "errors-only",
    before(app){
      app.get('/api/test.json',function (req,res){
        res.json({
          code: 200,
          message: 'Hello World'
        })
      })
    }
  },
  watch: true,
  devtool: "source-map"
}