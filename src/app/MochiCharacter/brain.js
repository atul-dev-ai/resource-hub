// ---- FACE IMAGE MAP ----
// Links each mood name to the PNG file for that face.
// When the mood changes, we look up the file name here.
const IMGS = {
  blink:     'blink.png',     // quick eye-close during idle blinking
  closed:    'closed.png',    // both eyes shut while user types password
  peek:      'peek.png',      // one eye open — triggered when Caps Lock is on
  mad:       'mad.png',       // angry face — wrong password entered
  surprised: 'surprised.png', // shocked/happy face — correct password
  sleepy:    'sleepy.png',    // drowsy face — no activity for 10 seconds
};


// ---- GRAB ELEMENTS FROM THE PAGE ----
// document.getElementById('...') finds an HTML element by its id="" attribute
// so we can read or change it with JS
const imgEyes  = document.getElementById('img-eyes');    // the eyes image layer
const imgExpr  = document.getElementById('img-expr');    // the expression image layer
const charWrap = document.getElementById('charWrap');    // the whole mochi container
const passInput = document.getElementById('passwordInput'); // the password text box
const loginBtn = document.getElementById('loginBtn');    // the login button
const errorMsg = document.getElementById('errorMsg');    // the red error message text
const formCol  = document.querySelector('.form-col');    // the whole left form column (used for shake)


// ---- STATE VARIABLES ----
// These remember what mochi is currently doing between events
let state = 'default';      // current mood — starts as 'default' (normal idle)
let blinkTimer = null;      // stores the blink timer so we can cancel it if needed
let idleTimer  = null;      // stores the idle timer — resets whenever the user does something
let resetTimer = null;      // stores a timer that returns mochi to default after a reaction


// ---- SET STATE / MOOD FUNCTION ----
// The main function that changes how mochi looks.
// Example: setState('mad') makes her look angry, setState('default') returns to normal.
function setState(s) {

  // If we were about to auto-reset to default, cancel that first
  // (skip this check if the new state is 'blink' — blinks don't cancel resets)
  if (resetTimer && s !== 'blink') {
    clearTimeout(resetTimer); // cancel the scheduled reset
    resetTimer = null;
  }

  state = s; // save the new state so other functions can check it

  if (s === 'default') {
    // --- Returning to normal idle ---
    imgEyes.style.display = '';          // show the normal eye layer again
    imgExpr.classList.remove('visible'); // hide any expression overlay
    scheduleNextBlink();                 // restart the random blink cycle
    startIdleTimer();                    // restart the countdown before going sleepy
  } else {
    // --- Showing a specific expression ---
    if (s !== 'blink') {
      imgEyes.style.display = 'none';   // hide the normal eyes so the expression image shows cleanly
    }
    if (IMGS[s]) {                      // only run if this mood exists in our IMGS map
      imgExpr.src = IMGS[s];            // swap in the correct face PNG (e.g. mad.png)
      imgExpr.classList.add('visible'); // add .visible so the expression layer shows (opacity: 1)
    }
  }
}


// ---- BLINK SYSTEM ----
// Mochi blinks randomly every 3–6 seconds.
// The system works in 3 steps: schedule → check → flash

// Step 1: Schedule the next blink after a random delay
function scheduleNextBlink() {
  clearTimeout(blinkTimer); // cancel any existing blink timer first
  // Set a new timer: wait 3000–6000ms, then run doBlink
  blinkTimer = setTimeout(doBlink, 3000 + Math.random() * 3000);
  // Math.random() = a random number from 0 to 1
  // × 3000 = random extra wait of 0–3000ms on top of the base 3000ms
}

// Step 2: Before blinking, confirm mochi is still idle
async function doBlink() {
  if (state !== 'default') {
    scheduleNextBlink(); // not in default mood — skip this blink and reschedule
    return;
  }
  await flashBlink(); // do one blink and wait for it to finish

  // 25% of the time, do a double blink (a tiny pause then blink again)
  if (Math.random() < 0.25) {
    await pause(60); // wait 60 milliseconds
    await flashBlink();
  }

  if (state === 'default') scheduleNextBlink(); // schedule the next blink if still idle
}

