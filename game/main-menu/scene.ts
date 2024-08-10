import type { AudioPlay, GameObj } from "kaplay"
import { REGISTRATION_SCENE } from "../registration/scene"
import { LEADERBOARD_SCENE_NAME } from "../leaderboard/scene"

const eventEmitter = useEventEmitter()

const MAIN_MENU_SCENE = "splash"

export default async function setMainMenuScene(
  mainMenuMusic: AudioPlay,
  gameMusic: AudioPlay,
  version: string,
  floorHeight: number
) {
  scene(MAIN_MENU_SCENE, () =>
    setScene(mainMenuMusic, gameMusic, version, floorHeight)
  )
}

function setScene(
  mainMenuMusic: AudioPlay,
  gameMusic: AudioPlay,
  version: string,
  floorHeight: number
) {
  let splashTime = 0;
  gameMusic.paused = true;

  mainMenuMusic.paused = true;
  mainMenuMusic.volume = 0.25;
  mainMenuMusic.loop = true;

  useTimeBasedBG();

  addHeaderText(version);

  const msccLogo = addMSCCLogo(floorHeight);
  const gameTitle = addGameTitleLogo();
  addGround(floorHeight);
  addTrees(floorHeight);

  onUpdate(() => {
    setCursor("default");
    splashTime += dt();

    gameTitle.pos.y =
      Math.cos(splashTime * Math.PI) * 10 + (isPlatformMobile() ? 70 : 50);
  });

  addDodo(floorHeight);

  const menuOptions = ["Start", "Leaderboard", "Register", "Logout"];
  let selectedOption = 0;

  const screenMenuOptions: (GameObj<any> | null)[] = menuOptions
    .map((option, index) => {
      const name = localStorage.getItem("name");

      if (name) {
        option = index === 2 ? "Change Player" : option;
      }

      if (!name) {
        if (index === 3) {
          return null;
        }
      }

      return add([
        text(option, {
          font: "arcade",
          size: 35,
        }),
        pos(width() / 2, height() / 2.6 + index * 35),
        anchor("center"),
        area(),
        scale(1),
        z(10),
        opacity(selectedOption === index ? 1 : 0.5),
      ]);

      // return null
    })
    .filter(Boolean);

  onKeyPress("up", () => {
    selectedOption = Math.max(0, selectedOption - 1);

    //change opacity of selected option
    screenMenuOptions.forEach((option, index) => {
      if (!option) return;
      option.opacity = selectedOption === index ? 1 : 0.5;
    });

    play("blip", {
      volume: 0.1,
    });
  });

  onKeyPress("down", () => {
    selectedOption = Math.min(screenMenuOptions.length - 1, selectedOption + 1);

    //change opacity of selected option
    screenMenuOptions.forEach((option, index) => {
      if (!option) return;
      option.opacity = selectedOption === index ? 1 : 0.5;
    });

    play("blip", {
      volume: 0.1,
    });
  });

  onKeyPress("left", () => {
    play("blip", {
      volume: 0.1,
    });
  });

  onKeyPress("right", () => {
    play("blip", {
      volume: 0.1,
    });
  });

  onKeyPress("b", () => {
    play("blip", {
      volume: 0.1,
    });
  });

  onKeyPress("a", () => {
    play("blip", {
      volume: 0.1,
    });
  });

  onKonamiCode(() => {
    console.log("konami code activated");
    eventEmitter.emit("shake-baby-shake");
  });

  // enter keypress handling
  onKeyPress("enter", () => {
    handlingMenuOption(selectedOption);
  });

  onKeyPress("space", () => {
    handlingMenuOption(selectedOption);
  });

  onTouchStart((pos, t) => {
    screenMenuOptions.forEach((option, index) => {
      if (!option) return;
      if (option.isHovering()) {
        handlingMenuOption(index);
      }
    });
  });
}

function addHeaderText(version: string) {
  add([
    text(`v${version}`, {
      font: "arcade",
      size: 16,
      align: "right",
      width: width() - 48,
    }),
    pos(24, 24),
    z(100),
    fixed(),
  ])

  add([
    text("Community Edition", {
      font: "arcade",
      size: 16,
      align: "left",
      width: width() - 48,
    }),
    pos(24, 24),
    z(100),
    fixed(),
  ])
}

function addMSCCLogo(floorHeight: number) {
  return add([
    sprite("mscc-logo", {
      width: isPlatformMobile() ? width() / 4 : width() / 8,
    }),
    pos(width() / 2, height() - floorHeight * 2 - 25),
    anchor("bot"),
    scale(0.5),
    z(10),
  ])
}

function addGameTitleLogo() {
  return add([
    sprite("title", {
      width: isPlatformMobile() ? (width() / 3) * 2 : width() / 2,
    }),
    pos(width() / 2, isPlatformMobile() ? 70 : 50),
    anchor("top"),
  ])
}

function addGround(floorHeight: number) {
  add([
    sprite("ground", {
      tiled: true,
      width: width() * 1.5,
      height: floorHeight,
      frame: 0,
      anim: "idle",
    }),
    area(),
    outline(1),
    pos(0, height() - floorHeight * 2),
    body({ isStatic: true }),
    z(5),
    scale(0.75),
  ])
}

function addTrees(floorHeight: number) {
  const treeSpacing = 320 // Space between trees in pixels
  const numberOfTrees = isPlatformMobile() ? 1 : 3

  for (let i = 0; i < numberOfTrees; i++) {
    add([
      sprite("trees", {
        frame: 1,
      }),
      area(),
      pos(i * treeSpacing, height() - floorHeight * 7), // Adjust position based on index
      z(3),
      opacity(0.7),
    ]);
  }
}

function addDodo(floorHeight: number) {
  const player = add([
    sprite("dodo"),
    pos(width() / 8, height() - floorHeight * 2),
    rotate(0),
    anchor("center"),
    area({ scale: vec2(0.65, 1), offset: vec2(10, 0) }),
    body(),
    doubleJump(1),
    z(10),
    scale(isPlatformMobile() ? 0.6 : 0.75),
  ])

  player.flipX = true

  player.play("idle")
}

const handlingMenuOption = (selectedOption: any) => {
  const name = localStorage.getItem("name")
  switch (selectedOption) {
    case 0:
      if (!name) {
        go(REGISTRATION_SCENE)
        break
      } else {
        eventEmitter.emit("reset-game")
        go("game")
      }
      break
    case 1:
      eventEmitter.emit("reload-highscores")
      go(LEADERBOARD_SCENE_NAME)
      break
    case 2:
      go(REGISTRATION_SCENE)
      break
    case 3:
      localStorage.removeItem("name")
      localStorage.removeItem("email")
      go("splash")
      break
  }
}
