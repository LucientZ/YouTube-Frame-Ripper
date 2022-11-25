# YouTube-Frame-Ripper
This tool utilizes node modules to rip frames from a youtube video and convert them to block-text characters. 

### <ins>Dependencies</ins>
- ffmpeg-extract-frames
- sharp
- ytdl-core

### <ins>How to use</ins>
Before using, install the dependencies in the root directory. This can be done easily utilizing the following command in the terminal.

```shell
$ npm install
```
Or, alternatively:
```shell
$ npm install ffmpeg-extract-frames
$ npm install sharp
$ npm install ytdl-core
```

Afterwards installing the dependencies, edit the keyword arguments in 'index.js'. After the package requirements, you'll see a code block that looks like the following:

```javascript
//// KWARGS ////
const url = "https://www.youtube.com/watch?v=FtutLA63Cp8"; // Currently only works with youtube links.
const fileOutputName = "Bad-Apple";                        // Output name to be appended to all relevant file names.
const framesPerSecond = 24;                                // Defines how many frames should be converted per second of the video. Enter 0 to be the fps of the video.
const textOutput = true;                                   // Defines whether frames will be converted to text.

// Applies if textOutput is true
const targetWidth = 8;                                     // Width of final frame.
const targetHeight = 6;                                    // Height of final frame.
const printToConsole = true;                               // Prints text frames to the console as an animation. Playback speed will be framesPerSecond. If set to 0 or less, default will be 24.
```

Most of the arguments are pretty self-explanatory, but here's a rundown of what they do:
- *url*: Link for the youtube video to have its frames ripped.
- *fileOutputName*: All relavent files and directories created when ran will have this somewhere in their name.
- *framesPerSecond*: This represents how many frames should be ripped from the video for every second of the video. This value also affects the playback speed in the console. Due to limitations with JavaScript, this will not play **exactly** on time. A text data file will be provided that can be parsed with a language which can actually print exactly on time.
- *textOutput*: This decides whether or not the program will convert every frame to text.
- *targetWidth*: Target width of the text frames.
- *targetHeight*: Target height of the text frames.
- *printToConsole*: This decides whether or not the text frames will be played back in the console.

Once the keyword arguments are set, just run the program and everything will be done automatically. 

```shell
$ node ./index.js
```

After the program is run, a directory should have been created which includes a video file, images of every frame, and a text data file including every frame converted to text.