// Step 3: Flash the blink image for 140ms then restore the normal eyes
function flashBlink() {
  // We return a Promise so the caller can use "await" and wait for the blink to finish
  return new Promise(res => {
    imgEyes.style.display = 'none';       // hide the normal eyes
    imgExpr.src = IMGS.blink;             // load the blink face image
    imgExpr.classList.add('visible');     // make it visible

    setTimeout(() => {
      // After 140ms (a natural blink speed), hide the blink image
      imgExpr.classList.remove('visible');
      if (state === 'default') imgEyes.style.display = ''; // restore normal eyes
      res(); // signal that the blink is done (resolves the Promise)
    }, 140);
  });
}

// Tiny sleep helper — pauses JS for a given number of milliseconds
// Used like: await pause(60)  — just waits before continuing
function pause(ms) { return new Promise(r => setTimeout(r, ms)); }


// ---- IDLE / SLEEPY SYSTEM ----
// If nobody does anything for 10 seconds, mochi gets sleepy.

// Start (or restart) the countdown to sleepy mode
function startIdleTimer() {
  clearTimeout(idleTimer); // cancel the previous countdown so it resets
  // Wait 10 seconds — if nothing happens, go sleepy
  idleTimer = setTimeout(() => {
    if (state === 'default') setState('sleepy'); // only go sleepy if still idle
  }, 10000); // 10000ms = 10 seconds
}

// Wake mochi up and restart the idle countdown whenever the user does something
function resetIdle() {
  if (state === 'sleepy') setState('default'); // snap out of sleepy mode
  startIdleTimer();                            // restart the 10-second countdown
}

// Listen for any mouse movement or key press — either counts as "activity"
document.addEventListener('mousemove', resetIdle);
document.addEventListener('keydown', resetIdle);


// ---- EYE TRACKING ----
// Makes the eyes follow the mouse cursor around the screen
document.addEventListener('mousemove', (e) => {

  if (state !== 'default') return; // only track in default mood — stop here if showing an expression

  // Get mochi's exact position and size on the screen right now
  const rect = charWrap.getBoundingClientRect();

  // Find the center point of the eyes
  const cx = rect.left + rect.width * 0.5;   // horizontal center of mochi
  const cy = rect.top + rect.height * 0.42;  // slightly above vertical center (where the eyes actually are)

  // How far is the cursor from the eye center?
  const dx = e.clientX - cx; // horizontal distance (negative = cursor is to the left)
  const dy = e.clientY - cy; // vertical distance (negative = cursor is above)

  // Convert dx/dy into a direction angle (in radians)
  const angle = Math.atan2(dy, dx);

  // How far away is the cursor? Cap it at 220px so eyes don't shift too far
  const dist = Math.min(Math.sqrt(dx*dx + dy*dy), 220); // Pythagorean theorem for straight-line distance
  const f = dist / 220; // ratio: 0 = cursor at center, 1 = cursor at max distance

  // Calculate how many pixels to move the eyes
  const rawX = Math.cos(angle) * f * 14;                   // max 14px horizontal movement
  const clampedX = rawX < 0 ? Math.max(rawX, -5) : rawX;  // limit leftward movement to -5px

  // Apply the movement using CSS transform
  imgEyes.style.transform = `translate(${clampedX.toFixed(1)}px,${(Math.sin(angle)*f*10).toFixed(1)}px)`;
  // toFixed(1) = round to 1 decimal place (e.g. 3.7px instead of 3.74821px)
});


// ---- PASSWORD FIELD REACTIONS ----

// When the user clicks into the password box
passInput.addEventListener('focus', () => {
  // "focus" fires when the input becomes active (clicked into)
  if (state === 'default' || state === 'sleepy') setState('closed'); // cover eyes
});

