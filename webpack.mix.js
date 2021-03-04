let mix = require("laravel-mix");

mix.js("assets/js/app.js", "js")
    .sass("assets/sass/app.scss", "css")
    .setPublicPath("dist")
    .vue();