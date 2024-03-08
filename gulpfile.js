const { src, dest, watch, parallel } = require("gulp");

// CSS
const sass = require("gulp-sass")(require('sass'));
const plumber =  require('gulp-plumber');
const autoprefixer  = require('autoprefixer');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');

// Images
// const webp = require('gulp-webp');
const cache = require('gulp-cache');
const imagemin = require('gulp-imagemin');
const webpPromise = import('gulp-webp');
const avif = require('gulp-avif');

function css ( done ){
    src("src/scss/**/*.scss") // Identify sass file
        .pipe( sourcemaps.init() )
        .pipe( plumber() ) // plumber allows the watch to keep running even after an error
        .pipe( sass() ) // compile
        .pipe( postcss([autoprefixer(), cssnano() ] ) )
        .pipe(sourcemaps.write('.'))
        .pipe( dest("build/css") ); // Store in the hard drive

    
    done(); // callback tells gulp when the function has finished
}

function imagenes( done ) {
    const opciones = {
        optimizationLevel: 3
    }
    src('src/img/**/*.{png,jpg}')
        .pipe( cache( imagemin(opciones) ) ) 
        .pipe( dest('build/img'))

    done();
}

function versionWebp( done ) {
    const opciones = {
        quality: 50
    }

    // src('src/img/**/*.{png,jpg}')
    //     .pipe( webp(opciones) )
    //     .pipe( dest('build/img') )

    webpPromise.then(module => {
        const webp = module.default; // Accessing the default export of gulp-webp
        src('src/img/**/*.{png,jpg}')
            .pipe(webp(opciones)) // Using the webp function
            .pipe(dest('build/img'))
            .on('end', done);
    }).catch(error => {
        console.error('Error importing gulp-webp:', error);
        done(error); // Call done with the error to indicate task failure
    });

    done();
}

function versionAvif( done ) {
    const opciones = {
        quality: 50
    }

    src('src/img/**/*.{png,jpg}')
        .pipe( avif(opciones) )
        .pipe( dest('build/img') )

    done();
}

function javascript( done ) {
    src('src/js/**/*.js')
        .pipe(dest('build/js'));

    done();
}

function dev(done){
    watch("src/scss/**/*.scss", css); // path and the function which to run. 
    watch("src/js/**/*.js", javascript);
    done();
}

exports.css = css;
exports.js = javascript;
exports.imagenes = imagenes;
exports.versionWebp = versionWebp;
exports.versionAvif = versionAvif;
exports.dev = parallel(imagenes, versionWebp, versionAvif, javascript, dev);