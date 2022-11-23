const sharp = require("sharp");
const fs = require("fs");
const ytdl = require("ytdl-core");
const extractFrames = require("ffmpeg-extract-frames");


//// KWARGS ////
const url = "https://www.youtube.com/watch?v=FtutLA63Cp8"; // Currently only works with youtube links.
const fileOutputName = "Bad-Apple";                        // Output name to be appended to all relevant file names
const framesPerSecond = 1;                                 // Defines how many frames should be converted per second of the video
const textOutput = true;                                   // Defines whether frames will be converted to text

// Applies if textOutput is true
const targetWidth = 8;                                     // Width of final frame
const targetHeight = 6;                                    // Height of final frame
const printToConsole = true;                               // Only matters if textOutput is set to true


function pix_to_char(pix1, pix2, pix3, pix4){
    /*
    Converts black and white pixel data from a 2 x 2 grid to the corresponding block character.
    These work best with monospace fonts.
    */

    if (pix1 == 255 && pix2 == 255 && pix3 == 255 && pix4 == 255){
        return '▇';
    }
    else if (pix1 == 0 && pix2 == 255 && pix3 == 255 && pix4 == 255){
        return '▟';
    }
    else if (pix1 == 255 && pix2 == 0 && pix3 == 255 && pix4 == 255){
        return '▙';
    }
    else if (pix1 == 255 && pix2 == 255 && pix3 == 0 && pix4 == 255){
        return '▜';
    }
    else if (pix1 == 255 && pix2 == 255 && pix3 == 255 && pix4 == 0){
        return '▛';
    }
    else if (pix1 == 0 && pix2 == 0 && pix3 == 255 && pix4 == 255){
        return '▅';
    }
    else if (pix1 == 255 && pix2 == 255 && pix3 == 0 && pix4 == 0){
        return '▜'; // Since there isn't a block character with a consistant width that represents two white pixels on top, this is the best approximation.
    }
    else if (pix1 == 255 && pix2 == 0 && pix3 == 255 && pix4 == 0){
        return '▙';
    }
    else if (pix1 == 0 && pix2 == 255 && pix3 == 0 && pix4 == 255){
        return '▜';
    }
    else if (pix1 == 255 && pix2 == 0 && pix3 == 0 && pix4 == 255){
        return '▚';
    }
    else if (pix1 == 0 && pix2 == 255 && pix3 == 255 && pix4 == 0){
        return '▞';
    }
    else if (pix1 == 255 && pix2 == 0 && pix3 == 0 && pix4 == 0){
        return '▘';
    }
    else if (pix1 == 0 && pix2 == 255 && pix3 == 0 && pix4 == 0){
        return '▝';
    }
    else if (pix1 == 0 && pix2 == 0 && pix3 == 255 && pix4 == 0){
        return '▖';
    }
    else if (pix1 == 0 && pix2 == 0 && pix3 == 0 && pix4 == 255){
        return '▗';
    }
    else if (pix1 == 0 && pix2 == 0 && pix3 == 0 && pix4 == 0){
        return ' ';
    }
    else{
        return '▉';
    }

}


async function sharp_to_text(imgBuffer){
    // Frame is a list of every pixel in frame. 
    const frame = await sharp(imgBuffer).raw().toBuffer();
    let final_string = "";

    // Parse frame as 2x2 chunks. Return characters depending on what pixels in original frame are white and which are black.
    for(let i = 0; i < targetHeight*targetWidth*3; i += targetWidth*3*2){
        let row = "";
        for(let j = i; j < i + targetWidth * 3; j += 6){
            row += pix_to_char(frame.at(j), frame.at(j+3), frame.at(j+targetWidth*3), frame.at(j+targetWidth*3 + 3));
        }
        row += '\n'
        final_string += row;
    }
    // Add new line to separate frames properly in output file
    final_string += "\n";
    if(printToConsole){
        console.log(final_string);
    }
    return final_string;
}


(async function main(){
    

    try{
        if (targetHeight * targetWidth % 4 != 0 && fileType == "text"){
            console.log("To output to text, area of frames in pixels must be a multiple of 4.");
            return;
        }

        let dir = `./${fileOutputName}-frames`;

        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        console.log("Waiting for video to download...");
        await new Promise((resolve) => {
            ytdl(url).pipe(fs.createWriteStream(`${dir}/${fileOutputName}.mp4`)).on("close", () => {
                resolve();
            })
        });
        console.log("Download complete.\n");


        console.log("Converting video to frames...");
        const options = {input: `${dir}/${fileOutputName}.mp4`, output: `${dir}/frame-%d.jpg`, fps: framesPerSecond};
        await new Promise((resolve) => {
            extractFrames(options).finally(() => {
                resolve();
            });
        });

        if(textOutput){
            //stub
        }

        console.log("Frame Conversion Complete.\n");

    }
    catch(error){
        console.log(error);
    }

})();
