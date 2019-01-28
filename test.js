const url = "https://serene-keller-2d034d.netlify.com"
const onlineMap = {}
const addToOnlineMap = (gid, version) => {
    if (typeof (onlineMap[gid]) !== typeof(void 0)) {
        console.error("gid:", gid, "重复配置!");
        debugger;
    }
    onlineMap[gid] = version || "";
}
addToOnlineMap(9, 1);
var initPlatformAPI = (gid) => {
    const version = onlineMap[gid];
    const PlatformAPIUrl = url + (version ? "/PlatformAPI_browserify" + version + ".min.js" : "/PlatformAPI_browserify.min.js");
    var loadNode = document.createElement('script');
    loadNode.async = false;
    loadNode.src = PlatformAPIUrl;
    document.head.appendChild(loadNode);
    loadNode.onload=()=>{
      PlatformAPI.init(gid);
    }
}
