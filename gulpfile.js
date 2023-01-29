let fileswatch = 'html,htm,txt,json,md,woff2' // List of files extensions for watching & hard reload
const { src, dest, parallel, series, watch } = require('gulp')
const browserSync  = require('browser-sync').create()
const webpack      = require('webpack-stream')
const babel        = require('gulp-babel')
const uglify       = require('gulp-uglify')
const sass         = require('gulp-sass')
const concat       = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer')
const imagemin     = require('gulp-imagemin')
const newer        = require('gulp-newer')
const rsync        = require('gulp-rsync')
const del          = require('del')

function browsersync() {
	browserSync.init({
		server: { baseDir: 'app/' },
		notify: false,
		online: true
	})
}

function scripts() {
	return src([
		'app/js/parts/*',  // Always at the end
		'app/js/parts/main.js',  // Always at the end
	])
		.pipe(concat('app.min.js'))
		.pipe(dest('app/js'))
		.pipe(browserSync.stream())
}

function styles() {
	return src('app/scss/main.scss')
		.pipe(sass({ outputStyle: 'compressed' }))
		.pipe(concat('app.min.css'))
		.pipe(autoprefixer({ overrideBrowserslist: ['> 1%'], grid: true }))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream())
}
function images() {
	return src('app/img/src/**/*')
		.pipe(newer('app/img/dest'))
		.pipe(imagemin())
		.pipe(dest('app/img/dest'))
}

function cleanimg() {
	return del('app/img/dest/**/*', { force: true })
}
function deploy() {
	return src('app/')
		.pipe(rsync({
			root: 'app/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			include: [/* '*.htaccess' */], // Included files to deploy,
			exclude: [ '**/Thumbs.db', '**/*.DS_Store' ],
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		}))
}

function startwatch() {
	watch('app/scss/**/*', { usePolling: true }, styles)
	watch(['app/js/**/*.js', '!app/js/**/*.min.js'], { usePolling: true }, scripts)
	watch('app/img/src/**/*.{jpg,jpeg,png,webp,svg,gif}', { usePolling: true }, images)
	watch('app/**/*.{' + fileswatch + '}', { usePolling: true }).on('change', browserSync.reload)
}


function buildHtml() {
	return src('app/*.html',).pipe(dest('dist'))

};
function buildCss() {
	return src('app/css/app.min.css').pipe(dest('dist/css'))
};
function buildJs() {
	return src('app/js/app.min.js').pipe(dest('dist/js'));

};
function buildImg() {
	return src('app/img/**/*').pipe(dest('dist/img'));

};
function buildMp3() {
	return src('app/mp3/**/*').pipe(dest('dist/mp3'));

};
function buildFonts() {
	return src('app/fonts/**/*').pipe(dest('dist/fonts'))
};
function buildPhp() {
	return src('app/*.php').pipe(dest('dist/'))
};



exports.assets   = series(cleanimg, scripts, images)
exports.scripts  = scripts
exports.styles   = styles
exports.images   = images
exports.cleanimg = cleanimg
exports.deploy   = deploy
exports.build   = series(scripts, images, styles, buildCss, buildJs, buildImg , buildMp3,  buildFonts , buildHtml , buildPhp)
exports.default  = series(scripts, images, styles, parallel(browsersync, startwatch))
