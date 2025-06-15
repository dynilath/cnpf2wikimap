// Leaflet Bundle - 包含 Leaflet 及其相关插件
import * as L from "leaflet";
import "leaflet-contextmenu";
import "leaflet-easybutton";

// 将 Leaflet 暴露到全局
if (typeof window !== "undefined") {
  window.L = L;
}

// 导出所有内容
export default L;
export * from "leaflet";
