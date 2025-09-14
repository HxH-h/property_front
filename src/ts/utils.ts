export const DeviceTYPE = {
    UNKNOWN: 0,
    MOBILE: 1,
    DESKTOP: 2
}
export const BrowserTYPE = {
    UNKNOWN: 0,
    IE: 1,
    CHROME: 2,
    FIREFOX: 3,
    SAFARI: 4,
    OPERA: 5,
    EDGE: 6,
}
// 检测浏览器信息
function checkBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    let browserType = BrowserTYPE.UNKNOWN;
    let deviceType = DeviceTYPE.UNKNOWN;

    // Detect browser type
    if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edg') === -1 && userAgent.indexOf('opr') === -1) {
        browserType = BrowserTYPE.CHROME;
    } else if (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1) {
        browserType = BrowserTYPE.SAFARI
    } else if (userAgent.indexOf('firefox') > -1) {
        browserType = BrowserTYPE.FIREFOX
    } else if (userAgent.indexOf('opera') > -1 || userAgent.indexOf('opr') > -1) {
        browserType = BrowserTYPE.OPERA
    } else if (userAgent.indexOf('edg') > -1) {
        browserType = BrowserTYPE.EDGE
    } else if (userAgent.indexOf('trident') > -1) {
        browserType = BrowserTYPE.IE
    }

    // Detect device type
    if (userAgent.indexOf('mobi') > -1 || userAgent.indexOf('android') > -1 || userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipad') > -1 || userAgent.indexOf('ipod') > -1) {
        deviceType = DeviceTYPE.MOBILE;
    } else {
        deviceType = DeviceTYPE.DESKTOP;
    }

    return { browserType, deviceType };
}

export {
    checkBrowser
}