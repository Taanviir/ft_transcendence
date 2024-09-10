const form = document.querySelector('[id$="-form"]');
form.addEventListener('submit', async (event) => {
    // TODO: improve this!
    const formType = form.id == 'login-form' ? 'login' : 'register';
    event.preventDefault();
    await submitFormData(form, formType);
});

async function submitFormData(form, action) {
    const usersApiUrl = 'https://localhost:443/api/users';
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${usersApiUrl}/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        console.log('Success!');
        alert('success!')
        // show success message
        // if the form is /register then redirect to log in page
        // if the form is /login then redirect to 2fa

    } catch (error) {
        console.error('There was an issue with the request: ', error);
        alert('Failed to submit the form. Please try again.');
    }
}
