const { chromium } = require("playwright");
const sharp = require("sharp");
const fs = require("fs");

// KWARGS
const url = "https://www.youtube.com/watch?v=amxDI97hMeQ";
const frames = 1100;
const targetWidth = 16;
const targetHeight = 12;
const fileType = "text"; // Options are 'image' and 'text'
const printToConsole = true; // Only matters if fileType is set to 'text'
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
    let text_frame = [];

    for(let i = 0; i < targetHeight*targetWidth*3; i += targetWidth*3*2){
        let row = "";
        for(let j = i; j < i + targetWidth * 3; j += 6){
            row += pix_to_char(frame.at(j), frame.at(j+3), frame.at(j+targetWidth*3), frame.at(j+targetWidth*3 + 3));
        }
        row += '\n'
        text_frame.push(row);
    }
    text_frame.push('\n');

    if(printToConsole){
        let finalStr = "";
        for(let i = 0; i < text_frame.length; i++){
            finalStr += text_frame[i];
        }
        console.log(finalStr);
    }
    return text_frame;
}


async function main(){
    if (targetHeight * targetWidth % 4 != 0 && fileType == "text"){
        console.log("To output to text, area of frames in pixels must be a multiple of 4.");
        return;
    }

    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(url);
    await page.waitForTimeout(2000);

    await page.keyboard.press('k');

    // Hides playbar and lower gradient
    await page.locator(".ytp-chrome-bottom").evaluate(element => element.style.display = 'none');
    await page.locator(".ytp-gradient-bottom").evaluate(element => element.style.display = 'none');


    for(let i = 0; i < frames; i++){
        // Take screenshot of video div and put into a buffer to be processed by sharp
        let imgBuffer = await page.locator('.ytp-iv-video-content').screenshot();
        await page.keyboard.press('.'); // Moves to next frame

        imgBuffer = await sharp(imgBuffer).removeAlpha().resize(targetWidth, targetHeight).threshold(100).toBuffer();

        if(fileType == "image"){
            await sharp(imgBuffer).png({pallete: true}).toFile(`frames/frame${i}.png`);
            console.log(`Saved frames/frame${i}.png`);
            if(printToConsole){
                sharp_to_text(imgBuffer);
            }
        }
        else if(fileType == "text"){
            sharp_to_text(imgBuffer);
            await sharp(imgBuffer).png({pallete: true}).toFile(`test.png`);
        }

        


    }
    await browser.close();

}

main();


//style="display:none;"