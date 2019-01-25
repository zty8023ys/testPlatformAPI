const url = "https://serene-keller-2d034d.netlify.com"
const onlineMap = {}
const addToOnlineMap = (gid, version) => {
    if (typeof (onlineMap[gid]) !== undefined) {
        console.error("gid:", gid, "重复配置!");
        debugger;
    }
    onlineMap[gid] = version || "";
}
addToOnlineMap(9);
addToOnlineMap(1, 1);
addToOnlineMap(14, 2);
window.getPlatformAPIUrl = (gid) => {
    const version = onlineMap[gid];
    if (!version) {
        return url + "/PlatformAPI_browserify.min.js";
    }
    return url + "/PlatformAPI_browserify" + version + ".min.js";
}