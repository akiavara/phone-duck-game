# phone-duck-game

## Description of the project
The goal of this project is to make a proof of concept of a game that use your phone as a gamepad.

There is 6 folders in order to show all steps of this project. Each folder is a complete / autonomous project, here is some details:

| Folder | Description |
| --- | --- |
| `1_tappy_plane` | A small game in order to test synchronization between phone and desktop browser |
| `2_phone_data` | List all data received by the phone (accelerometer and gyroscope) |
| `3_leave_my_duck_alone_alpha` | Alpha version of the final game in order to move the cursor from top to bottom |
| `4_compass` | Use of the compass functionnality of the phone to be able to move from left to right |
| `5_leave_my_duck_alone_beta` | Include these 2 previous data into a beta version of the game. We can now create the final game. |
| `6_leave_my_duck_alone` | The final project, a small game that has to be improved |

## Installation
To be able to launch the project you must install nodejs (https://nodejs.org/en/) in order to serve all files and socket.io + uuid:
```
$ npm install socket.io
$ npm install node-uuid
```

You are now able to start your server by doing:
```
$ cd 1_tappy_plane
$ node app.js
```

Then you can open your browser and go to the location: http://localhost:8080.

## Todo
- [x] Create synchronization between server and phone
- [x] List all phone data
- [x] Being able to move a cursor on the desktop browser from phone position
- [ ] Create the final game
- [ ] Improve the code quality (because it's really ugly for now)

