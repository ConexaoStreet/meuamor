document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach((el, index) => {
    setTimeout(() => el.classList.add('visible'), 80 + index * 120);
  });
});
