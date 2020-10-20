const puppeteer = require('puppeteer');
const fs = require("fs");
const path = require('path')
const url = require('url')

async function cropper (dmcHref) {
    console.log('dmcHref', dmcHref)
    const browser = await puppeteer.launch({args: ['--no-sandbox']});
    const page = await browser.newPage()
    const urlObj = url.parse(dmcHref)
    console.log('urlObj', urlObj)
    const queryObj = getQueryObj(urlObj.query)
    console.log('queryObj', queryObj)
    const chartId = queryObj && queryObj.chartId
    console.log('chartId', chartId)
    if(!chartId) {
      console.log(`没有chartId`);
      return {
        status: 500,
        msg: `没有chartId`
      }
    }
    // Adjustments particular to this page to ensure we hit desktop breakpoint.
    page.setViewport({width: 1920, height: 1080, deviceScaleFactor: 1});
    
    // await page.goto('http://123.126.105.6:9777/api/custom_sso/acs?domain=haizhi&user_info={%22username%22:%22admin%22}&token=8b18585b1bcf125c333a9622143055a4&RelayState=embed/dashboard.html?dashId=dsh_fc8627370c99a1ba1b1f1b9e062b6027%26theme%3Ddark&chartId=ct_fc3c0f9b2da5b5d1c91eeaf9b2907a92', {waitUntil: 'networkidle2'});
    await page.goto(dmcHref, {waitUntil: 'networkidle2'});
   
    //wait for element ready
    await page.waitForSelector(`[data-chart-id=${chartId}]`);
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

        if (!selector) {
          console.log(`Please provide a selector.`);
          return {
            status: 500,
            msg: `Please provide a selector.`
          }
        }

        const rect = await page.evaluate(selector => {
            const element = document.querySelector(selector);
            if (!element)
                return null;
            const {x, y, width, height} = element.getBoundingClientRect();
            return {left: x, top: y, width, height, id: element.id};
        }, selector);

        if (!rect) {
          console.log(`没有找到chartId: ${selector}对应的dom节点`);
          return {
            status: 500,
            msg: `没有找到chartId: ${selector}对应的dom节点`
          }
        }

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
        path: `public/${chartId}.png`,
        selector: `[data-chart-id=${chartId}]`,
        //selector: 'svg',
        padding: 0
    });
    
    browser.close();
    return {
      status: 0,
      data: `public/${chartId}.png`
    }
    // return img2Base64('public/element.png')
};
// 静态图片转base64
async function img2Base64(imgPath) {
 
  let filePath = path.resolve(imgPath);
 
  let data = fs.readFileSync(filePath);
  data = new Buffer(data).toString('base64');
  console.log('data', data)
  let base64 = 'data:image/png;base64,' + data;
  return base64
}
// query字符串转obj
function getQueryObj(queryStr) {
  if (queryStr) {
    const searchItem = queryStr.split('&')
    const res = {}

    searchItem.forEach((item) => {
      const key = item.split('=')[0]
      const val = item.split('=')[1]
      res[key] = val
    })
    return res
  }
  return null
}

module.exports = cropper;