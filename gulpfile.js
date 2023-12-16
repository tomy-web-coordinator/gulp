// gulpを読み込む
const gulp = require("gulp");

// インストールしたパッケージを読み込む
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssSorter = require("css-declaration-sorter");
const mmq = require("gulp-merge-media-queries");
const browserSync = require("browser-sync");
const cleanCss = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const htmlBeautify = require("gulp-html-beautify");

// 処理を記述
// gulpでは明示的に処理の終わりを記述する必要がある。下記記述方法
function test(done) {
  console.log("hello Gulp");
  done();
}

// sassをコンパイルするための記述
function compileSass() {
  return gulp
    .src("./src/assets/sass/**/*.scss") //この記述にすることで、srcフォルダの中のすべてのフォルダを辿ってコンパイルしてくれる、拡張子は.scssに限定して
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssSorter()]))
    .pipe(mmq())
    .pipe(gulp.dest("./public/assets/css/")) // このフォルダに出力するよ
    .pipe(cleanCss())
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(gulp.dest("./public/assets/css/")); // このフォルダに接頭辞.min.cssで出力するよ
}

// watchでファイルの更新があれば自動コンパイルされるようにする
// ./src/**/*.scssを監視して、変更があればcompileSassを実行するような処理
// ターミナルコマンドは npx gulp watch
function watch() {
  gulp.watch(
    "./src/assets/sass/**/*.scss",
    gulp.series(compileSass, browserReload)
  ); // seriesは左から順番に読み込むので、先にcompile、その後ブラウザリロード
  gulp.watch("./src/assets/js/**/*.js", gulp.series(minJS, browserReload));
  //   assetsフォルダの中のjsの変更を監視して、変更があれば、minJSを行うと言う処理
  gulp.watch("./src/assets/img/**/*", gulp.series(copyImage, browserReload));
  gulp.watch("./src/**/*.html", gulp.series(formatHTML, browserReload));
}
// この時htmlファイルは更新対象になっていないので、htmlをいくら更新してもリロードされない、あくまで上記監視対象のファイルのみ

// ブラウザを立ち上げる処理
function browserInit(done) {
  browserSync.init({
    server: {
      baseDir: "./public/",
    },
  });
  done();
}

// ブラウザをリロードする処理
function browserReload(done) {
  browserSync.reload();
  done();
}

// JavaScriptファイルの圧縮
function minJS() {
  return gulp
    .src("./src/assets/js/**/*.js") // srcフォルダの中の全フォルダの.jsファイルを参照して
    .pipe(uglify())
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(gulp.dest("./public/assets/js/")); // publicフォルダに.minをつけて出力するよ
}

// htmlファイルのフォーマット
function formatHTML() {
  return gulp
    .src("./src/**/*.html") // srcフォルダの中の全フォルダの.htmlファイルを参照して
    .pipe(
      htmlBeautify({
        indent_size: 2,
        indent_with_tabs: true,
      })
    )
    .pipe(gulp.dest("./public")); // publicフォルダに出力するよ
}

// imgフォルダをpublicにコピーする処理
function copyImage() {
  return gulp
    .src("./src/assets/img/**/*")
    .pipe(gulp.dest("./public/assets/img/"));
}

// functionで作成した処理を実行する
exports.test = test;
exports.compileSass = compileSass;

// watchするための記述;
exports.watch = watch;

exports.browserInit = browserInit;
exports.dev = gulp.parallel(browserInit, watch); // parallelは並行して動くので順番関係なし
exports.minJS = minJS;
exports.formatHTML = formatHTML;

// 全部の処理を並列で処理する記述
// この処理をするとpublicフォルダに上記functionで作成した処理が実行される
exports.build = gulp.parallel(formatHTML, minJS, compileSass, copyImage);
