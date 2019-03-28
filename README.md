# 🍬 Trick & Treat 🎃
This is a social digital board game inspired by Betrayal at House on the Hill where a group of friends explore a neighborhood looking for treats!

## Development
This game is separated into multiple projects. Each project has their own package and scripts which compiles and runs the individual application. However, from the root folder you can now call `npm run compile:${project-name}` and `npm run start:${project-name}` respectively.

## Definitions

### "remote" Project
Represents the screen that each user will be viewing from.

### "screen" Project
Represents the "board" that the game is being played on.

### "server" Project
Handles all the game logic and communication of events between all the projects.

### Folder Terminology
- `./collections` : (?) a predefined bunch of data
- `./constants` : static values to be referenced
- `./data` : app-level state and architectural actions
- `./helpers` : files that aid and depend on other modules, typically helping parse 'data'
- `./managers` : singletons that handle logic code
- `./models` : reuseable classes that typically hold and modify data
- `./tests` : unit tests
- `./utilities` : general use functions that takes an input and output

