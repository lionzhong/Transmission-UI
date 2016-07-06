/**
 * Created by Vincent on 2016/4/21.
 */
"use strict";
const gulp = require("gulp");
const babel = require("gulp-babel");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
    // cleancss = require("gulp-clean-css"),
const path = {
	"sass":"source/scss/**/*.scss",
	"sassLV1":"source/scss/*.scss",
	"css":"style",
	"js":"source/javascript/**/*.js",
	"jsLV1":"source/javascript/*.js",
	"jsmin":"javascript"
};

gulp.task("jsCompile", function () {
    gulp.src([path.jsLV1,path.js])
		// .pipe(sourcemaps.init())
        // .pipe(uglify())
		// .pipe(sourcemaps.write("/maps"))
        .pipe(gulp.dest(path.jsmin));
});

gulp.task("SassCompile", function () {
    gulp.src([path.sassLV1,path.sass])
		.pipe(sourcemaps.init())
        .pipe(sass({outputStyle: "compressed"}).on("error", sass.logError))
        .pipe(sourcemaps.write("/maps"))
        .pipe(gulp.dest(path.css));
});

gulp.task("WatchSass", function () {
	gulp.watch([path.sassLV1,path.sass], ["SassCompile"]);
});

gulp.task("WatchJs", function () {
	gulp.watch([path.jsLV1,path.js], ["jsCompile"]);
});

gulp.task("transmission", ["SassCompile","jsCompile","WatchSass","WatchJs"]);