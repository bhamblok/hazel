let standalone = window.navigator.standalone === true
  || window.matchMedia('(display-mode: standalone)').matches
  || localStorage.getItem('standalone');
let btnAddToHome;
let deferredPrompt;
let manifest;
const iOS = (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);

console.log('STANDALONE:', standalone); // eslint-disable-line no-console

const installed = () => document.body.classList.add('installed');
// const hasAccess = () => document.body.classList.add('access');

const cache = {};

let seconds = 0;
let minutes = 0;
let hours = 0;
let days = 0;
let weeks = 0;
let months = 0;
let years = 0;

Date.prototype.getWeek = function getWeek() { // eslint-disable-line no-extend-native
  const onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

const updateDate = (name) => {
  const now = new Date();
  const birthDate = new Date(manifest[`birthDate-${name}`]);
  weeks = Math.floor((now - birthDate) / 1000 / 60 / 60 / 24 / 7);
  if (now > birthDate) {
    seconds = now.getSeconds() - birthDate.getSeconds();
    minutes = now.getMinutes() - birthDate.getMinutes() - (seconds < 0 ? 1 : 0);
    hours = now.getHours() - birthDate.getHours() - (minutes < 0 ? 1 : 0);
    days = now.getDate() - birthDate.getDate() - (hours < 0 ? 1 : 0);
    months = now.getMonth() - birthDate.getMonth() - (days < 0 ? 1 : 0);
    years = now.getFullYear() - birthDate.getFullYear() - (months < 0 ? 1 : 0);
    if (seconds < 0) seconds += 60;
    if (minutes < 0) minutes += 60;
    if (hours < 0) hours += 24;
    if (days < 0) days += new Date(now.getFullYear(), now.getMonth() - 1, 0).getDate();
    if (months < 0) months += 12;
  } else {
    seconds = birthDate.getSeconds() - now.getSeconds();
    minutes = birthDate.getMinutes() - now.getMinutes() - (seconds < 0 ? 1 : 0);
    hours = birthDate.getHours() - now.getHours() - (minutes < 0 ? 1 : 0);
    days = birthDate.getDate() - now.getDate() - (hours < 0 ? 1 : 0);
    months = birthDate.getMonth() - now.getMonth() - (days < 0 ? 1 : 0);
    years = birthDate.getFullYear() - now.getFullYear() - (months < 0 ? 1 : 0);
    if (seconds < 0) seconds += 60;
    if (minutes < 0) minutes += 60;
    if (hours < 0) hours += 24;
    if (days < 0) days += new Date(now.getFullYear(), now.getMonth() - 1, 0).getDate();
    if (months < 0) months += 12;
    document.querySelector(`#${name} .years`).innerHTML = '<span class="digit"></span> <span>... nog</span>';
    if (cache.years !== years) {
      cache.years = years;
    }
  }
  document.querySelector(`#${name} .years`).innerHTML = years ? `<span class="digit">${years}</span> <span>jaar</span>` : `<span class="weeks">(${weeks}</span> <span>${weeks === 1 ? 'week' : 'weken'})</span>`;
  if (cache.years !== years) {
    cache.years = years;
  }
  document.querySelector(`#${name} .months`).innerHTML = (years || months) ? `<span class="digit">${months}</span> <span>${months === 1 ? 'maand' : 'maanden'}</span>` : '<span class="digit">&nbsp;</span> <span> </span>';
  if (cache.months !== months) {
    cache.months = months;
  }
  if (now < birthDate) {
    document.querySelector(`#${name} .years`).innerHTML = `<span class="weeks">(... nog</span> <span>${weeks} ${weeks === 1 ? 'week' : 'weken'})</span>`;
  }
  if (cache.weeks !== weeks) {
    cache.weeks = weeks;
  }
  document.querySelector(`#${name} .days`).innerHTML = `<span class="digit">${days}</span> <span>${days === 1 ? 'dag' : 'dagen'}</span>`;
  if (cache.days !== days) {
    cache.days = days;
  }
  document.querySelector(`#${name} .hours`).innerHTML = `<span class="digit">${hours}</span> <span>uur</span>`;
  if (cache.hours !== hours) {
    cache.hours = hours;
  }
  document.querySelector(`#${name} .minutes`).innerHTML = `<span class="digit">${minutes}</span> <span>${minutes === 1 ? 'minuut' : 'minuten'}</span>`;
  if (cache.minutes !== minutes) {
    cache.minutes = minutes;
  }
};

const installable = new Promise((resolve) => {
  window.addEventListener('beforeinstallprompt', async (e) => {
    e.preventDefault();
    deferredPrompt = e;
    resolve();
  });
  resolve();
});

window.addEventListener('appinstalled', () => {
  standalone = true;
  installed();
  console.log('APP INSTALLED'); // eslint-disable-line no-console
  console.log('STANDALONE:', standalone); // eslint-disable-line no-console
});

window.addEventListener('load', async () => {
  // Registering Service Worker
  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.register('/sw.js');
  // }
  if (window.location.hostname === 'localhost') {
    const livereload = document.createElement('script');
    livereload.src = 'http://localhost:35730/livereload.js?snipver=1';
    document.body.appendChild(livereload);
  }
  // if (standalone || window.location.search === '?q=fvnKDRlHIIw9F6dQ2RCA') {
  //   hasAccess();
  // }
  if (standalone) {
    installed();
  } else if (iOS) {
    document.querySelector('.install.install-android').style.display = 'none';
  } else {
    document.querySelector('.install.install-ios').style.display = 'none';
    btnAddToHome = document.querySelector('.install button');
    installable.then(() => {
      btnAddToHome.addEventListener('click', async () => {
        localStorage.setItem('standalone', true);
        installed();
        // hasAccess();
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const choiceResult = await deferredPrompt.userChoice;
          console.log('User prompt outcome', choiceResult.outcome); // eslint-disable-line no-console
        }
      });
    });
  }
  manifest = JSON.parse(await fetch(document.head.querySelector('[rel="manifest"]').href).then((res) => res.text()));
  setInterval(() => {
    updateDate('hazel');
    updateDate('maries');
  }, 1000);
  updateDate('hazel');
  updateDate('maries');
});
