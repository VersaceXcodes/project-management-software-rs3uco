import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { set_auth_token, set_current_user, set_is_authenticated } from "@/store/main";
import axios from "axios";

const UV_Registration: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Local state variables for registration form
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [profile_picture, setProfilePicture] = useState("");
  const [error_message, setErrorMessage] = useState("");
  const [validation_flags, setValidationFlags] = useState({
    is_password_strong: false,
    is_password_match: false,
  });

  // Handle registration form submission
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Basic client side validation
    if (!first_name || !last_name || !email || !password || !confirm_password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirm_password) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // Create payload; default role is "team_member"
    const payload = {
      first_name,
      last_name,
      email,
      password,
      role: "team_member",
      profile_picture_url: profile_picture ? profile_picture : null,
    };

    try {
      const backend_url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      console.log("Attempting to register with backend URL:", backend_url);
      
      // Use axios instead of fetch for better error handling
      const response = await axios.post(`${backend_url}/api/auth/register`, payload);
      
      // Success - response.data will contain token and user
      const { token, user } = response.data;
      dispatch(set_auth_token(token));
      dispatch(set_current_user(user));
      dispatch(set_is_authenticated(true));
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Extract and display the error message from the response if available
      let errorMessage = "Registration failed due to a network error.";
      if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx
        console.log("Error response data:", error.response.data);
        errorMessage = error.response.data.error || "Registration failed. Server responded with an error.";
      } else if (error.request) {
        // The request was made but no response was received
        console.log("Error request:", error.request);
        errorMessage = "Registration failed. No response from server. Please check if the backend server is running at " + 
          (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000");
      }
      
      setErrorMessage(errorMessage);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
          {error_message && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
              {error_message}
            </div>
          )}
          <form onSubmit={handleRegistration}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="first_name">
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="last_name">
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  const newPassword = e.target.value;
                  setPassword(newPassword);
                  setValidationFlags({
                    is_password_strong: newPassword.length >= 8,
                    is_password_match: newPassword === confirm_password,
                  });
                }}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              {!validation_flags.is_password_strong && password && (
                <p className="text-red-600 text-sm mt-1">Password must be at least 8 characters.</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="confirm_password">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm_password"
                value={confirm_password}
                onChange={(e) => {
                  const newConfirm = e.target.value;
                  setConfirmPassword(newConfirm);
                  setValidationFlags({
                    is_password_strong: password.length >= 8,
                    is_password_match: password === newConfirm,
                  });
                }}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              {!validation_flags.is_password_match && confirm_password && (
                <p className="text-red-600 text-sm mt-1">Passwords do not match.</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1" htmlFor="profile_picture">
                Profile Picture URL (optional)
              </label>
              <input
                type="text"
                id="profile_picture"
                value={profile_picture}
                onChange={(e) => setProfilePicture(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Register
              </button>
            </div>
          </form>
          <div className="text-center">
            <p className="text-gray-700">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Registration;