// When the user clicks away from the password box
passInput.addEventListener('blur', () => {
  // "blur" fires when the input loses focus (clicked somewhere else)
  if (state === 'closed' || state === 'peek') setState('default'); // uncover eyes
});

// While typing in the password box — check if Caps Lock is on
passInput.addEventListener('keyup', (e) => {
  // "keyup" fires after each key release inside the input
  const caps = e.getModifierState('CapsLock'); // true if Caps Lock is currently on

  if (caps && (state === 'closed' || state === 'default')) {
    setState('peek'); // Caps Lock on — mochi peeks with one eye (she's suspicious!)
  } else if (!caps && state === 'peek') {
    // Caps Lock turned off — go back to closed if still in the box, or default if not
    setState(document.activeElement === passInput ? 'closed' : 'default');
    // document.activeElement = whichever element has focus right now
  }
});


// ---- LOGIN BUTTON ----
loginBtn.addEventListener('click', () => {
  const pass = passInput.value; // read whatever the user typed in the password box

  if (!pass || pass === 'wrong') {
    // Password is empty OR the word "wrong" — treat as incorrect
    setState('mad');                          // mochi gets angry
    errorMsg.classList.add('visible');        // show the red error message

    // Shake the form — remove the class first so the animation can replay if clicked again
    formCol.classList.remove('shake');
    void formCol.offsetWidth;                 // forces the browser to notice the class was removed
                                              // (without this, adding .shake right back might not replay)
    formCol.classList.add('shake');           // play the shake animation

    resetTimer = setTimeout(() => setState('default'), 2500); // calm down after 2.5 seconds

  } else {
    // Any non-empty password = correct (for demo purposes)
    setState('surprised');                    // mochi is shocked/happy
    errorMsg.classList.remove('visible');     // hide any previous error

    resetTimer = setTimeout(() => setState('default'), 1500); // return to normal after 1.5 seconds
  }
});


// ---- TAB SWITCHER (Login / Signup) ----
// Clicking a tab adds .active to it and removes .active from the other one

document.getElementById('tabLogin').addEventListener('click', () => {
  document.getElementById('tabLogin').classList.add('active');    // highlight Login
  document.getElementById('tabSignup').classList.remove('active'); // unhighlight Signup
});

document.getElementById('tabSignup').addEventListener('click', () => {
  document.getElementById('tabSignup').classList.add('active');   // highlight Signup
  document.getElementById('tabLogin').classList.remove('active');  // unhighlight Login
});


// ---- DARK MODE TOGGLE ----

// document.documentElement = the <html> tag — we put data-theme on it
const html     = document.documentElement;
const sunIcon  = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

// Switch themes: pass true for dark, false for light
function applyTheme(dark) {
  // Set data-theme="dark" or data-theme="light" on the <html> tag
  // The CSS [data-theme="dark"] block kicks in automatically
  html.setAttribute('data-theme', dark ? 'dark' : 'light');

  // Toggle the .active class — only one icon should be highlighted at a time
  sunIcon.classList.toggle('active', !dark); // sun is active when NOT in dark mode
  moonIcon.classList.toggle('active', dark); // moon is active when IN dark mode
}

// On page load — check if the user previously chose dark mode and apply it right away
applyTheme(localStorage.getItem('theme') === 'dark');
// localStorage is like a small save file in the browser — remembers settings between visits

// When the toggle is clicked — flip the current theme
document.getElementById('themeToggle').addEventListener('click', () => {
  const isDark = html.getAttribute('data-theme') === 'dark'; // are we in dark mode right now?
  applyTheme(!isDark);                                        // switch to the opposite
  localStorage.setItem('theme', !isDark ? 'dark' : 'light'); // save the new choice
});


// ---- CLICKING MOCHI ----
// Tapping/clicking the character makes her grumpy for a moment
charWrap.addEventListener('click', () => {
  setState('mad'); // she didn't like that
  resetTimer = setTimeout(() => setState('default'), 700); // calm down after 700ms
});


// ---- START EVERYTHING ----
// This one line kicks off the whole system — starts in idle, begins the blink timer
setState('default');
