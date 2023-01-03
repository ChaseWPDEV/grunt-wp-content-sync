# grunt-wp-content-sync

> The anti-page-builder. Synchronizes updates to a local HTML file with your post content on a WordPress site, using the REST API and Application Passwords (now in core).

## Getting Started
This plugin requires Grunt `~1.3.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-wp-content-sync --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-wp-content-sync');
```

## The "wp_content_sync" task

### Overview
In your project's Gruntfile, add a section named `wp_content_sync` to the data object passed into `grunt.initConfig()`.

This plugin uses grunt-contrib-watch as its backbone to watch the synchronized file and fire PUT REST requests to your WordPress site on changes to that file.

To run multiple syncs at once, `grunt-concurrent` is recommended.

### Settings
Each target requires two basis settings to set up the sync.

#### postID
The post ID on your site that you want to sync with/edit.

#### filename
The name of the file that you want to sync your post content with.

### Required options
There are three options that must be set. These can either be set at the task level, or at the target level. Target level options will override the task level options.

#### domain
The scheme and domain that you want to establish a connection with. https is STRONGLY recommended to prevent Man-in-the-Middle attacks with Basic Auth. But it's note required, as we're all consenting adults.

#### user
The username you want to connect to your WordPress site with. The user needs to have write access for the post(s) you are trying to sync with.

#### appPassword
The application password. Issued to your user on the wp-admin/user.php screen. (In Wordpress core as of version 5.6)

Example (task level options):
```js
grunt.initConfig({
  wp_content_sync: {
    options: {
      domain:"https://example-domain.com"
      user: "userName",
      appPassword: "AppPassword"
    },
    your_target: {
      postId: 123,
      filename: "localContent.html"
    },
  },
});
```

Example (target level options)
```js
wp_content_sync: {
  your_target: {
    options: {
          domain:"https://example-domain.com"
          user: "userName",
          appPassword: "AppPassword"
    },
    postId: 123,
    filename: "localContent.html"
  },
},
```

###Additional Options

#### options.postType
Type: `String`
Default value: `page`

The post type you want to sync/edit on your site.

#### options.restRoute
Type: `String`
Default value: `/wp-json/wp/v2`

The route to rest endpoints on your site.

#### options.createBackup
Type: `Boolean`
Default value: `true`

Whether to create a duplicate file with .bak appended to the filename on the initial sync.

#### options.timeout
Type: `Integer`
Default value: `5000`

Timeout (in milliseconds) for the REST requests.

#### options.overwriteExisting
Type: `Boolean`
Default value: false

If set to true and the target's filename already exists, the contents of that file will be overwritten on the initial sync.

### Usage Examples

In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js

```



## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
