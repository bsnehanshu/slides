import { exportToSvg } from "@excalidraw/excalidraw";
window.doExport = async (scene) => {
  const svg = await exportToSvg({
    elements: scene.elements,
    appState: { exportBackground: true, viewBackgroundColor: "#ffffff", exportEmbedScene: true, exportWithDarkMode: false },
    files: {},
    exportPadding: 30,
  });
  return svg.outerHTML;
};
