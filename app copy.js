let standalone = window.navigator.standalone === true
  || window.matchMedia('(display-mode: standalone)').matches
  || localStorage.getItem('standalone');
let btnAddToHome;
let deferredPrompt;
let birthDate;
const iOS = (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);

console.log('STANDALONE:', standalone); // eslint-disable-line no-console

const installed = () => document.body.classList.add('installed');
const hasAccess = () => document.body.classList.add('access');

const cache = {};

const updateDate = () => {
  const now = new Date();
  let seconds = now.getSeconds() - birthDate.getSeconds();
  let minutes = now.getMinutes() - birthDate.getMinutes() - (seconds < 0 ? 1 : 0);
  let hours = now.getHours() - birthDate.getHours() - (minutes < 0 ? 1 : 0);
  let days = now.getDate() - birthDate.getDate() - (hours < 0 ? 1 : 0);
  let months = now.getMonth() - birthDate.getMonth() - (days < 0 ? 1 : 0);
  const years = now.getFullYear() - birthDate.getFullYear() - (months < 0 ? 1 : 0);
  if (seconds < 0) seconds += 60;
  if (minutes < 0) minutes += 60;
  if (hours < 0) hours += 24;
  if (days < 0) days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  if (months < 0) months += 12;
  if (cache.years !== years) {
    document.querySelector('.years').innerHTML = years ? `<span class="digit">${years}</span> <span>jaar</span>` : '';
    cache.years = years;
  }
  if (cache.months !== months) {
    document.querySelector('.months').innerHTML = months ? `<span class="digit">${months}</span> <span>${months === 1 ? 'maand' : 'maanden'}</span>` : '<span class="digit">&nbsp;</span> <span> </span>';
    cache.months = months;
  }
  if (cache.days !== days) {
    document.querySelector('.days').innerHTML = `<span class="digit">${days}</span> <span>${days === 1 ? 'dag' : 'dagen'}</span>`;
    cache.days = days;
  }
  if (cache.hours !== hours) {
    document.querySelector('.hours').innerHTML = `<span class="digit">${hours}</span> <span>uur</span>`;
    cache.hours = hours;
  }
  if (cache.minutes !== minutes) {
    document.querySelector('.minutes').innerHTML = `<span class="digit">${minutes}</span> <span>${minutes === 1 ? 'minuut' : 'minuten'}</span>`;
    cache.minutes = minutes;
  }
  // if (cache.seconds !== seconds) {
  //   document.querySelector('.seconds').innerHTML = `<span class="digit">${seconds}</span> <span>${seconds === 1 ? 'seconde' : 'seconden'}</span>`;
  //   cache.seconds = seconds;
  // }
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
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
  if (window.location.hostname === 'localhost') {
    const livereload = document.createElement('script');
    livereload.src = 'http://localhost:35730/livereload.js?snipver=1';
    document.body.appendChild(livereload);
  }
  if (standalone || window.location.search === '?q=fvnKDRlHIIw9F6dQ2RCA') {
    hasAccess();
  }
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
        hasAccess();
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const choiceResult = await deferredPrompt.userChoice;
          console.log('User prompt outcome', choiceResult.outcome); // eslint-disable-line no-console
        }
      });
    });
  }
  manifest = JSON.parse(await fetch(document.head.querySelector('[rel="manifest"]').href).then(res => res.text()));
  birthDate = new Date(manifest.birthDate);
  setInterval(updateDate, 1000);
  updateDate();
});
