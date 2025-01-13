// Wait until the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Select all "button" links
    const buttons = document.querySelectorAll('.button');
  
    buttons.forEach(btn => {
      // Mouse over => change background and text color
      btn.addEventListener('mouseover', () => {
        btn.style.backgroundColor = '#93c5fd'; // lighter blue
        btn.style.color = '#1e293b';           // dark background color
      });
  
      // Mouse out => revert colors
      btn.addEventListener('mouseout', () => {
        btn.style.backgroundColor = '';
        btn.style.color = '';
      });
    });
  });
  