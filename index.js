const { chromium } = require("playwright");
const sharp = require("sharp")

// KWARGS
const url = "https://www.youtube.com/watch?v=amxDI97hMeQ";
const frames = 1500;
const targetWidth = 24;
const targetHeight = 18;

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
        const imgBuffer = await page.locator('.ytp-iv-video-content').screenshot();
        await page.keyboard.down('.'); // Moves to next frame


        await sharp(imgBuffer).resize(targetWidth, targetHeight).threshold(100).toFile('test.png');

    }
    await browser.close()

}

main();


//style="display:none;"