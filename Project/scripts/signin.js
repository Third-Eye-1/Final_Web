const apiUrl = "https://656957d8de53105b0dd6ed65.mockapi.io/api/aha";

const signupForm = document.querySelector(".signup form");
const loginForm = document.querySelector(".login form");
const signupSuccessMessageElement = document.getElementById('signupSuccessMessage');
const errorMessageElement = document.getElementById('errorMessage');

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(signupForm);
  const name = formData.get('fullname');
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const usersResponse = await fetch(`${apiUrl}/user`);
    const users = await usersResponse.json();
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      console.error("Signup failed: Email already exists");
      errorMessageElement.textContent = "Email already exists. Please use a different email.";
    } else {
      const response = await fetch(`${apiUrl}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        console.log("Signup successful");
        signupSuccessMessageElement.textContent = "Signup successful. You can now log in.";
        
        signupForm.reset();
      } else {
        const errorMessage = await response.text();
        console.error("Signup failed:", errorMessage);
        errorMessageElement.textContent = errorMessage;
      }
    }
  } catch (error) {
    console.error("Error during signup:", error);
    errorMessageElement.textContent = "An error occurred during signup.";
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const usersResponse = await fetch(`${apiUrl}/user`);
    const users = await usersResponse.json();

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem('loggedInUserId', user.id);
      localStorage.setItem('loggedInUserName', user.name);

      window.location.href = "task_manager.html"; // Change to the correct URL
    } else {
      console.error("Login failed: Invalid email or password");
      errorMessageElement.textContent = "Invalid email or password. Please try again.";
    }
  } catch (error) {
    console.error("Error during login:", error);
    errorMessageElement.textContent = "An error occurred during login.";
  }
});
