const { chromium } = require("playwright");
const sharp = require("sharp");
const fs = require("fs");

// KWARGS
const url = "https://www.youtube.com/watch?v=amxDI97hMeQ";
const frames = 1100;
const targetWidth = 24;
const targetHeight = 18;
const filetype = "text"; // Options are 'image' and 'text' 


function list_to_char(tuple){
    switch (tuple){
        case (255,255,255,255):
            return "▉";
        case (0,255,255,255):
            return "▟";
        case (255,0,255,255):
            return "▙";
        case (255,255,0,255):
            return "▜";
        case (255,255,255,0):
            return "▛";
        default:
            return "▉"
    }
}


async function sharp_to_text(imgBuffer){
    const frame = await sharp(imgBuffer).removeAlpha().raw().toBuffer();
    let text_frame = [];

    for(let i = 0; i < frame.length; i += targetWidth*6){
        var row = "";
        for(let j = i; j < targetWidth * 3; j += 6){
            row += list_to_char((frame.at(j), frame.at(j+3), frame.at(j+targetWidth*3), frame.at(j+targetWidth*3 + 3)));
        }
        row += "\n";
        console.log(row);
        //text_frame.push(row);
    }
    
    
}


async function main(){
    if (targetHeight * targetWidth % 4 != 0 && filetype == "text"){
        console.log("To output to text, area of frames in pixels must be a multiple of 4.");
        return;
    }

    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(url);
    //await page.click("[aria-label='Play']");

    await page.keyboard.down('KeyK');

    // Hides playbar and lower gradient
    await page.locator(".ytp-chrome-bottom").evaluate(element => element.style.display = 'none');
    await page.locator(".ytp-gradient-bottom").evaluate(element => element.style.display = 'none');

    for(let i = 0; i < frames; i++){
        // Take screenshot of video div and put into a buffer to be processed by sharp
        let imgBuffer = await page.locator('.ytp-iv-video-content').screenshot();
        await page.keyboard.down('.'); // Moves to next frame


        imgBuffer = await sharp(imgBuffer).resize(targetWidth, targetHeight).threshold(100).toBuffer();

        if(filetype == "image"){
            await sharp(imgBuffer).png({pallete: true}).toFile(`frames/frame${i}.png`);
            console.log(`Saved frames/frame${i}.png`);
        }
        else if(filetype == "text"){
            sharp_to_text(imgBuffer);
        }
        


    }
    await browser.close();

}

main();


//style="display:none;"