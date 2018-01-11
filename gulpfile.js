'use strict';

/**
 * @type {Gulp}
 */
var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var jsdoc = require('gulp-jsdoc3');
var del = require('del');
var config = require('./gulp.json');
var docConfig = require('./jsdoc.json');
var pluginConfig = require('./plugin.json');

var APP_CLASS_PATH = './node_modules/equivalent-js/src';
var APP_STYLE_PATH = '';
var LIB_CLASS_PATH = './node_modules/equivalent-js/src';

var SASS_INCLUDE_PATHS = [
    'node_modules'
];


/**
 * @param {Object} cfg
 * @param {(null|Object|function)=} builder
 * @param {string=} base
 * @returns {Gulp}
 */
function build(cfg, builder, base) {
    builder = builder || null;
    base = base || '';

    var wrap = gulp.src(cfg.src, {base: base});

    if (null !== builder) {
        wrap.pipe(plumber())
                .pipe(sourcemaps.init())
                    .pipe(builder)
                .pipe(sourcemaps.write())
            .pipe(plumber.stop());
    }

    wrap.pipe(gulp.dest(cfg.dest));

    return wrap;
}

/**
 * @param {Object} cfg
 * @param {(null|Object|function)=} builder
 * @param {string=} base
 * @returns {Gulp}
 */
function buildConcat(cfg, builder, base) {
    builder = builder || null;
    base = base || '';

    return gulp.src(cfg.src)
            .pipe(plumber())
                .pipe(sourcemaps.init())
                    .pipe(concat(cfg.name))
                    .pipe(builder)
                .pipe(sourcemaps.write())
            .pipe(plumber.stop())
        .pipe(gulp.dest(cfg.dest));
}

/**
 * @param {{config: string, classes: Object, tests: Object, styles: Object, templates: Object}} cfg
 */
function install(cfg) {
    var installScripts = function (src, dest, base) {
        return gulp.src(src, {base: base})
                .pipe(plumber())
                    .pipe(sourcemaps.init())
                        .pipe(uglify())
                    .pipe(sourcemaps.write())
                .pipe(plumber.stop())
            .pipe(gulp.dest(dest));
    };

    var installConfigs = function (src, dest) {
        return gulp.src(src)
            .pipe(gulp.dest(dest));
    };

    var installStyles = function (src, dest) {
        return gulp.src(src)
                .pipe(plumber())
                    .pipe(sourcemaps.init())
                        .pipe(sass({includePaths: SASS_INCLUDE_PATHS, outputStyle: 'compressed'}))
                    .pipe(sourcemaps.write())
                .pipe(plumber.stop())
            .pipe(gulp.dest(dest));
    };

    var installTemplates = function (src, dest) {
        return gulp.src(src)
            .pipe(gulp.dest(dest));
    };

    if (cfg.hasOwnProperty('config') &&
        typeof cfg.config === 'string' &&
        typeof cfg.classes.dest === 'string'
    ) {
        var pluginPath = '',
            pluginBaseDir = ''
        ;

        if ('plugin.json' === cfg.config) {
            pluginPath = '/' + pluginConfig.name;
            pluginBaseDir = '.';
        }

        if (0 < cfg.config.length) {
            installConfigs(cfg.config, cfg.classes.dest + pluginPath);

            if (0 < cfg.classes.src.length) {
                installScripts(cfg.classes.src, cfg.classes.dest + pluginPath, pluginBaseDir);
            }

            if (0 < cfg.tests.src.length) {
                installScripts(cfg.tests.src, cfg.tests.dest + pluginPath, pluginBaseDir);
            }

            if (0 < cfg.styles.src.length) {
                if ('' !== pluginPath) {
                    pluginPath += '/' + pluginConfig.classPath;
                }

                installStyles(cfg.styles.src, cfg.styles.dest + pluginPath);
            }

            if (0 < cfg.templates.src.length) {
                if ('' !== pluginPath) {
                    pluginPath += '/' + pluginConfig.classPath;
                }

                installTemplates(cfg.templates.src, cfg.templates.dest + pluginPath);
            }
        }
    }
}

/**
 * @param {Object} cfg
 * @returns {Gulp}
 */
function buildVendors(cfg) {
    return gulp.src(cfg.src)
            .pipe(plumber())
                .pipe(concat(cfg.name))
            .pipe(plumber.stop())
        .pipe(gulp.dest(cfg.dest));
}

/**
 * @param {Object} cfg
 * @param {function} callback
 * @returns {Gulp}
 */
function buildDocs(cfg, callback) {
    return gulp.src(cfg.src, {read: false})
        .pipe(jsdoc(docConfig, callback));
}

/**
 * @param {Object} cfg
 * @returns {Gulp}
 */
function buildTestUnit(cfg) {
    return build(cfg);
}

/**
 * @param {Object} cfg
 * @returns {Gulp}
 */
function buildTests(cfg) {
    return build(cfg, null, APP_CLASS_PATH);
}

/**
 * @param {Object} cfg
 * @returns {Gulp}
 */
function buildConfigs(cfg) {
    return build(cfg);
}

/**
 * @param {{config: string, classes: Object, tests: Object, styles: Object, templates: Object}} cfg
 * @returns {Gulp}
 */
function buildPlugins(cfg) {
    install(cfg);
}

/**
 * @param {Object} cfg
 * @returns {Gulp}
 */
