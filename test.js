const url = "https://serene-keller-2d034d.netlify.com"
const onlineMap = {}
const addToOnlineMap = (gid, version) => {
    if (typeof (onlineMap[gid]) !== typeof(void 0)) {
        console.error("gid:", gid, "重复配置!");
        debugger;
    }
    onlineMap[gid] = version || "";
}
addToOnlineMap(9);
addToOnlineMap(1, 1);
addToOnlineMap(14, 2);
window.getPlatformAPIUrl = (gid) => {
    const uu = () => {
        const version = onlineMap[gid];
        if (!version) {
            return url + "/PlatformAPI_browserify.min.js";
        }
        return url + "/PlatformAPI_browserify" + version + ".min.js";
    }
    var loadNode = document.createElement('script');
    loadNode.async = false;
    loadNode.src = uu();
    document.head.appendChild(loadNode);
    loadNode.onload=()=>{
      PlatformAPI.init(gid);
    }
}
