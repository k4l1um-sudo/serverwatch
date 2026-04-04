(function () {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('side-menu');

  if (!toggle || !menu) {
    return;
  }

  function setOpen(isOpen) {
    toggle.classList.toggle('open', isOpen);
    menu.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));
  }

  toggle.addEventListener('click', function () {
    const isOpen = menu.classList.contains('open');
    setOpen(!isOpen);
  });

  document.addEventListener('click', function (event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const clickedToggle = target.closest('#menu-toggle');
    const clickedMenu = target.closest('#side-menu');

    if (!clickedToggle && !clickedMenu && menu.classList.contains('open')) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menu.classList.contains('open')) {
      setOpen(false);
    }
  });

  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      setOpen(false);
    });
  });
})();
