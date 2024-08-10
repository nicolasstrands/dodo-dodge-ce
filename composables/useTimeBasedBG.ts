export default function () {
  // get the current time
  const date = new Date();
  const hours = date.getHours();

  // define the time states
  const timeStates = [
    "earlymorning",
    "morning",
    "day",
    "sunset",
    "latesunset",
    "earlynight",
    "deepnight",
  ];

  // determine the current time state
  let state = "day";
  if (hours >= 5 && hours < 6) {
    state = "earlymorning";
  } else if (hours >= 6 && hours < 8) {
    state = "morning";
  } else if (hours >= 8 && hours < 16) {
    state = "day";
  } else if (hours >= 16 && hours < 18) {
    state = "sunset";
  } else if (hours >= 18 && hours < 19) {
    state = "latesunset";
  } else if (hours >= 19 && hours < 21) {
    state = "earlynight";
  } else {
    state = "deepnight";
  }

  // add background for the current time state
  return add([
    sprite(state, {
      width: width(),
      height: height(),
    }),
    z(-1),
    pos(0, 0),
  ]);
}
