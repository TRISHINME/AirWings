document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Dummy check for incorrect password
    if (password !== 'correct-password') {
        showError('Incorrect password. Please try again.');
    } else {
        alert('Login successful!');
    }
});

function showError(message) {
    let errorElement = document.querySelector('.error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.classList.add('error');
        document.querySelector('form').insertBefore(errorElement, document.querySelector('button'));
    }
    errorElement.textContent = message;
}
