import React from "react";
import GitHubLogo from "../assets/GitHub-Mark-32px.png";

export default function Footer() {
  return (
    <footer className="footer py-2">
      <div className="footer-container container-fluid">
        <a
          href="http://www.recurse.com"
          title="Made with love at the Recurse Center">
          <img
            alt="Recurse Center Logo"
            src="https://cloud.githubusercontent.com/assets/2883345/11322973/9e557144-910b-11e5-959a-8fdaaa4a88c5.png"
            height="12px"
          />
        </a>
        <span className="divider">|</span>
        <a href="https://github.com/jaryncolbert/recurse-world-map">
          <img src={GitHubLogo} alt="Github logo" height="16px" />
          Fork on GitHub
        </a>
      </div>
    </footer>
  );
}
