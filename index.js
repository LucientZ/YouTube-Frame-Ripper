const { chromium } = require("playwright");
const sharp = require("sharp");
const fs = require("fs");

// KWARGS
const url = "https://www.youtube.com/watch?v=FtutLA63Cp8"; // Currently only works with youtube links. Does not skip ads, so keep that in mind
const frames = 1200;                                       // Amount of frames to be captured
const playbackSpeed = "Normal";                            // Options are '0.25', '0.5', 'Normal', '1.25', '1.5', '1.75', and '2'
const duration = 220;                                      // Video duration in seconds
const targetWidth = 8;                                     // Width of final frame
const targetHeight = 6;                                    // Height of final frame
const fileType = "text";                                   // Options are 'image', 'text', and 'both'
const printToConsole = true;                               // Only matters if fileType is set to 'text'
const fileOutputName = "frames.dat";


function pix_to_char(pix1, pix2, pix3, pix4){

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


async function main(){
    if (targetHeight * targetWidth % 4 != 0 && fileType == "text"){
        console.log("To output to text, area of frames in pixels must be a multiple of 4.");
        return;
    }

    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Goes to url and waits 1 second for it to load
    await page.goto(url);
    await page.waitForTimeout(1000);

    // Plays video if paused
    await page.keyboard.press('k');

    // Slow Video down
    await page.locator(".ytp-settings-button").click();
    await page.locator("text =Playback speed").click();
    await page.waitForTimeout(1000);
    await page.locator(`text =${playbackSpeed}`).click();
    await page.locator(".ytp-settings-button").click();

    // Hides playbar and lower gradient
    await page.locator(".ytp-chrome-bottom").evaluate(element => element.style.display = 'none');
    await page.locator(".ytp-gradient-bottom").evaluate(element => element.style.display = 'none');

    fs.writeFile(`frames/${fileOutputName}`, `# Block text animation frames.\n# UTF-8 or UTF-16\n# Width\n${targetWidth/2}\n# (${targetWidth}px)\n# Height:\n${targetHeight/2}\n# (${targetHeight}px)\n\n`, (err) => {console.log("Error: ", err)});
    
    // Change duration based on playback speed. Multiply by reciprocal of multiplier.
    let newDuration = 1;
    switch(playbackSpeed){
        case "0.25":
            newDuration = duration * 4;
            break;
        case "0.5":
            newDuration = duration * 2;
            break;
        case "1.25":
            newDuration = duration * 5/4;
            break;
        case "1.5":
            newDuration = duration * 6/4;
            break;
        case "1.75":
            newDuration = duration * 4/7;
            break;
        case "2":
            newDuration = duration * 1/2;
            break;
        default:
            newDuration = duration;
    }

    // Reset video to beginning
    await page.keyboard.press('0');

    for(let i = 0; i < frames; i++){
        // Take screenshot of video div and put into a buffer to be processed by sharp
        let imgBuffer = await page.locator('.ytp-iv-video-content').screenshot();

        if (fileType == "text" || fileType == "both"){
            imgBuffer = await sharp(imgBuffer).removeAlpha().resize(targetWidth, targetHeight, {kernel: sharp.kernel.nearest}).threshold(100).toBuffer();
        }
        

        if(fileType == "image"){
            await sharp(imgBuffer).png({pallete: true}).toFile(`frames/frame${i}.png`);
            console.log(`Saved frames/frame${i}.png`);
            if(printToConsole){
                sharp_to_text(imgBuffer);
            }
        }
        else if(fileType == "text"){
            let data = await sharp_to_text(imgBuffer);
            await sharp(imgBuffer).png({pallete: true}).toFile(`preview.png`);
            fs.appendFile(`frames/${fileOutputName}`, data, (err) => {/*pass*/});
        }
        else if(fileType == "both"){
            let data = await sharp_to_text(imgBuffer);
            await sharp(imgBuffer).png({pallete: true}).toFile(`frames/frame${i}.png`);
            console.log(`Saved frames/frame${i}.png`);
            fs.appendFile(`frames/${fileOutputName}`, data, (err) => {/*pass*/});
        }
        else{
            console.log("Invalid filetype: " + fileType);
            break;
        }

        
        await page.waitForTimeout(newDuration*1000/frames);

    }
    await browser.close();

}

main();
