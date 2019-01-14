# 🍬 Trick & Treat 🎃
This is a social digital board game inspired by Betrayal at House on the Hill where a group of friends explore a neighborhood looking for treats!

## Development
This game is separated into multiple projects. Each project has their own package and scripts which compiles and runs the individual application. However, from the root folder you can now call `npm run compile:${project-name}` and `npm run start:${project-name}` respectively.

### "remote" Project
Represents the screen that each player will be viewing from.

### "screen" Project
Represents the "board" that the game is being played on.

### "server" Project
Handles all the game logic and communication of events between all the projects.
