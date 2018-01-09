# EquivalentJS Plugin MDC

-- ONLY PLACEHOLDERS awaiting description --

Introduction

Material Components abstraction

## an UI framework integration as EquivalentJS plugin

Description

## Requirements

Install dependencies with [npmjs][npmjs] at project root folder

    npm install

## Configuration

```json
{
  "plugins": {
    "equivalent-js-plugin-mdc": true
  }
}
```

## Documentation, scripts and stylesheets

Generate scripts and stylesheets ([Sass][sass]) 
and documentation ([JSDoc][jsdoc] & [JSDoc Type][jsdoc-type])

    npm run dev:run

or

    npm run dev:watch

## Run demo application in browser with loaded plugins

    npm run dev:http
    
    http://127.0.0.1:8084/index.html

## Build all EquivalentJS modules as concatenated minified library file

    npm run prod:minify
    
    http://127.0.0.1:8084/prod.html

## How to contribute

[Contributing][contributing]

## Appendix

[Code of Conduct][coc]


...live long and prosper

[equivalent-js]: https://github.com/xeroxzone/equivalent-js
[MM]: https://github.com/xeroxzone/equivalent-js/blob/master/docs/MODULE_MANAGER.md
[MP]: https://github.com/xeroxzone/equivalent-js/blob/master/docs/MODULE_PLUGIN.md
[MTR]: https://github.com/xeroxzone/equivalent-js/blob/master/docs/TEST_RUNNER.md
[MDR]: https://github.com/xeroxzone/equivalent-js/blob/master/docs/DOC_RUNNER.md
[contributing]: https://github.com/xeroxzone/equivalent-js/blob/master/CONTRIBUTING.md
[coc]: https://github.com/xeroxzone/equivalent-js/blob/master/CODE_OF_CONDUCT.md
[npmjs]: https://www.npmjs.com
[gulp]: http://gulpjs.com
[jquery]: https://jquery.com
[qunit]: https://qunitjs.com
[jsdoc]: http://usejsdoc.org
[jsdoc-type]: http://usejsdoc.org/tags-type.html
[sass]: http://sass-lang.com
