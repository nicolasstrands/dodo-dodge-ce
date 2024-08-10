import loadSounds from "../game/sounds";
import loadSprites from "../game/sprites";

export default function () {
  loadSounds();

  loadFont("arcade", "fonts/arcadeclassic.ttf", { size: 120 });

  loadShader(
    "saturate",
    undefined,
    `
    uniform float u_time;
    uniform vec2 u_pos;
    uniform vec2 u_size;
    uniform vec3 u_color;

    vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
        vec4 c = def_frag();
      vec4 col = vec4(u_color/255.0, 1);
      return c + vec4(mix(vec3(0), col.rgb, u_time), 0);
    }
  `
  );

  loadShader(
    "pixelate",
    undefined,
    `
    uniform float u_size;
    uniform vec2 u_resolution;

    vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
      if (u_size <= 0.0) return def_frag();
      vec2 nsize = vec2(u_size / u_resolution.x, u_size / u_resolution.y);
      float x = floor(uv.x / nsize.x + 0.5);
      float y = floor(uv.y / nsize.y + 0.5);
      vec4 c = texture2D(tex, vec2(x, y) * nsize);
      return c * color;
    }
    `
  );

  loadSprites();
}
