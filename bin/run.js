#! /usr/bin/env node

// Parse arguments for the CLI
const ArgumentParser = require('argparse').ArgumentParser;
const parser = new ArgumentParser({
  addHelp: true,
  description: 'The Redux Viewer CLI'
});
// Source parameter
parser.addArgument(
  ['-s', '--source'],
  {help: 'Where are your source files?'}
);
const args = parser.parseArgs();

let directory;
// Make sure there is a directory passed
if (!args.source) {
  console.error('Must pass a folder!');
  process.exit();
} else {
  directory = args.source;
}


const fs = require('fs'); // File system to write a JSON
const path = require('path'); // Path resolving
const findInFiles = require('find-in-files'); // File regex lookup

// Regex describing an effect
const regexSearch = new RegExp(/\/\*\*([\s\S]*?)\@type Effect([\s\S]*?)\*\//);

// Run file lookup
findInFiles.find(regexSearch, directory, '.ts$').then(result => {
  let effects = [];

  Object.keys(result).forEach(file => {
    result[file].matches.forEach(match => {
      let matchArray = match.split('\n')
        .map(l => l.trim())
        .map(l => l.substr(2, l.length - 2))
        .map(l => l.split(' '))
        .map(l => ({param: l.shift(), body: l.join(' ')}))
        .map(({param, body}) => ({param: param.substr(1, param.length - 1), body}));
      matchArray.pop();
      matchArray.shift();

      let effect = {};
      matchArray.forEach(line => {
        switch (line.param) {
          case 'name':
          case 'filter':
            effect[line.param] = line.body;
            break;
          case 'ofType':
          case 'dependencies':
          case 'action':
            effect[line.param] = line.body.split(',').map(s => s.trim());
        }
      });

      effects.push(effect);
    });
  });

  const viewer = path.join(__dirname, '../viewer/');

  const outputPath = path.join(viewer, 'effects.json');
  fs.writeFileSync(outputPath, JSON.stringify(effects, null, 2));

  const connect = require('connect'); // Server connection
  const serveStatic = require('serve-static'); // Serving strategy
  const PORT = 8090;
  connect().use(serveStatic(viewer)).listen(PORT, () => {
    console.warn('Note!', 'The RV server is not watching for effect changes');
    console.log('Static server running on', PORT);

    const open = require('open'); // Open the server
    open('http://localhost:' + PORT);
  });
});