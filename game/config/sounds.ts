export default function loadSounds() {
  loadSound("oof", "sounds/oof.mp3")
  loadSound("jump", "sounds/jump.wav")
  loadSound("crow", "sounds/dodo-die.mp3")

  loadSound("bgm", "sounds/bgm.mp3")
  loadSound("slow_bgm", "sounds/slow_bgm.mp3")
  loadSound("blip", "sounds/blip_select.wav")

  for (let i = 0; i < 5; i++) {
    loadSound(`hunter_oof-0${i + 1}`, `sounds/hunter_oof-0${i + 1}.wav`)
  }
}
