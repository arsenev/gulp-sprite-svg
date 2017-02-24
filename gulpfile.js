const site = '';

const paths = {

	// CSS
	cssSrc: [
		'less/main.less',
		'less/*.less',

		// less sprite.svg
		'tmp/less/**/*.less'
	],
	cssDest: 'css',

	// SVG
	svgSrc: 'svg/**/*.svg',
	svgDest: 'css',

	// HTML
	htmlSrc: 'index.html'
};

const gulp = require('gulp');
const gulpIf = require('gulp-if');
const debug = require('gulp-debug');
const sourcemaps = require('gulp-sourcemaps');
const less = require('gulp-less');
const gcmq = require('gulp-group-css-media-queries');
const concat = require('gulp-concat');
const insert = require('gulp-insert');
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');
const remember = require('gulp-remember');
const rename = require('gulp-rename');
const path = require('path');
const svgSprite = require('gulp-svg-sprite');

const browserSync = require('browser-sync').create();

const notify = require('gulp-notify');
const plumber = require('gulp-plumber');


/* CSS */
gulp.task('css:common', function () {
    return gulp.src(paths.cssSrc, {since: gulp.lastRun('css:common')})

		.pipe(plumber({
			errorHandler: notify.onError(function(err){
				return {
					title:'Ошибка CSS/LESS',
					message:err.message
				}
			})
		}))
		.pipe(less()) 
		.pipe(autoprefixer({browsers: ['last 2 versions']}))
		// .pipe(autoprefixer({browsers: [
		// 	'firefox > 10',
		// 	'safari > 5', 
		// 	'ie > 6', 
		// 	'opera > 10', 
		// 	'ios > 4', 
		// 	'android > 3'
		// ]}))
		.pipe(remember('css')) // (css) - имя кэша
		.pipe(concat('common.css'))
		.pipe(gcmq())
		.pipe(gulp.dest(paths.cssDest))
		.pipe(browserSync.stream())
		.pipe(cssmin())
		.pipe(rename({basename:'common', suffix: '.min'}))
		.pipe(gulp.dest(paths.cssDest))
		.pipe(browserSync.stream());
});

/* SVG */
gulp.task('sprite:svg', function () {
    
	return gulp.src(paths.svgSrc)
		.pipe(svgSprite({
			mode:{
				css:{
					dest: '.',				// default "css/"
					bust: false,			// hash "-df4d3s3a.svg"
					sprite: 'sprite.svg',	// name file
					layout: 'vertical',		
					// prefix: '$',			// stylus less sass default ".svg-"
					dimensions: true,		// объединяет css default "false"
					render:{
						less:{
							dest:'sprite.less'
						}
					}
				}
			}
		}))
		.pipe(gulpIf('*.less', 
			gulp.dest('tmp/less'), 
			gulp.dest(paths.svgDest)
		));
});



/* SERVER */
gulp.task('server', function(){
	browserSync.init({
		// proxy: site
		server: './'
	});

	// css + (svg)sprite.less
	gulp.watch([paths.cssSrc, 'tmp/less/sprite.less'], gulp.series('css:common')).on('unlink', function(filepath){
		remember.forget('css', path.resolve(filepath.replace(/(.*)(\..*)$/, '$1.css')));	
	});

	// svg
	gulp.watch(paths.svgSrc, gulp.series('sprite:svg'));

	// html
	gulp.watch(paths.htmlSrc).on('change', browserSync.reload);
});



/* START GULP CLIENT */
gulp.task(
	'default',
	gulp.series(
		'sprite:svg',
		'css:common',
		'server'
	)
);