const { chromium } = require("playwright");
const sharp = require("sharp");
const fs = require("fs");

// KWARGS
const url = "https://www.youtube.com/watch?v=amxDI97hMeQ";
const frames = 1100;
const targetWidth = 24;
const targetHeight = 18;
const filetype = "image"; // Options are 'image' and 'text' 

async function sharp_to_text(imgBuffer){
    //stub
}


async function main(){
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
        }
        else if(filetype == "text"){
            sharp_to_text(imgBuffer);
        }
        console.log(`Parsed frame number ${i}`);


    }
    await browser.close();

}

main();


//style="display:none;"