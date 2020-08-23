var path = require('path');

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  publicPath: './',
  runtimeCompiler: false, // 是否使用包含运行时编译器的 Vue 构建版本，尽量配置为false，否则会使得包增加10kb
  devServer: {
    hot: true,
    proxy: {
      '/': {
        // target:'http://10.170.10.11:18808',
        target:'http://10.101.15.221:18808',
        ws: false, // proxy websockets
        changeOrigin: true  // needed for virtual hosted sites
      }
    }
  },
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          blue: '#1143cc',
          green: '#21C491',
          red: '#f56c6c',
          'text-color': '#606266'
        }
      }
    }
  },
  configureWebpack: {//webpack配置扩展
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src'))
  },
  

}