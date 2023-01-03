'use strict';

var grunt = require('grunt');

require('mocha-sinon');

const expect = require('chai').expect;
const nock = require('nock');

const testDomain = 'https://testingUrl.local'
const restRoute = '/wp-json/wp/v2'

const {
    getAxiosInstance,
    writeInitialFile,
    defaultSyncOptions,
    wpContentUpload
} = require('../tasks/functions.js');

const config = {
    postId: 1,
    filename: 'testPost.html'
};


let testOptions={...defaultSyncOptions,
    domain: testDomain,
    user: 'user',
    appPassword: 'appPassword',
 }


function setUpNock() {
    nock(testDomain)
        .get(restRoute + '/page/1?context=edit')
        .reply(200, {
            content: {
                raw: "Hello Page World!"
            }
        });
}



describe('Grunt Task', function() {
    it('Exists', () => {
        require('../Gruntfile.js')(grunt);
        expect(grunt.task.exists('wp_content_sync')).to.be.true;
        expect(grunt.task.exists('watch')).to.be.true;
    });
});

describe('Connects and Write Writes and Watches', function() {
    beforeEach(function() {
        setUpNock();
        if (null == this.sinon) {
            this.sinon = sinon.sandbox.create();
        } else {
            this.sinon.restore();
        }
        this.sinon.stub(console, 'log');
    });


    it('Fails descriptively if bad url is given', function(done) {

        let connection = getAxiosInstance(config, {
            ...testOptions,
            timeout: 100,
            domain: 'http://bogusdomains.local'
        });

        writeInitialFile(connection, config, testOptions).then((res) => {
            expect(res.status).to.not.equal(200);
            expect(console.log.calledOnce).to.be.true;
            done();
        })
    });


    it('Connection and File Writing', (done) => {

        let connection = getAxiosInstance(config, testOptions);

        writeInitialFile(connection, config, testOptions).then(() => {

            expect(grunt.file.exists(config.filename)).to.be.true;
            let html = grunt.file.read(config.filename);
            expect(html).to.equal("Hello Page World!");

            expect(grunt.file.exists(config.filename + '.bak')).to.be.true;
            let bakHtml = grunt.file.read(config.filename + '.bak')
            expect(bakHtml).to.equal(html);
            grunt.file.delete(config.filename);
            grunt.file.delete(config.filename + '.bak');
        }).then(() => {
            done()
        });
    });

});

describe('Update remote post', () => {

    beforeEach(() => {
        let auth = Buffer.from(`${testOptions.user}:${testOptions.appPassword}`).toString("base64");
        nock(testDomain, {
                reqheaders: {
                    "Authorization": `Basic ${auth}`
                }
            })
            .put(restRoute + '/page/1')
            .reply(200, {
                content: {
                    raw: "Hello Page World!"
                }
            });
    });

    it('Fires a PUT command for upload', (done) => {
        let filename = 'putFile.html'


        let target = "mySweetConfigTarget"
        grunt.config.set(`wp_content_sync.${target}`, {
            ...config,
            filename: filename
        });

        grunt.config.set(`wp_content_sync.options`, testOptions)

        grunt.file.write(filename, "Editted File");
        wpContentUpload(target).then((res) => {
            grunt.file.delete(filename)
            expect(res.status).to.equal(200)
            done();
        })
    });

    it('Fails descriptively if unable to connect', function(done) {
        if (null == this.sinon) {
            this.sinon = sinon.sandbox.create();
        } else {
            this.sinon.restore();
        }
        this.sinon.stub(console, 'log');

        let filename = 'FailureFile.html';
        grunt.file.write(filename, "I'm a failure!");

        let failConfig = {
            ...config,
            filename: filename
        };

        let target = "bogusTarget";
        grunt.config.set('wp_content_sync.' + target, failConfig);
        grunt.config.set('wp_content_sync.options', {...testOptions, appPassword: 'BadPassword'})

        wpContentUpload(target).then((res) => {
            grunt.file.delete(filename);
            expect(res.status).to.not.equal(200);
            expect(console.log.calledOnce).to.be.true;
            done();
        })

    })

});


describe('Options', function() {
    beforeEach(() => {
        setUpNock();
    });

    it('Writes html.bak based on the createBackup option', function(done) {
        let options = {
            ...testOptions,
            createBackup: false
        };
        let connection = getAxiosInstance(config, options);
        let filename = 'bakTest.html'

        writeInitialFile(connection, {
            ...config,
            filename: filename
        }, options).then(() => {
            expect(grunt.file.exists(filename)).to.be.true;
            grunt.file.delete(filename);
            expect(grunt.file.exists(filename + '.bak')).to.be.false;
        }).then(() => {
            done()
        });
    });

    it('Does not Overwrite the file by default', function(done) {
        let filename = 'overwrittTest.html';

        grunt.file.write(filename, "Party");

        let connection = getAxiosInstance(config, testOptions);
        writeInitialFile(connection, {
            ...config,
            filename: filename
        }, testOptions).then(function() {
            expect(grunt.file.read(filename)).to.equal("Party");
            grunt.file.delete(filename);
            grunt.file.delete(filename+'.bak');
            done();
        });
    });

    it('Overwrites the file with option', function(done) {
        let filename = 'overwritfTest.html';
        grunt.file.write(filename, "Party");
        let connection = getAxiosInstance(config, testOptions);

        writeInitialFile(connection, {
            ...config,
            filename: filename
        }, {
            ...testOptions,
            overwriteExisting: true
        }).then(function() {
            expect(grunt.file.read(filename)).to.not.equal("Party");
            grunt.file.delete(filename);
            grunt.file.delete(filename+'.bak');
            done();
        });
    });

});
