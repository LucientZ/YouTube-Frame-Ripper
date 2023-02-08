# YouTube-Frame-Ripper
This tool utilizes node modules to rip frames from a youtube video and convert them to block-text characters. An up-to-date release of node.js is required to run this.

For a demo of what this tool was created for, watch this YouTube video:
- https://www.youtube.com/watch?v=HWIbUDLiNBs

### <ins>Dependencies</ins>
- ffmpeg-extract-frames
- sharp
- ytdl-core

### <ins>How to use</ins>
FFmpeg must be installed on your machine in order for this to work. The installation method varies between operating systems, so I recommend looking up a tutorial on how to do this before proceeding. Here is the download page for various binaries of FFmpeg: https://ffmpeg.org/download.html

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
const framesPerSecond = 12;                                // Defines how many frames should be converted per second of the video. Enter 0 to be the fps of the video.
const textOutput = true;                                   // Defines whether frames will be converted to text.
const localFile = "";                                      // If there is a local file that you want to extract the frames from, type its location here. Otherwise, leave this string blank. 

// Applies if textOutput is true
const printToConsole = true;                               // Defines whether or not the text frames will be printed to the console.This will playback the text frames at a speed as close to the given frames per second as possible.
const targetWidth = 16;                                    // Width of final frame.
const targetHeight = 12;                                   // Height of final frame.
const textType = "block";                                  // Text type to convert the frames to. Current options are 'block' | 'ascii'
const charSpacing = 0;                                     // Defines how far apart characters should be from each other horizontally with spaces.

const ASCIIList = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@']; // List of ASCII characters sorted by least to greatest brightness. Works best if there is a relatively smooth gradient.
```

Most of the arguments are pretty self-explanatory, but here's a rundown of what they do:
* ***url***: Link for the youtube video to have its frames ripped.

* ***fileOutputName***: All relavent files and directories created when ran will have this somewhere in their name.

* ***framesPerSecond***: This represents how many frames should be ripped from the video for every second of the video. This value also affects the playback speed in the console. Due to limitations with JavaScript, this will not play *exactly* on time. A text data file will be provided that can be parsed with a language which can actually print exactly on time.

* ***textOutput***: This decides whether or not the program will convert every frame to text.

* ***localFile***: If there is a local mpeg encoded file that you want to rip the frames from, put the location and name of the file here. If not, leave this string empty.

* ***printToConsole***: This decides whether or not the text frames will be played back in the console.

* ***targetWidth***: Target width of the text frames.

* ***targetHeight***: Target height of the text frames.

* ***textType***: If *textOutput* is set to true, this specifies the type of text to render each of the frames as. Currently, the two options are 'ascii' and 'block'. Each of these renders the frames as their respective text type.

* ***charSpacing***: Defines the amount of spaces between characters in the final frames.

* ***ASCIIList***: This is a list of ASCII characters to be used if *textType* is set to 'ascii'. The characters should be sorted from least bright to most bright. 

Once the keyword arguments are set, just run the program and everything will be done automatically. 

```shell
$ node ./index.js
```

After the program is run, a directory should have been created which includes a video file, images of every frame, and a text data file including every frame converted to text.

### <ins>Example Outputs</ins>

![Bad-Apple-Showcase](https://user-images.githubusercontent.com/98664830/204220301-b1ea1ee9-b327-4dbf-973a-0b775492f9ff.gif)

***Example of printing Bad Apple at a low resolution as block text. The left is the default character set that is optimized for Discord whereas the right is a custom character set optimized for mono-space fonts.***



![Screenshot (679)](https://user-images.githubusercontent.com/98664830/204209460-f3eb8cd1-8d70-4f1f-acd6-b7abd35b5814.png)

***Text-frame data for a relatively obscure underground song that you wouldn't know.***
