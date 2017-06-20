## Adaptive Resources & Components (ARC) plugin for Webpack

`arc-webpack` can be used for a client Webpack config, a server Webpack config, or both at the same time!

### Client bundling

1. You will need to have a list of the possible flag combinations your web app is catering to in order to generate the client-side bundles ahead of time:

```
const flagset = [
    [],
    ['mobile'],
    ['mobile', 'iphone'],
    ['mobile', 'android'],
    ['desktop']
];
```
2. Use `map` to create a client bundle for each combination, passing your client config this combination of flags:
```
flagset.map(flags => {
    configArr.push(clientConfig(...flags));
});

module.exports = configArr;
```
3. Add the ARC plugin at the resolve step. Make sure you also add the `.arc` extension so any template split component will properly find the correct template path for your bundle:
```
resolve: {
    plugins: [
        new arcWebpack.adaptFiles(flags)
    ],
    modules: ['node_modules', 'src', path.resolve(__dirname, 'src/components')],
    extensions: ['.js', '.json', '.arc']
},
```
4. Create an output path based on each combination by using ARC's `getOutputPath` function:
```
output: {
    path: arcWebpack.getOutputPath(__dirname, 'DIST', flags),
    filename: 'client.bundle.js',
},
```
### Server bundling

You only need one server bundle so no need to pass the flags mentioned above. 

1. Add a loader step to pass any `.arc` files to ARC's Webpack proxy loader:
```
module: {
    rules: [{
        test: /\.arc$/,
        loader: 'arc-webpack/proxy-loader',
        include: path.join(__dirname, 'src/components')
    }]
}
```

### Demo Webpack config using ARC:

[webpack.config.babel.js](https://github.com/fierysunset/arc-react-webpack-demo/blob/master/webpack.config.babel.js)
