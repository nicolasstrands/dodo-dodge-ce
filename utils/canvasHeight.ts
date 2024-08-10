export default function () {
  if (typeof document === "undefined") {
    return 800;
  }

  return document.documentElement.clientWidth > 800
    ? 800
    : document.documentElement.clientHeight;
}
