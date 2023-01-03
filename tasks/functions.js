
var grunt= require('grunt');


const defaultSyncOptions= {
    domain:'',
    user:'',
    appPassword:'',
    postType:'page',
    restRoute: '/wp-json/wp/v2',
    preUploadTasks: [],
    createBackup: true,
    timeout: 5000,
    overwriteExisting: false,
};


module.exports={
    wpContentSync,
    wpContentUpload,
    getAxiosInstance,
    writeInitialFile,
    defaultSyncOptions
};



function writeInitialFile(connection, config, options){

    const { overwriteExisting, createBackup, restRoute, postType} =options;
    const {postId, filename} =config;

    let promise = connection.get(`${restRoute}/${postType}/${postId}?context=edit`).then(function(resp) {

        let content = resp.data.content.raw;
        //write file
        if ( !grunt.file.exists(filename) || overwriteExisting ) {
            grunt.file.write(filename, content);
        }

        if ( createBackup ) {
            grunt.file.write(filename + '.bak', content);
        }

        return resp;

    }).catch(function(error) {
        console.log(error.config.baseURL+error.config.url+" unable to connect");
        return error
    });

    return promise;
}

function wpContentSync(){

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options(defaultSyncOptions);

    var config = grunt.task.current.data
    let target= grunt.task.current.target

    let {
        preUploadTasks,
    } = options;

    let {
        postId,
        filename
    } = config;


    //let grunt know this is an async task
    let gruntDone=this.async();
    //pull post

    let connection = getAxiosInstance(config, options);
    writeInitialFile(connection, config, options).then((resp)=>{

        if(resp.status !== 200 ){
            gruntDone(true);
            return;
        } else{

            let preSyncTasks = preUploadTasks.map(task => `${task}:${filename}`);


            //TODO: figure out a watch alternative for the wp-content-upload hard coded data
            //config the watch task
            grunt.config.set('watch.' + postId, {
                files: [filename],
                tasks: [...preSyncTasks, `wp-content-upload:${target}`],
                options: {
                    spawn: true
                }
            });

            grunt.task.run(['watch:' + postId]);
            gruntDone(true);
        }
    })

    }

    function getAxiosInstance(config,options) {
        const {timeout, user, appPassword, domain}= options;
        const axios = require('axios');
        let auth = Buffer.from(`${user}:${appPassword}`).toString("base64");
        return axios.create({
            baseURL: domain,
            timeout: timeout,
            headers: {
                "Authorization": `Basic ${auth}`
            }
        });
    }

    function wpContentUpload(target) {

        var syncConfig = grunt.config('wp_content_sync')[target];

        var syncOptions = { ...defaultSyncOptions, ...grunt.config('wp_content_sync').options, ...syncConfig.options}

        let {
            postId,
            filename
        } = syncConfig;

        let {domain, restRoute, postType}=syncOptions;


        let connection = getAxiosInstance(syncConfig, syncOptions);
        let content = grunt.file.read(filename);

        return connection.put(`${restRoute}/${postType}/${postId}`, {
            content: content
        }).then(resp => {
            return resp;
        }).catch(error => {
            console.log(`${filename} unable to write to ${domain}${restRoute}/${postType}/${postId}`);
            return error;
        });
    }
