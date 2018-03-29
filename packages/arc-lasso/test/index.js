let fs = require('fs');
let path = require('path');
let lasso = require('lasso');
let expect = require('chai').expect;
let outputDir = path.join(__dirname, '..', '.cache', 'static');
let plugin = require('../index');

describe('arc-lasso', () => {
    let bundler = lasso.create({
        bundlingEnabled: true,
        fingerprintsEnabled: false,
        plugins: [plugin],
        outputDir
    });

    it('should work for non-adapted styles', async () => {
        let result = await bundler.lassoPage({
            name: 'style',
            dependencies: [
                require.resolve('./fixture/style.css')
            ]
        });

        let contents = fs.readFileSync(path.join(outputDir, 'style.css'), 'utf-8');
        expect(contents).to.contain('red');
        expect(contents).to.not.contain('blue');
    });

    it('should work for adapted styles', async () => {
        let result = await bundler.lassoPage({
            name: 'style',
            flags: ['adapted'],
            dependencies: [
                require.resolve('./fixture/style.css')
            ]
        });

        let contents = fs.readFileSync(path.join(outputDir, 'style.css'), 'utf-8');
        expect(contents).to.contain('blue');
        expect(contents).to.not.contain('red');
    });

    it('should work for non-adapted scripts', async () => {
        let result = await bundler.lassoPage({
            name: 'script',
            dependencies: [{
                type: 'require',
                path: require.resolve('./fixture/index.js')
            }]
        });

        let contents = fs.readFileSync(path.join(outputDir, 'script.js'), 'utf-8');
        expect(contents).to.contain('123');
        expect(contents).to.not.contain('456');
    });

    it('should work for adapted scripts', async () => {
        let result = await bundler.lassoPage({
            name: 'script',
            flags: ['adapted'],
            dependencies: [{
                type: 'require',
                path: require.resolve('./fixture/index.js')
            }]
        });

        let contents = fs.readFileSync(path.join(outputDir, 'script.js'), 'utf-8');
        expect(contents).to.contain('456');
        expect(contents).to.not.contain('123');
    })
})