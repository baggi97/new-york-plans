const supported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

export function hapticTap() {
  if (supported) navigator.vibrate(10);
}

export function hapticSuccess() {
  if (supported) navigator.vibrate([10, 50, 20]);
}
