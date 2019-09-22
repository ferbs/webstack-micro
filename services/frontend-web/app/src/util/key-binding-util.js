const Mousetrap = require('./vendor-avoiding-package/mousetrap.min');


// See https://craig.is/killing/mice

export function addKeyBindings(keyBindings) {
  removeKeyBindings(keyBindings);
  Object.keys(keyBindings).forEach(keyBinding => {
    const fn = keyBindings[keyBinding];
    Mousetrap.bind(keyBinding, fn);
  });
}

export function removeKeyBindings(keyBindings) {
  Object.keys(keyBindings).forEach(keyBinding => {
    Mousetrap.unbind(keyBinding);
  });
}


