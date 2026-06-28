const eventEmitter = useEventEmitter()

eventEmitter.on("<some-event>", (someOptionalValue: any) => {
  doSomeAction(someOptionalValue)
})

const SOME_SCENE_NAME = "<some-scene-name>"

export default async function setTheScene() {
  scene(SOME_SCENE_NAME, () => setScene())
}

function doSomeAction(someOptionalValue: any) {
  console.log("Doing some action", someOptionalValue)
}

function setScene() {
  addTitle()
  doTheFirstMainThing()
  doTheOptionalOtherThing()
  addGoBackButton()
}

function addTitle() {
  add([
    text("<Some scene title>", {
      font: "arcade",
      size: 48,
    }),
    pos(width() / 2, 64),
    anchor("center"),
  ])
}

function doTheFirstMainThing() {
  console.log("Doing the first main thing")
}

function doTheOptionalOtherThing() {
  console.log("Doing the optional other thing")
}

function addGoBackButton() {
  const button = add([
    text("Go back", {
      font: "arcade",
      size: 24,
    }),
    pos(width() / 2, height() - 64),
    anchor("center"),
    area(),
    color(0.5, 0.5, 1),
  ])

  button.onClick(() => {
    go("splash")
  })
}
