export default function () {
  if (typeof document === "undefined") {
    return 800;
  }
  // if document clientWidth is greater than 800, return 800, else return document clientWidth
  return document.documentElement.clientWidth > 800
    ? 800
    : document.documentElement.clientWidth;
}
