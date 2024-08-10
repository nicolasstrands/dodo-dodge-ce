import timeStates from "../utils/timeStates";

export default function loadSprites() {
  loadSprite("dodo", "sprites/Dodo_10x.png", {
    sliceX: 4,
    sliceY: 3,
    anims: {
      idle: {
        from: 0,
        to: 3,
        speed: 5,
        loop: true,
      },
      walk: {
        from: 4,
        to: 7,
        speed: 10,
        loop: true,
      },
      jump: {
        from: 10,
        to: 11,
        speed: 10,
        loop: false,
      },
    },
  });

  loadSprite("forest", "tiles/Tileset_Forest_10x.png", {
    sliceX: 4,
    sliceY: 1,
    anims: {
      move: {
        from: 0,
        to: 3,
        loop: true,
        speed: 5,
      },
    },
  });

  loadSprite("ground", "tiles/Tileset_Cropped_10x.png", {
    sliceX: 2,
    sliceY: 1,
    anims: {
      idle: {
        from: 0,
        to: 0,
        loop: true,
        speed: 5,
      },
      move: {
        from: 0,
        to: 1,
        loop: true,
        speed: 5,
      },
    },
  });

  loadSprite("trees", "tiles/Tileset_10x.png", {
    sliceX: 4,
    sliceY: 3,
  });

  loadSprite("hunter", "sprites/Hunter_10x.png", {
    sliceX: 4,
    sliceY: 1,
    anims: {
      walk: {
        from: 0,
        to: 3,
        loop: true,
        speed: 7,
      },
    },
  });

  loadSprite("sky", "layers/sky_lightened.png");
  loadSprite("clouds", "layers/Cloud_10x.png");
  loadSprite("mountains", "layers/Mountain_10x.png");

  loadSprite("title", "title.png");
  loadSprite("mscc-logo", "mscc.png");
  loadSprite("ayo", "sprites/ayo.png");

  // load all time states backgrounds
  for (const state of timeStates()) {
    loadSprite(state, `bgs/${state}.png`);
  }
}
