import "leaflet";
import "leaflet-contextmenu";
import "leaflet-easybutton";

L.easyButton = L.easyButton;
L.easyBar = L.easyBar;

// 将 Leaflet 暴露到全局
if (typeof window !== "undefined") {
  window.L = L;
}
