import React from "react";

export default function LoginButton({ loginFn, logoutFn, isLoggedIn }) {
    const text = isLoggedIn ? "Logout" : "Login";
    const onClick = isLoggedIn ? logoutFn : loginFn;

    return (
        <button
            id="rc-login-btn"
            className="btn btn-primary col-med"
            onClick={onClick}>
            {text}
        </button>
    );
}
