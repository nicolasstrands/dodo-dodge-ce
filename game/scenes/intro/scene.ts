import type { GameObj } from "kaplay";

const eventEmitter = useEventEmitter()

eventEmitter.on("<some-event>", (someOptionalValue: any) => {
  doSomeAction(someOptionalValue)
})

const SOME_SCENE_NAME = "intro"

export default async function setIntroScene(floorHeight: number) {
  scene(SOME_SCENE_NAME, () => setScene(floorHeight));
}

function doSomeAction(someOptionalValue: any) {
  console.log("Doing some action", someOptionalValue)
}

function setScene(floorHeight: number) {
  addBG();
  // addGoBackButton();
  addDodo(floorHeight);
}

function addBG() {
  const [r, g, b] = [0, 0, 0]
  add([
    rect(width(), height()),
    pos(width() / 2, height() / 2),
    anchor("center"),
    color(r, g, b),
    z(-1),
  ]);
}

function addDodo(floorHeight: number) {
  const player = add([
    sprite("dodo"),
    pos(width() / 2, height() / 2),
    rotate(0),
    anchor("center"),
    area({ scale: vec2(0.65, 1), offset: vec2(10, 0) }),
    body(),
    doubleJump(1),
    offscreen({ destroy: true, hide: false }),
    z(10),
    scale(isPlatformMobile() ? 0.6 : 0.75),
    shader("saturate", () => ({
      u_time: 1,
      u_color: WHITE,
    })),
    "dodo",
  ]) as any;

  player.flipX = true;
  player.play("idle");

  const SPEED = 120;
  const JUMP_FORCE = 240;

  setGravity(240);

  // Add a platform
  add([
    rect(width(), 24),
    area(),
    outline(1),
    pos(0, height() / 1.5),
    body({ isStatic: true }),
    color(0, 0, 0),
  ]);

  // Switch to "idle" or "run" animation when player hits ground
  player.onGround(() => {
    if (!isKeyDown("left") && !isKeyDown("right")) {
      player.play("idle");
    } else {
      player.play("walk");
    }
  });

  onKeyPress("space", () => {
    if (player.isGrounded()) {
      player.jump(JUMP_FORCE);
      player.play("jump");
    }
  });

  onKeyDown("left", () => {
    player.move(-SPEED, 0);
    player.flipX = false;
    // .play() will reset to the first frame of the anim, so we want to make sure it only runs when the current animation is not "run"
    if (player.isGrounded() && player.curAnim() !== "walk") {
      player.play("walk");
    }
  });

  onKeyDown("right", () => {
    player.move(SPEED, 0);
    player.flipX = true;
    if (player.isGrounded() && player.curAnim() !== "walk") {
      player.play("walk");
    }
  });
  ["left", "right"].forEach((key: any) => {
    onKeyRelease(key, () => {
      // Only reset to "idle" if player is not holding any of these keys
      if (player.isGrounded() && !isKeyDown("left") && !isKeyDown("right")) {
        player.play("idle");
      }
    });
  });

  player.onExitScreen(() => {
    go("splash");
  });
}

function addGoBackButton() {
  const button = add([
    text("Go to main menu", {
      font: "arcade",
      size: 24,
    }),
    pos(width() / 2, height() - 64),
    anchor("center"),
    area(),
  ])

  button.onClick(() => {
    go("splash")
  })
}