function buildApps(cfg) {
    return build(cfg, uglify(), APP_CLASS_PATH);
}

/**
 * @param {Object} cfg
 * @returns {Gulp}
 */
function buildConcatApps(cfg) {
    return buildConcat(cfg, uglify());
}

/**
 * @param {Object} cfg
 * @returns {Gulp}
 */
function buildScripts(cfg) {
    return build(cfg, uglify(), LIB_CLASS_PATH);
}

/**
 * @param {Object} cfg
 * @returns {Gulp}
 */
function buildConcatScripts(cfg) {
    return buildConcat(cfg, uglify(), LIB_CLASS_PATH);
}

/**
 * @param {Object} cfg
 * @returns {Gulp}
 */
function buildStyles(cfg) {
    return gulp.src(cfg.src, {base: APP_STYLE_PATH})
            .pipe(plumber())
                .pipe(sourcemaps.init())
                    .pipe(sass({includePaths: SASS_INCLUDE_PATHS, outputStyle: 'compressed'}))
                .pipe(sourcemaps.write())
            .pipe(plumber.stop())
        .pipe(gulp.dest(cfg.dest));
}


/* dev */
gulp.task('dev:scripts', function() {
    del(['web/js/lib/*.js', 'web/js/lib/**/*.js']).then(function () {
        del(['web/js/config/*.json']).then(function () {
            buildVendors(config.vendors);
            buildTestUnit(config.testunit);
            buildConfigs(config.configs);
            buildPlugins(config.plugins);
            buildScripts(config.scripts);
        });
    });
});

gulp.task('dev:plugin', function() {
    del(['web/js/lib/equivalent/Plugin/*.js', 'web/js/lib/equivalent/Plugin/**/*.js']).then(function () {
        buildPlugins(config.pluginDev);
    });
});

gulp.task('dev:apps', function() {
    del(['web/js/app/*.js', 'web/js/app/**/*.js']).then(function () {
        buildApps(config.apps);
    });
});

gulp.task('dev:tests', function() {
    del(['web/js/test/*.js', 'web/js/test/**/*.js']).then(function () {
        buildTests(config.tests);
    });
});

gulp.task('dev:styles', function() {
    del(['web/css/*.css', 'web/css/**/*.css']).then(function () {
        buildStyles(config.styles);
    });
});

gulp.task('dev:docs', function (callback) {
    del(['web/doc/**']).then(function () {
        buildDocs(config.docs, callback);
    });
});


/* dev watch */
gulp.task('dev:watch:scripts', function() {
    return watch(config.scripts.src, function () {
        del(['web/js/lib/*.js', 'web/js/lib/**/*.js']).then(function () {
            del(['web/js/config/*.json']).then(function () {
                buildConfigs(config.configs);
                buildPlugins(config.plugins);
                buildScripts(config.scripts);
            });
        });
    });
});

gulp.task('dev:watch:plugin', function() {
    return watch(config.pluginDev.classes.src, function () {
        del(['web/js/lib/equivalent/Plugin/*.js', 'web/js/lib/equivalent/Plugin/**/*.js']).then(function () {
            buildPlugins(config.pluginDev);
        });
    });
});

gulp.task('dev:watch:apps', function() {
    return watch(config.apps.src, function () {
        del(['web/js/app/*.js', 'web/js/app/**/*.js']).then(function () {
            buildApps(config.apps);
        });
    });
});

gulp.task('dev:watch:tests', function() {
    return watch(config.tests.src, function () {
        del(['web/js/test/*.js', 'web/js/test/**/*.js']).then(function () {
            buildTests(config.tests);
        });
    });
});

gulp.task('dev:watch:styles', function() {
    return watch(config.styles.src, function () {
        del(['web/css/*.css', 'web/css/**/*.css']).then(function () {
            buildStyles(config.styles);
        });
    });
});

gulp.task('dev:watch:docs:scripts', function() {
    return watch(config.scripts.src, function (callback) {
        del(['web/doc/**']).then(function () {
            buildDocs(config.docs, callback);
        });
    });
});

gulp.task('dev:watch:docs:apps', function() {
    return watch(config.apps.src, function (callback) {
        del(['web/doc/**']).then(function() {
            buildDocs(config.docs, callback);
        });
    });
});


/* prod */
gulp.task('prod:build', function() {
    del(['web/js/lib/equivalent.min.js', 'web/js/app/**/*.js']).then(function () {
        del(['web/js/config/*.json']).then(function () {
            buildVendors(config.vendors);
            buildConfigs(config.configs);
            buildPlugins(config.plugins);
            buildPlugins(config.pluginDev);
            buildConcatScripts(config.minify);
            buildConcatApps(config.minifyApps);
            buildStyles(config.styles);
        });
    });
});


/* init commands "dev", "dev:watch", "prod:minify" */
gulp.task('dev', [
    'dev:scripts',
    'dev:plugin',
    'dev:apps',
    'dev:tests',
    'dev:styles',
    'dev:docs'
]);

gulp.task('dev:watch', [
    'dev',
    'dev:watch:scripts',
    'dev:watch:plugin',
    'dev:watch:apps',
    'dev:watch:tests',
    'dev:watch:styles',
    'dev:watch:docs:scripts',
    'dev:watch:docs:apps'
]);

gulp.task('prod:minify', [
    'prod:build'
]);
