const puppeteer = require('puppeteer');

(async () => {

    const browser = await puppeteer.launch({args: ['--no-sandbox']});
    const page = await browser.newPage();
    // Adjustments particular to this page to ensure we hit desktop breakpoint.
    page.setViewport({width: 1920, height: 1080, deviceScaleFactor: 1});

    await page.goto('http://123.126.105.6:9777/api/custom_sso/acs?domain=haizhi&user_info={%22username%22:%22admin%22}&token=8b18585b1bcf125c333a9622143055a4&RelayState=embed/dashboard.html?dashId=dsh_fc8627370c99a1ba1b1f1b9e062b6027%26theme%3Ddark&chartId=ct_fc3c0f9b2da5b5d1c91eeaf9b2907a92', {waitUntil: 'networkidle2'});
   
    //wait for element ready
    await page.waitForSelector('[data-chart-id="ct_fc3c0f9b2da5b5d1c91eeaf9b2907a92"]');
    // await page.waitFor(1000);
    /**
     * Takes a screenshot of a DOM element on the page, with optional padding.
     *
     * @param {!{path:string, selector:string, padding:(number|undefined)}=} opts
     * @return {!Promise<!Buffer>}
     */
    async function screenshotDOMElement(opts = {}) {
        const padding = 'padding' in opts ? opts.padding : 0;
        const path = 'path' in opts ? opts.path : null;
        const selector = opts.selector;

        if (!selector)
            throw Error('Please provide a selector.');

        const rect = await page.evaluate(selector => {
            const element = document.querySelector(selector);
            if (!element)
                return null;
            const {x, y, width, height} = element.getBoundingClientRect();
            return {left: x, top: y, width, height, id: element.id};
        }, selector);

        if (!rect)
            throw Error(`Could not find element that matches selector: ${selector}.`);

        return await page.screenshot({
            path,
            clip: {
                x: rect.left - padding,
                y: rect.top - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2
            }
        });
    }

    await screenshotDOMElement({
        path: 'public/element.png',
        // selector: '[data-chart-id="ct_798324ee527cfffcd241d663b1efd091"]',
        selector: '[data-chart-id="ct_fc3c0f9b2da5b5d1c91eeaf9b2907a92"]',
        //selector: 'svg',
        padding: 0
    });

    browser.close();
})();