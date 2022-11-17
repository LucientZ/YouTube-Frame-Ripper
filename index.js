const { chromium } = require("playwright");
const sharp = require("sharp");
const fs = require("fs");

// KWARGS
const url = ""; // Currently only works with youtube links. Does not skip ads, so keep that in mind
const frames = 1200;                                       // Amount of frames to be captured
const targetWidth = 8;                                    // Width of final frame
const targetHeight = 6;                                   // Height of final frame
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
        return '▜';
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
    const frame = await sharp(imgBuffer).raw().toBuffer();
    let final_string = "";

    for(let i = 0; i < targetHeight*targetWidth*3; i += targetWidth*3*2){
        let row = "";
        for(let j = i; j < i + targetWidth * 3; j += 6){
            row += pix_to_char(frame.at(j), frame.at(j+3), frame.at(j+targetWidth*3), frame.at(j+targetWidth*3 + 3));
        }
        row += '\n'
        final_string += row;
    }
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

    // Goes to url and waits 2 seconds for it to load
    await page.goto(url);
    await page.waitForTimeout(2000);

    // Plays video if paused
    await page.keyboard.press('k');

    // Hides playbar and lower gradient
    await page.locator(".ytp-chrome-bottom").evaluate(element => element.style.display = 'none');
    await page.locator(".ytp-gradient-bottom").evaluate(element => element.style.display = 'none');

    fs.writeFile(`frames/${fileOutputName}`, `# Block text animation frames.\n# UTF-8 or UTF-16\n# Width\n${targetWidth/2}\n# (${targetWidth}px)\n# Height:\n${targetHeight/2}\n# (${targetHeight}px)\n\n`, (err) => {console.log("Error: ", err)});
    

    for(let i = 0; i < frames; i++){
        // Take screenshot of video div and put into a buffer to be processed by sharp
        let imgBuffer = await page.locator('.ytp-iv-video-content').screenshot();
        await page.keyboard.press('.'); // Moves to next frame

        if (fileType == "text"){
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

        


    }
    await browser.close();

}

main();


//style="display:none;"