const sharp = require("sharp");
const fs = require("fs");
const ytdl = require("ytdl-core");
const extractFrames = require("ffmpeg-extract-frames");


//// KWARGS ////
const url = "https://www.youtube.com/watch?v=FtutLA63Cp8"; // Currently only works with youtube links.
const fileOutputName = "Bad-Apple";                        // Output name to be appended to all relevant file names.
const framesPerSecond = 12;                                // Defines how many frames should be converted per second of the video. Enter 0 to be the fps of the video.
const textOutput = true;                                   // Defines whether frames will be converted to text.
const localFile = "";      // If there is a local file that you want to extract the frames from, type its location here. Otherwise, leave this string blank. 

// Applies if textOutput is true
const printToConsole = true;                               // Defines whether or not the text frames will be printed to the console.This will playback the text frames at a speed as close to the given frames per second as possible
const targetWidth = 24;                                    // Width of final frame.
const targetHeight = 18;                                   // Height of final frame.

function pixelToBlock(pix1, pix2, pix3, pix4){
    /*
    Converts black and white pixel data from a 2 x 2 grid to the corresponding block character.
    These work best with monospace fonts.
    */

    switch("" + pix1 + pix2 + pix3 + pix4){
        case "255255255255":
            return '▇';
        case "0255255255":
            return '▟';
        case "2550255255":
            return '▙';
        case "2552550255":
            return '▜';
        case "2552552550":
            return '▛';
        case "00255255":
            return '▅';
        case "25525500":
            return '▜'; // Approximation
        case "25502550":
            return '▙'; // Approximation
        case "02550255":
            return '▜'; // Approximation
        case "25500255":
            return '▚';
        case "02552550" :
            return '▞';
        case "255000":
            return '▘';
        case "0255000":
            return '▝';
        case "002550":
            return '▖';
        case "000255":
            return '▗';
        case "0000":
            return ' ';
        default:
            return "▇";
    }
}


async function bufferToBlock(imgBuffer){
    // Frame is a list of every pixel in frame. 
    const frame = await sharp(imgBuffer).removeAlpha().threshold().raw().toBuffer();
    let final_string = "";

    // Parse frame as 2x2 chunks. Return characters depending on what pixels in original frame are white and which are black.
    for(let i = 0; i < targetHeight*targetWidth*3; i += targetWidth*3*2){
        let row = "";
        for(let j = i; j < i + targetWidth * 3; j += 6){
            row += pixelToBlock(frame.at(j), frame.at(j+3), frame.at(j+targetWidth*3), frame.at(j+targetWidth*3 + 3));
        }
        row += '\n';
        final_string += row;
    }
    // Add new line to separate frames properly in output file
    final_string += "\n";
    return final_string;
}

function clearPrint(imgString){
    console.clear();
    console.log(`\u001B[?25l${imgString}`); // Special character hides cursor in the console.
}

(async function main(){
    
    try{
        // Variable Guards
        if(targetWidth <= 0 || targetHeight <= 0){
            throw "targetWidth and targetHeight must be greater than 0.";
        }
        else if(!(Number.isInteger(targetWidth) && Number.isInteger(targetHeight))){
            throw "targetWidth and targetHeight must be integer values.";
        }
        else if(fileOutputName == ""){
            throw "File Output Name cannot be an empty string.";
        }
        else if(!fs.existsSync(localFile)){
            throw `${localFile} cannot be accessed or does not exist`;
        }

        let dir = `./${fileOutputName}-frames`;
        let frames = [];
        let mpegFile = "";

        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        if(localFile == ""){
            mpegFile = `${dir}/${fileOutputName}.mp4`;
            console.log("Waiting for video to download...");
            await new Promise((resolve) => {
                ytdl(url).pipe(fs.createWriteStream(mpegFile)).on("close", () => {
                    resolve();
                })
            });
            console.log("Download complete.");
        }
        else{
            mpegFile = localFile
        }
        


        console.log("Converting video to frames...");
        let options = {input: mpegFile, output: `${dir}/frame-%d.jpg`, fps: framesPerSecond};
        if(framesPerSecond <= 0){
            // When fps is 0 or less, sets it to default
            options = {input: mpegFile, output: `${dir}/frame-%d.jpg`};
        }
        await new Promise((resolve) => {
            extractFrames(options).finally(() => {
                resolve();
            });
        });

        if(textOutput){
            // To get a block text output, the resolution must have an area that is evenly divisible by 4.
            if (targetHeight * targetWidth % 4 != 0){
                console.log("To output to text, area of frames in pixels must be a multiple of 4.");
                return;
            }
            let i = 1;
            fs.writeFile(`${dir}/${fileOutputName}.dat`, `# Block text animation frames\n# UTF-8\n# Width: ${targetWidth}\n# Height: ${targetHeight}\n\n`, (error) => {/*pass*/});
            while(fs.existsSync(`${dir}/frame-${i}.jpg`)){
                // Iterates through each image without explicitly knowing how many are in the file.
                let imgBuffer = await sharp(`${dir}/frame-${i}.jpg`).resize(targetWidth, targetHeight, {kernel: sharp.kernel.nearest}).toBuffer();
                let imgString = await bufferToBlock(imgBuffer);
                fs.appendFile(`${dir}/${fileOutputName}.dat`, imgString, (error) => {/*pass*/});
                if (printToConsole && textOutput){
                    frames.push(imgString);
                }
                i++;
            }
        }
        
        console.log("Frames done processing.\nPress ENTER to continue...");

        // Waits for some data to be inputted into stdin
        await new Promise(resolve => {
            process.stdin.once("data", () => {
                process.stdin.pause();
                resolve();
            });
        });


        if(printToConsole && textOutput){
            // Separate variable playbackSpeed used to for console playback
            let playbackSpeed = framesPerSecond;
            if(playbackSpeed <= 0){
                playbackSpeed = 24;
            }

            let millisecondsPerFrame = 1000 / playbackSpeed; // mspf = (fps)^-1 * 1000 = 1000 / (fps)
            
            // Plays animation back. Less accurate timing at higher fps (high meaning above 5)
            let frameNum = 0;
            let playback = setInterval(function() {
                if(frameNum >= frames.length){
                    clearInterval(playback);
                    return;
                }
                else{
                    clearPrint(frames.at(frameNum));
                    frameNum++;
                }

            }, millisecondsPerFrame);
            
            console.log("\u001B[?25h"); //Shows cursor in console
            
        }
            
        
    }
    catch(error){
        console.log("Error: ", error);
    }

})();
