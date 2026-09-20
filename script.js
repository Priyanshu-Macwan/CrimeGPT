document.addEventListener('DOMContentLoaded', () => {
    const togglePwdBtn = document.getElementById('toggle-pwd-btn');
    const pwdInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggle-pwd-icon');

    if (togglePwdBtn && pwdInput && toggleIcon) {
        togglePwdBtn.addEventListener('click', () => {
            // Toggle the type attribute
            const type = pwdInput.getAttribute('type') === 'password' ? 'text' : 'password';
            pwdInput.setAttribute('type', type);
            
            // Toggle the icon
            if (type === 'text') {
                toggleIcon.classList.remove('ph-eye');
                toggleIcon.classList.add('ph-eye-slash');
            } else {
                toggleIcon.classList.remove('ph-eye-slash');
                toggleIcon.classList.add('ph-eye');
            }
        });
    }

    // Optional form submit behavior
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Basic animation or redirect logic can go here.
            const btn = form.querySelector('.btn-primary');
            const originalText = btn.textContent;
            btn.textContent = 'AUTHENTICATING...';
            btn.style.opacity = '0.8';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.opacity = '1';
                alert('Authentication system ready for integration.');
            }, 1000);
        });
    }
});
